/**
 * Click-to-edit text inside a section, on the canvas.
 *
 * Sections render through the same components as the public site, which take
 * plain strings. Rather than changing those components (and the public
 * markup), the editor works on the rendered DOM: the clicked text element is
 * matched back to the prop string it came from, made editable in place, and
 * the edited text is written back to that prop. This is the same technique
 * visual editors such as Puck use for inline text fields.
 *
 * The element is made `contentEditable="true"` — the value Lexical recognises
 * as an input inside a decorator, so it leaves the typing to the browser.
 * Only plain text goes in: pasted formatting is stripped, Enter finishes.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Path = (string | number)[];

/** Props that hold addresses, choices or styles — never visible copy. */
const NOT_TEXT = new Set([
  "src", "href", "url", "youtubeUrl", "linkHref", "backHref", "nextHref", "ctaHref",
  "tone", "style", "variant", "background", "imageSide", "purpose", "format", "align",
  "maxWidth", "ratio", "fit", "html", "design", "width", "height", "mobile", "headingLevel",
  "layout", "color", "id", "alt", "tileColor", "size", "decoration", "level",
]);

interface Candidate {
  path: Path;
  value: string;
  /** For multi-line props (story panels), which line the element shows. */
  line?: number;
}

/** What a stored string looks like once rendered (bold markers removed). */
const shown = (s: string) => s.replace(/\*\*/g, "");
const norm = (s: string) => s.replace(/\s+/g, " ").trim();

function strings(value: unknown, path: Path, out: Candidate[]) {
  if (typeof value === "string") {
    if (value.trim()) out.push({ path, value });
    return;
  }
  if (Array.isArray(value)) value.forEach((v, i) => strings(v, [...path, i], out));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) if (!NOT_TEXT.has(k)) strings(v, [...path, k], out);
}

/** The props a piece of rendered text could have come from, in document order. */
export function candidatesFor(props: Record<string, unknown>, text: string): Candidate[] {
  const all: Candidate[] = [];
  strings(props, [], all);
  const t = norm(text);
  if (!t) return [];
  const exact = all.filter((c) => norm(shown(c.value)) === t);
  if (exact.length) return exact;
  const lines: Candidate[] = [];
  for (const c of all) {
    if (!c.value.includes("\n")) continue;
    c.value.split("\n").forEach((l, i) => {
      if (norm(shown(l)) === t) lines.push({ ...c, line: i });
    });
  }
  return lines;
}

/** The innermost element under the pointer that directly holds text. */
export function textElementAt(target: EventTarget | null, within: HTMLElement): HTMLElement | null {
  let el = target instanceof HTMLElement ? target : (target as Node | null)?.parentElement ?? null;
  while (el && el !== within) {
    const own = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
    if (own) return el;
    el = el.parentElement;
  }
  return null;
}

/** Which of several identical texts in the section this element is. */
export function occurrence(el: HTMLElement, within: HTMLElement): number {
  const t = norm(el.textContent ?? "");
  const same = [...within.querySelectorAll<HTMLElement>("*")].filter(
    (e) => e.childElementCount === el.childElementCount && norm(e.textContent ?? "") === t && textElementAt(e, within) === e
  );
  return Math.max(0, same.indexOf(el));
}

export function getIn(obj: any, path: Path): any {
  return path.reduce((o, k) => (o == null ? o : o[k]), obj);
}

export function setIn<T>(obj: T, path: Path, value: unknown): T {
  if (!path.length) return value as T;
  const [k, ...rest] = path;
  const base: any = Array.isArray(obj) ? [...obj] : { ...(obj as any) };
  base[k] = setIn(base?.[k], rest, value);
  return base;
}

/** The string to store after the element's text was edited. */
export function nextValue(c: Candidate, edited: string): string {
  const clean = edited.replace(/ /g, " ").replace(/\n+/g, " ").trim();
  if (c.line === undefined) return clean;
  const lines = c.value.split("\n");
  lines[c.line] = clean;
  return lines.join("\n");
}

/** What to show while editing: the stored text, with any **bold** markers. */
export function editingText(c: Candidate): string {
  return c.line === undefined ? c.value : c.value.split("\n")[c.line];
}

const STOP = ["keydown", "keyup", "keypress", "beforeinput", "input", "paste", "cut", "copy", "compositionstart", "compositionend", "drop", "dragstart", "mousedown", "click"];

/**
 * Makes `el` editable until it loses focus. Calls `commit` with the new text,
 * or nothing on Escape. Events are kept away from the surrounding Lexical
 * editor so its shortcuts (Backspace deletes the selected section, etc.) do
 * not fire while typing.
 */
export function editInPlace(el: HTMLElement, initial: string, point: { x: number; y: number }, commit: (text: string | null) => void) {
  const original = el.innerHTML;
  el.textContent = initial;
  el.contentEditable = "true";
  el.spellcheck = true;
  el.classList.add("eu-inline-editing");
  el.focus({ preventScroll: true });

  // Caret where the user clicked, like any text editor.
  const doc = el.ownerDocument;
  const range = (doc as any).caretRangeFromPoint?.(point.x, point.y) as Range | null;
  const sel = doc.getSelection();
  if (sel) {
    sel.removeAllRanges();
    if (range && el.contains(range.startContainer)) sel.addRange(range);
    else {
      const r = doc.createRange();
      r.selectNodeContents(el);
      r.collapse(false);
      sel.addRange(r);
    }
  }

  let done = false;
  const finish = (save: boolean) => {
    if (done) return;
    done = true;
    for (const t of STOP) el.removeEventListener(t, stop, true);
    el.removeEventListener("blur", onBlur);
    el.contentEditable = "false";
    el.removeAttribute("contenteditable");
    el.classList.remove("eu-inline-editing");
    const text = el.innerText;
    if (!save) el.innerHTML = original;
    commit(save ? text : null);
  };

  const stop = (e: Event) => {
    e.stopPropagation();
    // Clicking inside text that is also a link must not follow it.
    if (e.type === "click") e.preventDefault();
    if (e.type === "click" || e.type === "mousedown") return;
    if (e.type === "paste") {
      e.preventDefault();
      const text = (e as ClipboardEvent).clipboardData?.getData("text/plain") ?? "";
      doc.execCommand("insertText", false, text.replace(/\s*\n\s*/g, " "));
    }
    if (e.type === "keydown") {
      const k = e as KeyboardEvent;
      if (k.key === "Escape") {
        k.preventDefault();
        finish(false);
      } else if (k.key === "Enter") {
        k.preventDefault();
        finish(true);
      } else if ((k.ctrlKey || k.metaKey) && k.key.toLowerCase() === "a") {
        // Inside the outer editor the browser's select-all would run past
        // this text into the rest of the page; keep it to this text.
        k.preventDefault();
        const r = doc.createRange();
        r.selectNodeContents(el);
        const sel = doc.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);
      } else if ((k.ctrlKey || k.metaKey) && ["b", "i", "u"].includes(k.key.toLowerCase())) {
        k.preventDefault(); // plain text only
      }
    }
    if (e.type === "drop") e.preventDefault();
  };
  const onBlur = () => finish(true);

  for (const t of STOP) el.addEventListener(t, stop, true);
  el.addEventListener("blur", onBlur);
}
