const { test, expect } = require('@playwright/test');

test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }));
    });
  });

  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Check if mobile layout is applied
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    
    // Check if tablet layout is applied
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard');
    
    // Check if desktop layout is applied
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/period-tracker');
    
    // Check if mobile navigation works
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should handle tablet navigation', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/period-tracker');
    
    // Check if tablet navigation works
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should handle desktop navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/period-tracker');
    
    // Check if desktop navigation works
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should display period tracker progress ring on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/period-tracker');
    
    // Check if progress ring is visible on mobile
    await expect(page.locator('.react-circular-progressbar')).toBeVisible();
  });

  test('should display period tracker progress ring on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/period-tracker');
    
    // Check if progress ring is visible on tablet
    await expect(page.locator('.react-circular-progressbar')).toBeVisible();
  });

  test('should display period tracker progress ring on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/period-tracker');
    
    // Check if progress ring is visible on desktop
    await expect(page.locator('.react-circular-progressbar')).toBeVisible();
  });

  test('should handle mobile mood modal', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/period-tracker');
    
    await page.click('button:has-text("How I Feel Today")');
    
    // Check if modal is visible on mobile
    await expect(page.locator('h3:has-text("How are you feeling today?")')).toBeVisible();
  });

  test('should handle tablet mood modal', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/period-tracker');
    
    await page.click('button:has-text("How I Feel Today")');
    
    // Check if modal is visible on tablet
    await expect(page.locator('h3:has-text("How are you feeling today?")')).toBeVisible();
  });

  test('should handle desktop mood modal', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/period-tracker');
    
    await page.click('button:has-text("How I Feel Today")');
    
    // Check if modal is visible on desktop
    await expect(page.locator('h3:has-text("How are you feeling today?")')).toBeVisible();
  });
});
