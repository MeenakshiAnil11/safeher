const { test, expect } = require('@playwright/test');

test.describe('Cross-Browser Compatibility Tests', () => {
  test('should load home page in all browsers', async ({ page }) => {
    await page.goto('/');
    
    // Check that page loads
    await expect(page).toHaveURL('/');
    
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should display login form in all browsers', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test('should navigate between pages in all browsers', async ({ page }) => {
    await page.goto('/');
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);
    
    await page.goto('/contact');
    await expect(page).toHaveURL(/\/contact/);
  });
});

