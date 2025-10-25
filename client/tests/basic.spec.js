const { test, expect } = require('@playwright/test');

test.describe('Basic Page Loading', () => {
  test('should load login page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Just check that the page loads
    await expect(page).toHaveURL(/.*login/);
  });

  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Just check that the page loads
    await expect(page).toHaveURL(/.*\/$/);
  });

  test('should have a title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that page has a title
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should have body content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that body exists
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load period tracker page', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }));
    });
    
    await page.goto('/period-tracker');
    await page.waitForLoadState('networkidle');
    
    // Just check that the page loads
    await expect(page).toHaveURL(/.*period-tracker/);
  });

  test('should load dashboard page', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }));
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Just check that the page loads
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should load profile page', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }));
    });
    
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    // Just check that the page loads
    await expect(page).toHaveURL(/.*profile/);
  });

  test('should load health page', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }));
    });
    
    await page.goto('/health');
    await page.waitForLoadState('networkidle');
    
    // Just check that the page loads
    await expect(page).toHaveURL(/.*health/);
  });

  test('should load location tracking page', async ({ page }) => {
    // Mock authentication
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }));
    });
    
    await page.goto('/location-tracking');
    await page.waitForLoadState('networkidle');
    
    // Just check that the page loads
    await expect(page).toHaveURL(/.*location-tracking/);
  });

  test('should load helplines page', async ({ page }) => {
    await page.goto('/helplines');
    await page.waitForLoadState('networkidle');
    
    // Just check that the page loads
    await expect(page).toHaveURL(/.*helplines/);
  });

  test('should load resources page', async ({ page }) => {
    await page.goto('/resources');
    await page.waitForLoadState('networkidle');
    
    // Just check that the page loads
    await expect(page).toHaveURL(/.*resources/);
  });
});
