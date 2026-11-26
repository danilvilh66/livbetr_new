import { test, expect } from '@playwright/test';

const paths = ['/', '/how-it-works/', '/pricing/', '/eligibility/', '/faq/', '/contact/'];

for (const path of paths) {
  test(`no horizontal scrolling on ${path}`, async ({ page }) => {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test('mobile menu opens, traps focus and closes with Escape', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile menu only exists on small screens');
  await page.goto('/');
  const toggle = page.locator('[data-menu-toggle]');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  const menu = page.locator('#mobile-menu');
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  const viewport = page.viewportSize();
  expect(box.height).toBeGreaterThan(viewport.height * 0.6);
  await expect(menu.getByRole('link', { name: 'Check my eligibility' })).toBeInViewport();
  await expect(menu.getByRole('link', { name: 'Home' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(toggle).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(toggle).toBeFocused();

  await toggle.click();
  await menu.getByRole('link', { name: 'Pricing' }).click();
  await expect(page).toHaveURL(/\/pricing\/$/);
});

test('tap targets are at least 24px', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Checked on the mobile project');
  for (const path of paths) {
    await page.goto(path);
    const small = await page.$$eval('a, button, input, select, summary', (els) =>
      els
        .filter((el) => el.offsetParent !== null && !el.closest('.option, .visually-hidden, .site-footer__legal, p, li.review, .fine, .lead, dd'))
        .map((el) => ({ el: el.outerHTML.slice(0, 80), r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 0 && (r.width < 24 || r.height < 24))
        .map(({ el, r }) => `${el} ${Math.round(r.width)}x${Math.round(r.height)}`),
    );
    expect(small, path).toEqual([]);
  }
});
