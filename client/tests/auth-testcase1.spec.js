const { test, expect } = require('@playwright/test');
const { clearSession } = require('./test-helpers');

test.describe('Authentication Tests - SafeHer', () => {
  
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('should display login form', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to be interactive
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for email input to be present (most reliable indicator)
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await emailInput.waitFor({ state: 'attached', timeout: 15000 });
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    
    // Check for heading (flexible matching)
    const heading = page.getByRole('heading', { name: /Welcome Back|Login/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    
    // Verify email input is visible
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    
    // Check for password input
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
  });

  test('should display validation errors for invalid login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    
    // Wait for login form to be ready
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15000 });
    
    // Wait for login button to be visible
    const loginButton = page.getByRole('button', { name: /Login|Sign In/i }).first();
    await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click login button without filling form
    await loginButton.click();
    
    // Wait for validation to appear (either browser or custom)
    await page.waitForTimeout(1500);
    
    // Check for validation error messages
    const hasEmailError = await page.getByText(/Email address is required|email is required|Please fill|required|invalid|Please enter/i).first().isVisible().catch(() => false);
    const hasPasswordError = await page.getByText(/password is required|Password is required|Please fill|required|invalid|Please enter/i).first().isVisible().catch(() => false);
    
    // Check browser HTML5 validation
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    const emailInvalid = await emailInput.evaluate((el) => {
      try {
        return !el.validity.valid;
      } catch {
        return false;
      }
    }).catch(() => false);
    
    const passwordInvalid = await passwordInput.evaluate((el) => {
      try {
        return !el.validity.valid;
      } catch {
        return false;
      }
    }).catch(() => false);
    
    // At least one validation should trigger
    expect(hasEmailError || hasPasswordError || emailInvalid || passwordInvalid).toBeTruthy();
  });

  test('should show signup page', async ({ page }) => {
    // Navigate to register page
    await page.goto('/register', { waitUntil: 'domcontentloaded' });
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for form elements to be present
    await page.waitForSelector('input, button', { timeout: 15000 });
    
    // Wait for the submit button specifically
    const createButton = page.getByRole('button', { name: /Create account|Create Account|Sign up|Register/i }).first();
    await createButton.waitFor({ state: 'attached', timeout: 15000 });
    
    // Verify button is visible
    await expect(createButton).toBeVisible({ timeout: 10000 });
  });
});

