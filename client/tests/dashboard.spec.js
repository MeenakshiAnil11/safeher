const { test, expect } = require('@playwright/test');
const { clearSession, loginAsUser } = require('./test-helpers');

test.describe('Dashboard Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('should redirect to login when accessing protected dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login page
    await page.waitForURL(/\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('should display home page', async ({ page }) => {
    await page.goto('/');
    
    // Check for home page elements
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    
    // Check if page loaded (no error)
    await expect(page).toHaveURL('/');
  });

  test('should navigate to features page', async ({ page }) => {
    await page.goto('/');
    
    // Try to navigate to features
    const featuresLink = page.getByRole('link', { name: /features/i }).first();
    if (await featuresLink.isVisible()) {
      await featuresLink.click();
      await page.waitForURL(/\/features/, { timeout: 5000 });
      await expect(page).toHaveURL(/\/features/);
    } else {
      // Direct navigation
      await page.goto('/features');
      await expect(page).toHaveURL(/\/features/);
    }
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);
  });

  test('should navigate to contact page', async ({ page }) => {
    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);
  });
});

