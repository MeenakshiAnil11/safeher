const { test, expect } = require('@playwright/test');

test.describe('Navigation', () => {
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

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to profile', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*profile/);
  });

  test('should navigate to health page', async ({ page }) => {
    await page.goto('/health');
    await expect(page).toHaveURL(/.*health/);
  });

  test('should navigate to period tracker', async ({ page }) => {
    await page.goto('/period-tracker');
    await expect(page).toHaveURL(/.*period-tracker/);
    await expect(page.locator('h2')).toContainText('Period Tracker');
  });

  test('should navigate to location tracking', async ({ page }) => {
    await page.goto('/location-tracking');
    await expect(page).toHaveURL(/.*location-tracking/);
    await expect(page.locator('h1')).toContainText('Location Tracking');
  });

  test('should navigate to helplines', async ({ page }) => {
    await page.goto('/helplines');
    await expect(page).toHaveURL(/.*helplines/);
  });

  test('should navigate to resources', async ({ page }) => {
    await page.goto('/resources');
    await expect(page).toHaveURL(/.*resources/);
  });

  test('should navigate to settings', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/.*settings/);
  });

  test('should navigate to feedback', async ({ page }) => {
    await page.goto('/feedback');
    await expect(page).toHaveURL(/.*feedback/);
  });

  test('should navigate to quiz', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page).toHaveURL(/.*quiz/);
  });

  test('should navigate to assessment', async ({ page }) => {
    await page.goto('/assessment');
    await expect(page).toHaveURL(/.*assessment/);
  });
});
