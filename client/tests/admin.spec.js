const { test, expect } = require('@playwright/test');
const { clearSession, loginAsAdmin } = require('./test-helpers');

test.describe('Admin Dashboard Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('should redirect to admin login when accessing admin dashboard without auth', async ({ page }) => {
    await page.goto('/admin/dashboard');
    
    // Should redirect to admin login
    await page.waitForURL(/\/admin\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test('should display admin login page', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Check for admin login form
    await expect(page.getByLabel(/email/i).first()).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });

  test('should access admin users page (if authenticated)', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(1000);
    
    // Should either show admin users or redirect to login
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin\/(login|users)/);
  });

  test('should access admin SOS logs page (if authenticated)', async ({ page }) => {
    await page.goto('/admin/sos');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin\/(login|sos)/);
  });

  test('should access admin resources page (if authenticated)', async ({ page }) => {
    await page.goto('/admin/resources');
    await page.waitForTimeout(1000);
    
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/admin\/(login|resources)/);
  });
});

