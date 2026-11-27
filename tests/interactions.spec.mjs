import { test, expect } from '@playwright/test';

test.describe('header and promo', () => {
  test('promo bar can be dismissed and stays dismissed', async ({ page }) => {
    await page.goto('/');
    const promo = page.locator('[data-promo]');
    await expect(promo).toBeVisible();
    await page.getByRole('button', { name: 'Dismiss offer banner' }).click();
    await expect(promo).toBeHidden();
    await page.reload();
    await expect(promo).toBeHidden();
  });

  test('current page is marked in the main navigation', async ({ page }) => {
    await page.goto('/pricing/');
    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Pricing' })).toHaveAttribute('aria-current', 'page');
  });

  test('header hides on the way down and returns on the way up', async ({ page }) => {
    await page.goto('/faq/');
    const header = page.locator('[data-header]');
    await page.mouse.move(600, 400);
    for (let i = 0; i < 6; i++) await page.mouse.wheel(0, 300);
    await expect(header).toHaveClass(/is-hidden/);
    await page.mouse.wheel(0, -300);
    await expect(header).not.toHaveClass(/is-hidden/);
    await expect(header).toHaveClass(/is-scrolled/);
  });
});

test.describe('six-month story without motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('shows a readable list and never loads the motion layer', async ({ page }) => {
    const chunks = [];
    page.on('request', (r) => r.url().includes('/chunks/motion-') && chunks.push(r.url()));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const list = page.locator('[data-journey-list]');
    await expect(list).toBeVisible();
    await expect(list.locator('li')).toHaveCount(7);
    await expect(page.locator('[data-journey-stage]')).toBeHidden();
    expect(chunks).toEqual([]);
  });

  test('the medication switch updates every dose and price', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-step-dose="5"]')).toHaveText('2.4 mg');
    await page.locator('[data-journey]').getByRole('button', { name: 'Tirzepatide' }).click();
    await expect(page.locator('[data-journey]').getByRole('button', { name: 'Tirzepatide' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-step-dose="5"]')).toHaveText('12.5 mg');
    await expect(page.locator('[data-step-dose="0"]')).toHaveText('None yet');
    await expect(page.locator('[data-step-price]').first()).toHaveText('$110/mo');
    await expect(page.locator('[data-price-value]')).toHaveText('$110');
    await expect(page.locator('[data-price-sum]')).toContainText('$660 in total');
  });
});

test.describe('six-month story with motion', () => {
  test.use({ reducedMotion: 'no-preference', viewport: { width: 1440, height: 900 } });

  test('scrolling steps through the months while the price stays locked', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.documentElement.classList.contains('motion-ready'));
    await expect(page.locator('[data-journey]')).toHaveClass(/is-live/);
    // The readable list stays in the page for screen readers.
    await expect(page.locator('[data-journey-list] li')).toHaveCount(7);
    const top = await page.evaluate(() => document.querySelector('[data-journey-stage]').parentElement.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y - 200), top);
    await page.mouse.move(700, 450);
    const months = new Set();
    for (let i = 0; i < 16; i++) {
      await page.mouse.wheel(0, 260);
      await page.waitForTimeout(350);
      months.add(await page.locator('[data-hud-month]').textContent());
      await expect(page.locator('[data-hud-price]')).toHaveText('$65');
    }
    expect([...months]).toEqual(expect.arrayContaining(['Month 1', 'Month 3', 'Month 6']));
    await expect(page.locator('[data-stage-dose]')).toHaveText('2.4 mg');
  });

  test('switching to tirzepatide updates the ring and the locked price', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => document.documentElement.classList.contains('motion-ready'));
    await page.locator('[data-journey]').getByRole('button', { name: 'Tirzepatide' }).click();
    await expect(page.locator('[data-hud-price]')).toHaveText('$110');
  });

  test('how it works travels sideways on desktop', async ({ page }) => {
    await page.goto('/how-it-works/');
    await page.waitForFunction(() => document.documentElement.classList.contains('motion-ready'));
    await expect(page.locator('[data-steps]')).toHaveClass(/is-horizontal/);
    const track = page.locator('[data-steps-track]');
    const before = await track.evaluate((el) => el.getBoundingClientRect().left);
    const top = await page.locator('[data-steps]').evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await page.evaluate((y) => window.scrollTo(0, y + 600), top);
    await expect.poll(() => track.evaluate((el) => el.getBoundingClientRect().left)).toBeLessThan(before - 200);
  });
});

test.describe('15% estimate', () => {
  test('slider, number field and units stay in sync', async ({ page }) => {
    await page.goto('/');
    const est = page.locator('[data-estimate]');
    await est.locator('[data-weight-range]').fill('300');
    await expect(est.locator('[data-out="loss"]')).toHaveText('45');
    await expect(est.locator('[data-out="goal"]')).toHaveText('255');
    await expect(est.locator('[data-weight-number]')).toHaveValue('300');
    await est.locator('[data-weight-number]').fill('200');
    await expect(est.locator('[data-out="loss"]')).toHaveText('30');
    await expect(est.locator('[data-weight-range]')).toHaveValue('200');
    await est.getByLabel('kg').check({ force: true });
    await expect(est.locator('[data-weight-number]')).toHaveValue('91');
    await expect(est.locator('[data-out="loss"]')).toHaveText('14');
    await expect(est.locator('[data-range-text]')).toHaveText('64 to 181 kg');
  });
});

test.describe('FAQ', () => {
  test('search filters, highlights and shows an empty state', async ({ page }) => {
    await page.goto('/faq/');
    const count = page.locator('[data-faq-count]');
    await expect(count).toHaveText('21 questions');
    await page.getByLabel('Search questions').fill('refund');
    await expect(count).toHaveText(/questions? match(es)? “refund”/);
    await expect(page.locator('[data-faq]:visible mark').first()).toBeVisible();
    await expect(page.locator('#refunds')).toBeVisible();
    await expect(page.locator('#shipping')).toBeHidden();
    await page.getByLabel('Search questions').fill('zzqx');
    await expect(page.locator('[data-faq-empty]')).toBeVisible();
    await page.locator('[data-faq-empty]').getByRole('button', { name: 'Clear search' }).click();
    await expect(count).toHaveText('21 questions');
  });

  test('category chips filter questions and are kept in the URL', async ({ page }) => {
    await page.goto('/faq/');
    await page.getByRole('button', { name: 'Delivery and refills' }).click();
    await expect(page.getByRole('button', { name: 'Delivery and refills' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-faq-count]')).toHaveText('3 questions');
    await expect(page.locator('[data-faq-group="billing"]')).toBeHidden();
    await expect(page).toHaveURL(/\?cat=delivery$/);
    await page.reload();
    await expect(page.locator('[data-faq-count]')).toHaveText('3 questions');
  });

  test('deep links open the matching answer', async ({ page }) => {
    await page.goto('/faq/#cancel');
    await expect(page.locator('#cancel')).toHaveAttribute('open', '');
    await expect(page.locator('#cancel .faq__a')).toBeVisible();
  });
});

test.describe('contact form', () => {
  test('shows errors for empty and invalid fields', async ({ page }) => {
    await page.goto('/contact/');
    await page.getByRole('button', { name: 'Send message' }).click();
    const summary = page.locator('[data-error-summary]');
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary.locator('li')).toHaveCount(5);
    await expect(page.locator('#cf-email')).toHaveAttribute('aria-invalid', 'true');
    await page.getByLabel('Email').fill('not-an-email');
    await page.getByLabel('Email').blur();
    await expect(page.locator('#cf-email-err')).toHaveText('Enter an email address like name@example.com.');
    await summary.getByRole('link', { name: 'Enter your full name.' }).click();
    await expect(page.locator('#cf-name')).toBeFocused();
  });

  test('a valid message opens the email app and shows confirmation', async ({ page }) => {
    await page.goto('/contact/');
    await page.getByLabel('Full name').fill('Test Person');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Topic').selectOption('delivery');
    await page.getByLabel('Message', { exact: true }).fill('My package has not arrived yet.');
    await expect(page.locator('[data-count]')).toHaveText('31');
    await page.getByLabel('I understand this form is not for medical questions or emergencies.').check();
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.locator('[data-contact-success]')).toBeVisible();
    await page.getByRole('button', { name: 'Write another message' }).click();
    await expect(page.locator('[data-contact-form]')).toBeVisible();
    await expect(page.getByLabel('Full name')).toHaveValue('');
  });

  test('support status reflects Eastern Time hours', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-24T15:00:00Z'));
    await page.goto('/contact/');
    await expect(page.locator('[data-open-status]')).toHaveClass(/is-open/);
    await expect(page.locator('[data-open-text]')).toHaveText('Phone support is open now, until 10 p.m. ET');
    await page.clock.setFixedTime(new Date('2026-11-29T17:00:00Z'));
    await page.reload();
    await expect(page.locator('[data-open-status]')).toHaveClass(/is-closed/);
    await expect(page.locator('[data-open-text]')).toHaveText('Phone support is closed. Opens tomorrow at 9 a.m. ET');
  });
});
