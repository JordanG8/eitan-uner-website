import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pages, stories } from '../../src/lib/content';

async function visit(page: Page, route: string) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' });
  expect(response?.status()).toBe(200);
  await page.evaluate(() => document.fonts.ready);
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual((page.viewportSize()?.width ?? 0) + 1);
}

const routes = [...pages.map(p => p.slug === '/' ? '/' : `/${p.slug}`), ...stories.map(s => `/סיפורים-מאחורי-המצלמה/${s.slug}`)];
for (const route of routes) {
  test(`route, semantics and accessibility: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await visit(page, route);
    await expect(page.locator('main h1')).toHaveCount(1);
    await noOverflow(page);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(decodeURIComponent(new URL(canonical!).pathname)).toBe(route);
    const footerLinks = await page.locator('footer nav a').evaluateAll(es => es.map(e => e.getAttribute('href')));
    expect(footerLinks).toHaveLength(18);
    expect(new Set(footerLinks).size).toBe(18);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    expect(result.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('menu contrast, promoted contact, keyboard containment and return focus', async ({ page }) => {
  await visit(page, '/');
  const opener = page.getByRole('button', { name: 'תפריט — פתיחה' });
  await opener.click();
  const menu = page.getByRole('dialog', { name: 'תפריט האתר' });
  await expect(page.getByRole('button', { name: 'סגירה — תפריט האתר' })).toBeFocused();
  const contact = menu.getByRole('link', { name: 'צרו קשר', exact: true });
  await expect(contact).toBeInViewport();
  expect((await new AxeBuilder({ page }).include('#site-menu').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press('Shift+Tab');
  expect(await menu.evaluate(e => e.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'סגירה — תפריט האתר' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  await expect(opener).toHaveAttribute('aria-expanded', 'false');
});

test('gallery zoom, navigation, contextual enquiry, Escape and focus return', async ({ page }) => {
  await visit(page, '/תמונות-לרכישה');
  const opener = page.getByRole('button', { name: /^הגדלת הצילום:/ }).first();
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: /סגירה/ })).toBeFocused();
  await expect(dialog.getByRole('status')).toContainText('1 מתוך 12');
  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByRole('status')).toContainText('2 מתוך 12');
  await expect(dialog.getByRole('heading')).toHaveText('דקלים בשקיעה מול עננים');
  const enquiry = dialog.getByRole('link', { name: /לבירור על רכישת/ });
  const href = await enquiry.getAttribute('href');
  expect(new URL(href!).searchParams.get('text')).toContain('EU-PALMS-DUSK');
  expect((await new AxeBuilder({ page }).include('dialog').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(e => e.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(opener).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('small-screen testimonial remains readable and exposes the full quote', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await visit(page, '/המלצות');
  await page.getByRole('button', { name: 'ההמלצה הבאה' }).click();
  expect((await page.locator('blockquote').boundingBox())!.width).toBeGreaterThanOrEqual(230);
  await expect(page.getByRole('status')).toContainText('2 מתוך 2');
  const expand = page.getByRole('button', { name: 'לקריאת ההמלצה המלאה' });
  await expand.click();
  await expect(page.locator('blockquote')).toContainText('תודה על ההשראה והכוח');
  await expect(page.getByRole('button', { name: 'סגירת ההמלצה המלאה' })).toHaveAttribute('aria-expanded', 'true');
  for (const button of await page.locator('main button').all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await noOverflow(page);
});

test('mobile contact actions precede the map and fit the first screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await visit(page, '/צרו-קשר');
  for (const href of ['tel:', 'mailto:', 'https://wa.me/']) {
    const link = page.locator(`main a[href^="${href}"]`).first();
    await expect(link).toBeInViewport();
    const rect = await link.boundingBox();
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(568);
  }
  await noOverflow(page);
});

test('short viewports and enlarged text keep story photographs separate from copy', async ({ page }) => {
  await visit(page, '/');
  for (const [width, height, scale] of [[320,568,1],[390,664,1],[390,844,1],[844,390,1],[640,900,2],[1440,900,2]]) {
    await page.setViewportSize({ width, height });
    await page.evaluate(scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }, scale);
    for (const [subject, copy] of [['.pdt-print--memory', '.pdt-copy--memory'], ['.pdt-scatter', '.pdt-copy--room']]) {
      const geometry = await page.evaluate(({ subject, copy }) => {
        const a = document.querySelector(subject)!.getBoundingClientRect();
        const b = document.querySelector(copy)!.getBoundingClientRect();
        return { bottom: a.bottom, top: b.top, stage: getComputedStyle(document.querySelector(subject)!.closest('.pdt-stage')!).position };
      }, { subject, copy });
      expect(geometry.stage, `${width}x${height} at ${scale}x`).not.toBe('sticky');
      expect(geometry.bottom, `${subject} at ${width}x${height}/${scale}`).toBeLessThan(geometry.top);
    }
    await noOverflow(page);
  }
});

test('feeling captions fit their prints with reduced motion and enlarged text', async ({ page }) => {
  await visit(page, '/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 568 });
  for (const scale of [1, 2]) {
    await page.evaluate(scale => { document.documentElement.style.fontSize = `${scale * 100}%`; }, scale);
    const captions = await page.locator('.pdt-word').evaluateAll(es => es.map(e => {
      const range = document.createRange(); range.selectNodeContents(e);
      return { text: range.getBoundingClientRect().toJSON(), figure: e.closest('figure')!.getBoundingClientRect().toJSON() };
    }));
    expect(captions).toHaveLength(6);
    for (const item of captions) expect(item.text.bottom).toBeLessThanOrEqual(item.figure.bottom + 1);
  }
});

test('FAQ headings, service-specific enquiries and descriptive video fallback', async ({ page }) => {
  await visit(page, '/אממם-יש-לי-שאלה');
  await expect(page.locator('main h2').filter({ hasText: /\?/ })).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'יש לי שאלה לאיתן' })).toHaveAttribute('href', '/צרו-קשר');
  for (const slug of ['פוטודוקותרפיה', 'ארגונים', 'חינוך-וחינוך-בלתי-פורמלי', 'הרצאות']) {
    await visit(page, `/${slug}`);
    const link = page.locator('main a[href*="wa.me/"][href*="text="]').first();
    await expect(link).toBeVisible();
    expect(new URL((await link.getAttribute('href'))!).searchParams.get('text')!.length).toBeGreaterThan(30);
  }
  await visit(page, '/פסטיבל-הצילום-הבינלאומי');
  await expect(page.locator('iframe[src*="youtube"]')).toHaveAttribute('title', 'הנכות השקופה — קהילת אור וצילום חברתי');
  await expect(page.getByRole('link', { name: 'לצפייה בסרטון ב־YouTube' })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=6qY1sUxQMFI');
});

test('cinematic desktop photographs stay clear of every visible copy beat', async ({ page }) => {
  await visit(page, '/');
  for (const [width, height] of [[1024, 900], [1440, 900], [1920, 800]]) {
    await page.setViewportSize({ width, height });
    for (const scene of ['memory', 'room']) {
      const act = page.locator(`.pdt-act--${scene}`);
      for (const fraction of [0.18, 0.35, 0.6, 0.75]) {
        await act.evaluate((e, fraction) => scrollTo({ top: e.getBoundingClientRect().top + scrollY + (e.clientHeight - (innerHeight - 96)) * fraction, behavior: 'instant' }), fraction);
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        const gap = await act.evaluate(e => {
          const bottoms = [...e.querySelectorAll('.pdt-print')].filter(x => Number(getComputedStyle(x).opacity) > 0.1).map(x => x.getBoundingClientRect().bottom);
          const tops = [...e.querySelectorAll('.pdt-panel')].filter(x => Number(getComputedStyle(x).opacity) > 0.9).map(x => x.getBoundingClientRect().top);
          return Math.min(...tops) - Math.max(...bottoms);
        });
        expect(gap, `${scene}, ${width}x${height}, beat ${fraction}`).toBeGreaterThan(8);
      }
    }
  }
});
