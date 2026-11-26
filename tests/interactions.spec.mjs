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
});

test.describe('dose ladder', () => {
  test('price stays flat while the dose changes', async ({ page }) => {
    await page.goto('/');
    const ladder = page.locator('[data-ladder]');
    const dose = ladder.locator('[data-out="dose"]');
    const price = ladder.locator('[data-out="price"]');
    const range = ladder.locator('[data-month-range]');
    await expect(dose).toHaveText('0.25 mg');
    await expect(price).toContainText('$65');
    await range.fill('5');
    await expect(dose).toHaveText('2.4 mg');
    await expect(price).toContainText('$65');
    await expect(range).toHaveAttribute('aria-valuetext', 'Month 5: 2.4 mg weekly, $65 a month');

    await ladder.getByRole('tab', { name: 'Tirzepatide' }).click();
    await expect(ladder.getByRole('tab', { name: 'Tirzepatide' })).toHaveAttribute('aria-selected', 'true');
    await expect(dose).toHaveText('12.5 mg');
    await expect(price).toContainText('$110');
    await expect(ladder.locator('[data-set="tirzepatide"]')).toBeVisible();
    await expect(ladder.locator('[data-set="semaglutide"]')).toBeHidden();
  });

  test('tabs support arrow keys and bars are clickable', async ({ page }) => {
    await page.goto('/pricing/');
    const ladder = page.locator('[data-ladder]');
    await ladder.getByRole('tab', { name: 'Semaglutide' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(ladder.getByRole('tab', { name: 'Tirzepatide' })).toBeFocused();
    await expect(ladder.getByRole('tab', { name: 'Tirzepatide' })).toHaveAttribute('aria-selected', 'true');
    await ladder.locator('[data-set="tirzepatide"] .ladder__col[data-month="3"] .ladder__bar').click({ force: true });
    await expect(ladder.locator('[data-out="month"]')).toHaveText('3');
    await expect(ladder.locator('[data-out="dose"]')).toHaveText('7.5 mg');
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

  test('before/after slider reveals the illustration', async ({ page }) => {
    await page.goto('/');
    const range = page.locator('[data-compare-range]');
    await range.fill('20');
    await expect(page.locator('.compare__frame')).toHaveAttribute('style', /--pos: 20%/);
    await range.focus();
    await page.keyboard.press('ArrowRight');
    await expect(range).toHaveValue('21');
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
    await expect(page.locator('[data-faq-empty]')).toBeHidden();
  });

  test('category chips filter questions', async ({ page }) => {
    await page.goto('/faq/');
    await page.getByRole('button', { name: 'Delivery and refills' }).click();
    await expect(page.getByRole('button', { name: 'Delivery and refills' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-faq-count]')).toHaveText('3 questions');
    await expect(page.locator('[data-faq-group="billing"]')).toBeHidden();
    await expect(page).toHaveURL(/\?cat=delivery$/);
    await page.reload();
    await expect(page.getByRole('button', { name: 'Delivery and refills' })).toHaveAttribute('aria-pressed', 'true');
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
    await expect(page.locator('[data-contact-form]')).toBeHidden();
    await page.getByRole('button', { name: 'Write another message' }).click();
    await expect(page.locator('[data-contact-form]')).toBeVisible();
    await expect(page.getByLabel('Full name')).toHaveValue('');
  });

  test('support status reflects Eastern Time hours', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-24T15:00:00Z')); // Tuesday 10 a.m. ET
    await page.goto('/contact/');
    await expect(page.locator('[data-open-status]')).toHaveClass(/is-open/);
    await expect(page.locator('[data-open-text]')).toHaveText('Phone support is open now, until 10 p.m. ET');

    await page.clock.setFixedTime(new Date('2026-11-29T17:00:00Z')); // Sunday noon ET
    await page.reload();
    await expect(page.locator('[data-open-status]')).toHaveClass(/is-closed/);
    await expect(page.locator('[data-open-text]')).toHaveText('Phone support is closed. Opens tomorrow at 9 a.m. ET');
  });
});
