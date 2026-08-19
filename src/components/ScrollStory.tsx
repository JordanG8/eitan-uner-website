import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { ImageRef, ScrollStoryBlock, StoryPanel } from "@/lib/types";
import { CtaRow } from "./site";

/**
 * The homepage, as a scroll.
 *
 * The brief was that a reader should arrive knowing nothing about
 * photodocutherapy and leave understanding it, having read no explanation —
 * only having scrolled. So the page does not describe the method, it runs the
 * method's opening exercise on the reader: it shows them a photograph they
 * already have a feeling about, then a photograph they do not, then tells them
 * what the difference was.
 *
 * ── Why there is no JavaScript in here ────────────────────────────────────
 *
 * Every scroll effect on this page is a CSS scroll-driven animation: a named
 * `view-timeline` on each act, and `animation-timeline` on the things inside
 * it. No scroll listener, no IntersectionObserver, no rAF loop, no hydration —
 * this file is a server component and ships zero client JS. That matters for
 * more than bundle size: scroll-linked motion driven from JS runs on the main
 * thread a frame behind the compositor, and on a page that is *entirely*
 * scroll-linked that reads as smear. The CSS versions run off the main thread.
 *
 * ── Why the static version is the real version ────────────────────────────
 *
 * All of the choreography lives inside one
 * `@supports (animation-timeline: view())` + `prefers-reduced-motion` block in
 * globals.css. Nothing in the markup depends on it. A browser without
 * scroll-timelines, or a reader who has asked their OS for less motion, gets
 * the same eight acts as a stack of full-bleed editorial panels with every
 * word and every photograph present and legible. That is the whole
 * accessibility story for this page, and it is why the base stylesheet
 * describes a finished design rather than a pile of `opacity: 0`.
 *
 * ── The through-line ──────────────────────────────────────────────────────
 *
 * One object recurs and changes: `.pdt-print`, a white photographic border.
 * It arrives small and tilted around a family snapshot, straightens and grows,
 * bursts its border to become the full screen, comes back multiplied across a
 * workshop table, and finally lines up as a row of single-word feelings. It is
 * the only motif, and it is the thing the method is about.
 */

/* ------------------------------------------------------------------ atoms */

/** Positional CSS custom properties, typed so React accepts them. */
type Vars = CSSProperties & Record<`--${string}`, string | number>;

/**
 * One beat of copy.
 *
 * `--r0`/`--r1` are this panel's slice of its act's scroll, written here
 * rather than computed in CSS: `animation-range` takes a percentage, and
 * emitting the resolved number from the component avoids depending on `calc()`
 * inside `animation-range` with unregistered custom properties, which is the
 * one part of this spec browsers disagree about.
 */
function Panel({
  panel,
  index,
  count,
  first = false,
  align = "center",
}: {
  panel: StoryPanel;
  index: number;
  count: number;
  first?: boolean;
  align?: "center" | "start";
}) {
  const style: Vars = {
    "--r0": `${((index / count) * 100).toFixed(3)}%`,
    "--r1": `${(((index + 1) / count) * 100).toFixed(3)}%`,
  };

  return (
    <div
      className={`pdt-panel pdt-panel--${align}`}
      style={style}
      data-first={first ? "" : undefined}
    >
      {panel.kicker ? <p className="pdt-kicker">{panel.kicker}</p> : null}
      <p className="pdt-lines">
        {panel.lines.map((line, i) => (
          <span key={i} className="pdt-line">
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}

/**
 * The motif. A photograph inside a physical print border.
 *
 * The border is `padding` on the wrapper rather than a CSS `border`, because
 * a real print's bottom margin is deeper than its other three and that
 * asymmetry is most of why the object reads as an object.
 */
function Print({
  image,
  sizes,
  className = "",
  style,
  priority = false,
  children,
}: {
  image: ImageRef;
  sizes: string;
  className?: string;
  style?: Vars;
  priority?: boolean;
  children?: ReactNode;
}) {
  return (
    <figure className={`pdt-print ${className}`} style={style}>
      <div
        className="pdt-print-window"
        style={{ "--ratio": `${image.width ?? 4} / ${image.height ?? 3}` } as Vars}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="pdt-print-img"
        />
      </div>
      {children}
    </figure>
  );
}

/** A full-bleed photograph pinned behind an act. */
function Bleed({
  image,
  className = "",
  priority = false,
}: {
  image: ImageRef;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`pdt-bleed ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="100vw"
        priority={priority}
        className="pdt-bleed-img"
      />
    </div>
  );
}

/**
 * One act: a scroll-length section whose stage pins while its copy changes.
 *
 * `--acts` is the number of copy beats, and it sets the section's height, so
 * a two-beat act is not given the same scroll distance as a four-beat one.
 * 110vh per beat plus one viewport of pin — measured rather than guessed: less
 * than that and a beat is gone before a normal wheel gesture finishes reading
 * it, more and the page feels like it has stopped responding.
 */
function Act({
  name,
  beats,
  band = false,
  vars,
  children,
}: {
  name: string;
  beats: number;
  /** Subject in the upper row, words in a band beneath. Never overlapping. */
  band?: boolean;
  vars?: Vars;
  children: ReactNode;
}) {
  return (
    <section
      className={`pdt-act pdt-act--${name}`}
      style={{ "--beats": beats, ...vars } as Vars}
    >
      <div className={`pdt-stage${band ? " pdt-stage--band" : ""}`}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ story */

export function ScrollStory({ block }: { block: ScrollStoryBlock }) {
  const { memory, vista, define, room, feelings, host, ask } = block;

  /** The turn is one continuous shot; see the note at the vista act below. */
  const vistaPanels = [...vista.cold, ...vista.warm];
  /* Where in the act the grade begins to turn — the boundary between the two
     authored runs, handed to CSS so the bloom is timed to the words rather
     than to a number someone has to remember to keep in step. */
  const turn = vista.cold.length / Math.max(vistaPanels.length, 1);

  return (
    <div className="pdt">
      {/*
        The header watches for this attribute to invert itself over a dark
        fold. It wraps only the dark acts, so the header returns to ink on
        paper exactly when the page does — at the ask.
      */}
      <div className="pdt-dark" data-hero-dark="">
        {/* The turquoise through-line. One accent, drawn once, the whole way
            down — the only chrome the narrative has. */}
        <div className="pdt-rail" aria-hidden="true">
          <span className="pdt-rail-fill" />
        </div>

        {/* ─────────────────────────────────── I. the print you already own */}
        <Act name="memory" beats={memory.panels.length} band>
          <div className="pdt-memory-field" aria-hidden="true" />
          <Print
            image={memory.image}
            priority
            sizes="(max-width: 640px) 78vw, (max-width: 1024px) 52vw, 40vw"
            className="pdt-print--memory"
          />
          <div className="pdt-copy pdt-copy--memory">
            {memory.panels.map((p, i) => (
              <Panel
                key={i}
                panel={p}
                index={i}
                count={memory.panels.length}
                first={i === 0}
              />
            ))}
          </div>
        </Act>

        {/* ───────────────────── II. one photograph, and the turn inside it */}
        {/*
          `cold` and `warm` are two runs of copy over ONE act and ONE
          <Bleed>, not two acts. They were two for one build, and the seam
          between them was fatal to the argument: at the boundary a reader saw
          the vista slide up, a band of black, and the vista arrive again —
          which says "here is a second photograph" at exactly the moment the
          page is claiming nothing about the photograph has changed. The
          content model keeps them as two lists because they are two halves of
          a turn and Eitan edits them as such; the page never cuts.
        */}
        <Act
          name="vista"
          beats={vistaPanels.length}
          vars={{ "--turn": turn.toFixed(4) }}
        >
          <Bleed image={vista.image} className="pdt-bleed--vista" />
          <div className="pdt-copy">
            {vistaPanels.map((p, i) => (
              <Panel key={i} panel={p} index={i} count={vistaPanels.length} />
            ))}
          </div>
        </Act>

        {/* ───────────────────────────────────────────── IV. the word for it */}
        <Act name="define" beats={define.panels.length} band>
          <Bleed image={define.image} className="pdt-bleed--define" />
          <h2 className="pdt-term">{define.term}</h2>
          <div className="pdt-copy pdt-copy--define">
            {define.panels.map((p, i) => (
              <Panel key={i} panel={p} index={i} count={define.panels.length} />
            ))}
          </div>
        </Act>

        {/* ────────────────────────────────── V. the table. one print, many */}
        <Act name="room" beats={room.panels.length} band>
          <div className="pdt-scatter">
            <Print
              image={room.image}
              sizes="(max-width: 768px) 84vw, 48vw"
              className="pdt-print--room-a"
            />
            <Print
              image={room.inset}
              sizes="(max-width: 768px) 40vw, 22vw"
              className="pdt-print--room-b"
            />
          </div>
          <div className="pdt-copy pdt-copy--room">
            {room.panels.map((p, i) => (
              <Panel
                key={i}
                panel={p}
                index={i}
                count={room.panels.length}
                align="start"
              />
            ))}
          </div>
        </Act>

        {/* ──────────────────────────────────────────── VI. the river of words */}
        <section
          className="pdt-act pdt-act--river"
          style={{ "--cards": feelings.items.length } as Vars}
        >
          <div className="pdt-stage pdt-stage--river">
            <header className="pdt-river-head">
              {feelings.kicker ? (
                <p className="pdt-kicker">{feelings.kicker}</p>
              ) : null}
              <h2 className="pdt-river-title">{feelings.title}</h2>
            </header>
            {/*
              Horizontal travel driven by vertical scroll. The sign is flipped
              through --dir (globals.css) because the track is laid out RTL:
              in Hebrew the next card is to the *left*, so "forward" is the
              opposite translation from the LTR version of this effect.
            */}
            <ul className="pdt-river">
              {feelings.items.map((f, i) => (
                <li key={i} className="pdt-river-item">
                  <Print
                    image={f.image}
                    sizes="(max-width: 768px) 62vw, 26vw"
                    className="pdt-print--river"
                  >
                    <figcaption className="pdt-word">{f.word}</figcaption>
                  </Print>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─────────────────────────────────────────────── VII. who runs it */}
        <Act name="host" beats={host.panels.length}>
          <div className="pdt-host">
            <div className="pdt-host-figure">
              <Image
                src={host.image.src}
                alt={host.image.alt}
                width={host.image.width ?? 1038}
                height={host.image.height ?? 2048}
                sizes="(max-width: 768px) 68vw, 34vw"
                className="pdt-host-img"
              />
            </div>
            <div className="pdt-host-copy">
              <p className="pdt-kicker">{host.role}</p>
              <h2 className="pdt-host-name">{host.name}</h2>
              <div className="pdt-copy pdt-copy--host">
                {host.panels.map((p, i) => (
                  <Panel
                    key={i}
                    panel={p}
                    index={i}
                    count={host.panels.length}
                    align="start"
                  />
                ))}
              </div>
            </div>
          </div>
        </Act>
      </div>

      {/* ───────────────────────────────────────────────── VIII. the ask */}
      <section className="pdt-ask">
        <div className="pdt-ask-inner">
          {ask.kicker ? <p className="pdt-kicker pdt-kicker--ink">{ask.kicker}</p> : null}
          <h2 className="pdt-ask-title">{ask.title}</h2>
          <div className="pdt-ask-body">
            {ask.body.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <CtaRow ctas={ask.ctas} />
        </div>
      </section>
    </div>
  );
}
