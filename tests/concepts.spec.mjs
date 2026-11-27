import { test, expect } from '@playwright/test';

const concepts = ['a-itemized', 'b-big-color', 'c-six-months', 'd-plan-builder'];

test('design directions index links to every prototype', async ({ page, request }) => {
  await page.goto('/concepts/');
  await expect(page.locator('h1')).toHaveText('Four new design directions for Livbetr');
  for (const c of concepts) {
    await expect(page.locator(`a[href="${c}/"]`)).toHaveCount(1);
    expect((await request.get(`/concepts/${c}/`)).status()).toBe(200);
  }
  const broken = await page.$$eval('img', (imgs) => imgs.filter((i) => !i.complete || i.naturalWidth === 0).length);
  expect(broken).toBe(0);
});

for (const c of concepts) {
  test(`${c} loads without errors or sideways scroll`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text()) && errors.push(m.text()));
    await page.goto(`/concepts/${c}/`);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('A: the receipt reprints for tirzepatide', async ({ page }) => {
  await page.goto('/concepts/a-itemized/');
  await page.getByRole('button', { name: 'Tirzepatide' }).click();
  await expect(page.locator('[data-total]')).toHaveText('$110.00');
  await expect(page.locator('[data-med-name]')).toHaveText('Compounded tirzepatide');
});

test('B: the insurance switch answers', async ({ page }) => {
  await page.goto('/concepts/b-big-color/');
  await page.getByRole('switch', { name: 'Insurance required' }).click();
  await expect(page.locator('[data-switch-msg]')).toHaveText('Nope, still not required.');
  await expect(page.getByRole('switch', { name: 'Insurance required' })).toHaveAttribute('aria-checked', 'false');
});

test('C: the story steps through months and keeps the price', async ({ page }) => {
  await page.goto('/concepts/c-six-months/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, document.querySelector('[data-journey]').getBoundingClientRect().top + window.scrollY + window.innerHeight * 2.2));
  await expect(page.locator('[data-big]')).not.toHaveText('00');
  await expect(page.locator('[data-hud]')).toHaveClass(/is-on/);
  await expect(page.locator('[data-hud-price]')).toHaveText('$65');
});

test('C: reduced motion shows the months as a list', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4173/concepts/c-six-months/');
  await expect(page.locator('[data-journey]')).toHaveClass(/journey--static/);
  await expect(page.locator('[data-static-list] li')).toHaveCount(7);
  await ctx.close();
});

test('D: switching medication and length updates the plan', async ({ page }) => {
  await page.goto('/concepts/d-plan-builder/');
  await expect(page.locator('[data-k="total"]')).toHaveText('$390');
  await page.getByText('Tirzepatide', { exact: false }).first().click();
  await page.getByText('12 months').click();
  await expect(page.locator('[data-k="price"]')).toHaveText('$110');
  await expect(page.locator('[data-k="total"]')).toHaveText('$1,320');
  await page.locator('[data-month]').fill('3');
  await expect(page.locator('[data-r="dose"]')).toHaveText('7.5 mg');
  await expect(page.locator('[data-r="paid"]')).toHaveText('$330');
  await expect(page.locator('[data-ship] li')).toHaveCount(5);
});
