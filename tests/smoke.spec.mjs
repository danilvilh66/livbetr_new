import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { path: '/', h1: 'Weight-loss care, priced honestly.' },
  { path: '/how-it-works/', h1: 'From eligibility check to your front door' },
  { path: '/pricing/', h1: 'One monthly price. Every dose.' },
  { path: '/eligibility/', h1: 'See if GLP-1 medication could be right for you' },
  { path: '/faq/', h1: 'Questions, answered plainly' },
  { path: '/contact/', h1: 'Let’s get you the right help' },
];

for (const p of pages) {
  test.describe(`page ${p.path}`, () => {
    test('loads with no console errors, one h1 and complete meta', async ({ page }) => {
      const errors = [];
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(e.message));
      const res = await page.goto(p.path);
      expect(res.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(p.h1);
      await expect(page).toHaveTitle(/Livbetr/);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{60,}/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\/www\.livbetr\.com\//);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await page.waitForLoadState('networkidle');
      expect(errors).toEqual([]);
    });

    test('every image has alt text and loads', async ({ page }) => {
      await page.goto(p.path);
      const imgs = page.locator('img');
      const n = await imgs.count();
      for (let i = 0; i < n; i += 1) {
        const img = imgs.nth(i);
        expect(await img.getAttribute('alt'), `img ${i} alt`).not.toBeNull();
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth > 0)).toBe(true);
      }
    });

    test('has no WCAG 2.2 AA accessibility violations', async ({ page }) => {
      await page.goto(p.path);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
      expect(summary).toEqual([]);
    });

    test('internal links and in-page anchors resolve', async ({ page, request }) => {
      await page.goto(p.path);
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => ({ href: a.href, raw: a.getAttribute('href') })));
      const internal = [...new Set(hrefs.filter((h) => h.href.startsWith('http://localhost:4173')).map((h) => h.href.split('#')[0]))];
      for (const url of internal) {
        const res = await request.get(url);
        expect(res.status(), url).toBe(200);
      }
      const anchors = hrefs.filter((h) => h.raw.startsWith('#') && h.raw.length > 1).map((h) => h.raw.slice(1));
      for (const id of anchors) {
        await expect(page.locator(`[id="${id}"]`), `#${id}`).toHaveCount(1);
      }
    });
  });
}

test('unknown URLs return the branded 404 page', async ({ page }) => {
  const res = await page.goto('/does-not-exist/');
  expect(res.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('This page isn’t here');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});

test('sitemap, robots and manifest are served', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('https://www.livbetr.com/pricing/');
  expect(sitemap).not.toContain('404');
  expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap:');
  const manifest = await (await request.get('/site.webmanifest')).json();
  expect(manifest.name).toBe('Livbetr');
  for (const icon of manifest.icons) expect((await request.get(`/${icon.src}`)).status()).toBe(200);
});
