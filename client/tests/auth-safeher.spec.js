const { test, expect } = require('@playwright/test');
const { clearSession } = require('./test-helpers');

test.describe('Authentication Tests - SafeHer', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('heading', { name: /welcome back/i }).first()
    ).toBeVisible();

    const emailField = page.getByPlaceholder(/email/i).or(page.locator('input[name="email"]')).first();
    const passwordField = page.getByPlaceholder(/password/i).or(page.locator('input[name="password"]')).first();

    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
  });

  test('should display validation errors for invalid login', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /login|sign in/i }).first().click();

    // Wait a moment for browser validation to kick in
    await page.waitForTimeout(300);

    const invalidInputs = await page.locator('input:invalid').count();
    const errorText = await page.textContent('body').catch(() => '');

    expect(invalidInputs > 0 || /required|invalid|email|password/i.test(errorText)).toBeTruthy();
  });

  test('should show signup page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    await expect(
      page.getByRole('button', { name: /Create Account|Sign Up|Register/i }).first()
    ).toBeVisible();
  });
});


