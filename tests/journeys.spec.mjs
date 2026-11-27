import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OLD_HOSTS = /(href|action)="https?:\/\/(www\.)?(livbetr\.com|intake\.livbetr\.com|livbetr\.eonpro\.io)/;

const htmlFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === 'concepts' ? [] : htmlFiles(p);
    return name.endsWith('.html') ? [p] : [];
  });

test('no link or form on the site sends people to the old site or other apps', () => {
  const offenders = [];
  for (const file of htmlFiles('docs')) {
    const html = readFileSync(file, 'utf8').replace(/<link [^>]*>|<meta [^>]*>/g, '');
    if (OLD_HOSTS.test(html)) offenders.push(file);
  }
  expect(offenders).toEqual([]);
});

test.describe('eligibility to intake', () => {
  test('continuing from the results opens the intake with answers filled in', async ({ page }) => {
    await page.goto('/eligibility/');
    await page.getByText('21 to 50 lb', { exact: true }).click();
    await page.getByLabel('State').selectOption({ label: 'Florida' });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Age in years').fill('42');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Feet').fill('5');
    await page.getByLabel('Inches').fill('6');
    await page.getByLabel('Weight (lb)').fill('210');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('[data-step]:not([hidden])').getByText('High blood pressure').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('[data-step]:not([hidden])').getByText('None of these').click();
    await page.getByRole('button', { name: 'See my results' }).click();
    await page.getByRole('link', { name: 'Continue with tirzepatide' }).click();

    await expect(page).toHaveURL(/\/start\/\?treatment=tirzepatide/);
    await expect(page.locator('[data-sum-med]')).toHaveText('Tirzepatide');
    await expect(page.locator('input[name="medication"][value="tirzepatide"]')).toBeChecked();
    await expect(page.getByLabel('Height (ft)')).toHaveValue('5');
    await expect(page.getByLabel('Weight (lb)')).toHaveValue('210');
    await expect(page.locator('#in-state')).toHaveValue('FL');
  });
});

const fillIntake = async (page, { dob = '1985-04-12', safety = 'None of these' } = {}) => {
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('First name').fill('Anna');
  await page.getByLabel('Last name').fill('Smith');
  await page.getByLabel('Date of birth').fill(dob);
  await page.getByText('Female', { exact: true }).click();
  await page.getByLabel('Email').fill('anna@example.com');
  await page.getByLabel('Mobile phone').fill('(305) 555-0134');
  await page.getByRole('button', { name: 'Continue' }).click();
  return async () => {
    await page.getByLabel('Height (ft)').fill('5');
    await page.getByLabel('Inches').fill('5');
    await page.getByLabel('Weight (lb)').fill('205');
    await page.locator('[data-step="health"]').getByText(safety, { exact: true }).click();
    await page.locator('[data-step="health"]').getByText('No', { exact: true }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
  };
};

test.describe('intake', () => {
  test('completes all six steps and finishes in preview mode', async ({ page }) => {
    await page.goto('/start/?treatment=semaglutide');
    await expect(page.locator('[data-step-count]')).toHaveText('Step 1 of 6');
    const health = await fillIntake(page);
    await health();
    await page.getByLabel('Street address').fill('100 Biscayne Blvd');
    await page.getByLabel('City').fill('Miami');
    await page.locator('#in-state').selectOption('FL');
    await page.getByLabel('ZIP code').fill('33132');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('[data-step="consent"] [data-step-errors] li')).toHaveCount(3);
    await page.locator('#in-c-tele').check();
    await page.locator('#in-c-terms').check();
    await page.locator('#in-c-pay').check();
    await page.getByRole('button', { name: 'Continue' }).click();

    const review = page.locator('[data-review]');
    await expect(review).toContainText('Semaglutide, $65/mo at every dose');
    await expect(review).toContainText('Anna Smith');
    await expect(review).toContainText('100 Biscayne Blvd, Miami, Florida 33132');
    await review.getByRole('button', { name: 'Edit medication' }).click();
    await page.getByText('Tirzepatide, $110/mo at every dose').click();
    await expect(page.locator('[data-sum-price]')).toHaveText('$110');
    for (let i = 0; i < 5; i++) await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('[data-due]')).toHaveText('$110');
    await page.getByRole('button', { name: 'Submit intake' }).click();

    const done = page.locator('[data-intake-done]');
    await expect(done.getByRole('heading')).toHaveText('Thanks, Anna. Your intake is complete.');
    await expect(done).toContainText('Preview mode');
    await expect(done.getByRole('link', { name: 'Go to the patient portal' })).toHaveAttribute('href', '../login/');
    expect(await page.evaluate(() => sessionStorage.getItem('livbetr-intake'))).toBeNull();
  });

  test('blocks under-18s and safety red flags', async ({ page }) => {
    await page.goto('/start/');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByLabel('Date of birth').fill('2012-01-01');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('[data-step="about"] [data-step-errors]')).toContainText('Livbetr is for adults 18 and older.');

    await page.goto('/start/');
    await page.evaluate(() => sessionStorage.clear());
    await page.reload();
    const health = await fillIntake(page, { safety: 'Personal or family history of medullary thyroid cancer' });
    await health();
    await expect(page.locator('[data-step="health"] [data-step-errors]')).toContainText('generally not prescribed');
    await expect(page.locator('[data-step-count]')).toHaveText('Step 3 of 6');
  });
});

test.describe('log in and portal', () => {
  test('validates, resets a password, and opens the portal preview', async ({ page }) => {
    await page.goto('/login/');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.locator('[data-login-form] [data-auth-errors] li')).toHaveCount(2);

    await page.getByLabel('Password').fill('secret-pass');
    await page.getByRole('button', { name: 'Show' }).click();
    await expect(page.getByLabel('Password')).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: 'Forgot your password?' }).click();
    await page.locator('#rs-email').fill('anna@example.com');
    await page.getByRole('button', { name: 'Email me a reset link' }).click();
    await expect(page.locator('[data-reset-done]')).toContainText('anna@example.com');
    await page.locator('[data-reset-done]').getByRole('button', { name: 'Back to log in' }).click();

    await page.locator('#lg-email').fill('anna.smith@example.com');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL(/\/portal\/$/);
    await expect(page.locator('[data-portal-name]')).toHaveText('Anna Smith');
    await expect(page.locator('[data-orders] tr')).toHaveCount(3);
    const [download] = await Promise.all([page.waitForEvent('download'), page.locator('[data-receipt]').first().click()]);
    expect(download.suggestedFilename()).toMatch(/^livbetr-receipt-.+\.txt$/);

    await page.getByLabel('Message your care team').fill('Can I take it in the evening?');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('[data-thread] li').last()).toContainText('Can I take it in the evening?');
    await expect(page.locator('[data-toast]')).toHaveText('Message sent. Your care team will reply here.');

    await page.getByRole('button', { name: 'Change medication' }).click();
    await page.locator('#dlg-change').getByText('Tirzepatide, $110/mo').click();
    await page.getByRole('button', { name: 'Request change' }).click();
    await expect(page.locator('[data-portal-med]')).toHaveText('Tirzepatide');

    await page.getByRole('button', { name: 'Log out' }).click();
    await expect(page).toHaveURL(/\/login\/$/);
  });

  test('the portal sends signed-out visitors to log in', async ({ page }) => {
    await page.goto('/portal/');
    await expect(page).toHaveURL(/\/login\/$/);
  });
});

test.describe('legal pages', () => {
  test('footer links open the policies on this site, with a working contents list', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Legal' }).getByRole('link', { name: 'Refund and cancellation policy' }).click();
    await expect(page).toHaveURL(/\/refund-policy\/$/);
    await expect(page.locator('h1')).toHaveText('Refund, Cancellation & Subscription Policy');
    const firstEntry = page.getByRole('navigation', { name: 'On this page' }).locator('ol a').first();
    const target = await firstEntry.getAttribute('href');
    await firstEntry.click();
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    await expect(page.locator(target)).toBeInViewport();
    await expect(page.getByRole('button', { name: 'Print or save as PDF' })).toBeVisible();
  });
});
