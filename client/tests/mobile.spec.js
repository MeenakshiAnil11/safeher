const { test, expect, devices } = require('@playwright/test');

// Configure mobile viewport at top level
test.use({
  ...devices['iPhone 12'],
});

test.describe('Mobile Responsive Tests', () => {

  test('should display login form on mobile', async ({ page }) => {
    await page.goto('/login');
    
    // Check for login form elements
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    
    // Check viewport size
    const viewport = page.viewportSize();
    expect(viewport.width).toBeLessThanOrEqual(390);
  });

  test('should display home page on mobile', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveURL('/');
    
    // Check that content is visible
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
  });

  test('should navigate on mobile device', async ({ page }) => {
    await page.goto('/');
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);
  });
});

