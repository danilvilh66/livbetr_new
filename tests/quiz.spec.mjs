import { test, expect } from '@playwright/test';

const answerUntilBody = async (page, { goal = '21 to 50 lb', state = 'Florida', age = '42' } = {}) => {
  await page.goto('/eligibility/');
  await page.getByText(goal, { exact: true }).click();
  await expect(page.getByRole('group', { name: 'Which state do you live in?' })).toBeVisible();
  await page.getByLabel('State').selectOption({ label: state });
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Age in years').fill(age);
  await page.getByRole('button', { name: 'Continue' }).click();
};

const fillBody = async (page, { ft = '5', inch = '6', lb = '210' } = {}) => {
  await page.getByLabel('Feet').fill(ft);
  await page.getByLabel('Inches').fill(inch);
  await page.getByLabel('Weight (lb)').fill(lb);
};

test.describe('eligibility check', () => {
  test('requires an answer before moving on', async ({ page }) => {
    await page.goto('/eligibility/');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('#q-goal-err')).toHaveText('Choose one option to continue.');
    await expect(page.locator('[data-step-count]')).toHaveText('Question 1 of 6');
  });

  test('likely-eligible path suggests a plan and links to intake', async ({ page }) => {
    await answerUntilBody(page);
    await fillBody(page);
    await expect(page.locator('[data-bmi-value]')).toHaveText('33.9');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('High blood pressure').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('[data-step-count]')).toHaveText('Question 6 of 6');
    await page.locator('[data-step]:not([hidden])').getByText('None of these').click();
    await page.getByRole('button', { name: 'See my results' }).click();

    const result = page.locator('[data-quiz-result]');
    await expect(result.getByRole('heading', { level: 2 })).toHaveText('GLP-1 medication could be right for you');
    await expect(result.getByRole('heading', { level: 2 })).toBeFocused();
    await expect(result.locator('.result-plan.is-suggested h3')).toHaveText('Tirzepatide');
    await expect(result.getByRole('link', { name: 'Continue with tirzepatide' })).toHaveAttribute('href', /intake\.livbetr\.com\/\?utm_source=website&treatment=tirzepatide/);
    await expect(result).toContainText('Florida');

    // Progress survives a reload in the same session.
    await page.reload();
    await expect(result.getByRole('heading', { level: 2 })).toHaveText('GLP-1 medication could be right for you');
    await result.getByRole('button', { name: 'Start over' }).click();
    await expect(page.locator('[data-step-count]')).toHaveText('Question 1 of 6');
  });

  test('BMI under the guidelines gets an honest answer', async ({ page }) => {
    await answerUntilBody(page, { goal: '1 to 20 lb' });
    await fillBody(page, { ft: '5', inch: '8', lb: '150' });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('[data-step]:not([hidden])').getByText('None of these').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('[data-step]:not([hidden])').getByText('None of these').click();
    await page.getByRole('button', { name: 'See my results' }).click();
    await expect(page.locator('[data-quiz-result] h2')).toHaveText('You may not meet the BMI guidelines');
    await expect(page.locator('[data-quiz-result]')).toContainText('22.8');
  });

  test('a BMI of 27-30 qualifies only with a condition', async ({ page }) => {
    await answerUntilBody(page, { goal: '1 to 20 lb' });
    await fillBody(page, { ft: '5', inch: '10', lb: '195' }); // BMI 28.0
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('Sleep apnea').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('[data-step]:not([hidden])').getByText('None of these').click();
    await page.getByRole('button', { name: 'See my results' }).click();
    await expect(page.locator('[data-quiz-result] h2')).toHaveText('GLP-1 medication could be right for you');
    await expect(page.locator('.result-plan.is-suggested h3')).toHaveText('Semaglutide');
  });

  test('safety red flags stop the flow', async ({ page }) => {
    await answerUntilBody(page);
    await fillBody(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('[data-step]:not([hidden])').getByText('None of these').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('Personal or family history of medullary thyroid cancer').click();
    await page.getByRole('button', { name: 'See my results' }).click();
    await expect(page.locator('[data-quiz-result] h2')).toHaveText('GLP-1 medication may not be safe for you');
    await expect(page.locator('[data-quiz-result] a[href*="intake.livbetr.com"]')).toHaveCount(0);
  });

  test('history of pancreatitis needs clinician review', async ({ page }) => {
    await answerUntilBody(page);
    await fillBody(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('[data-step]:not([hidden])').getByText('None of these').click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('History of pancreatitis').click();
    await page.getByRole('button', { name: 'See my results' }).click();
    await expect(page.locator('[data-quiz-result] h2')).toHaveText('You may qualify, with a careful review');
  });

  test('under 18 ends the check early', async ({ page }) => {
    await answerUntilBody(page, { age: '16' });
    await expect(page.locator('[data-quiz-result] h2')).toHaveText('Livbetr is for adults 18 and older');
  });

  test('"None of these" is exclusive, and metric units work', async ({ page }) => {
    await answerUntilBody(page);
    await page.getByText('cm, kg').click();
    await page.getByLabel('Height (cm)').fill('170');
    await page.getByLabel('Weight (kg)').fill('95');
    await expect(page.locator('[data-bmi-value]')).toHaveText('32.9');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('High cholesterol').click();
    await page.locator('[data-step]:not([hidden])').getByText('None of these').click();
    await expect(page.getByLabel('High cholesterol')).not.toBeChecked();
    await page.getByText('Heart disease').click();
    await expect(page.locator('input[name="conditions"][value="none"]')).not.toBeChecked();
  });

  test('browser back returns to the previous question', async ({ page }) => {
    await answerUntilBody(page);
    await expect(page.locator('[data-step-count]')).toHaveText('Question 4 of 6');
    await page.goBack();
    await expect(page.locator('[data-step-count]')).toHaveText('Question 3 of 6');
    await expect(page.getByLabel('Age in years')).toHaveValue('42');
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.locator('[data-step-count]')).toHaveText('Question 2 of 6');
  });

  test('validates height and weight ranges', async ({ page }) => {
    await answerUntilBody(page);
    await fillBody(page, { ft: '9', inch: '2', lb: '200' });
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.locator('#q-body-err')).toHaveText('Enter your height in feet, between 4 and 7.');
    await expect(page.getByLabel('Feet')).toBeFocused();
  });
});
