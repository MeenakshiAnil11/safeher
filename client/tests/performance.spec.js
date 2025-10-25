const { test, expect } = require('@playwright/test');

test.describe('Performance', () => {
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

  test('should load dashboard quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;
    
    // Dashboard should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load period tracker quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/period-tracker');
    const loadTime = Date.now() - startTime;
    
    // Period tracker should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load calendar view quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/period-tracker');
    await page.click('button:has-text("Calendar")');
    const loadTime = Date.now() - startTime;
    
    // Calendar should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('should load mood modal quickly', async ({ page }) => {
    await page.goto('/period-tracker');
    
    const startTime = Date.now();
    await page.click('button:has-text("How I Feel Today")');
    const loadTime = Date.now() - startTime;
    
    // Mood modal should open within 1 second
    expect(loadTime).toBeLessThan(1000);
  });

  test('should load profile page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/profile');
    const loadTime = Date.now() - startTime;
    
    // Profile should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load health page quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/health');
    const loadTime = Date.now() - startTime;
    
    // Health page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load location tracking quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/location-tracking');
    const loadTime = Date.now() - startTime;
    
    // Location tracking should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load helplines quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/helplines');
    const loadTime = Date.now() - startTime;
    
    // Helplines should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load resources quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/resources');
    const loadTime = Date.now() - startTime;
    
    // Resources should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should load settings quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/settings');
    const loadTime = Date.now() - startTime;
    
    // Settings should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should handle navigation quickly', async ({ page }) => {
    await page.goto('/period-tracker');
    
    const startTime = Date.now();
    await page.click('button:has-text("History")');
    const loadTime = Date.now() - startTime;
    
    // Navigation should be fast
    expect(loadTime).toBeLessThan(1000);
  });

  test('should handle tab switching quickly', async ({ page }) => {
    await page.goto('/period-tracker');
    
    const startTime = Date.now();
    await page.click('button:has-text("Insights")');
    const loadTime = Date.now() - startTime;
    
    // Tab switching should be fast
    expect(loadTime).toBeLessThan(1000);
  });

  test('should handle modal operations quickly', async ({ page }) => {
    await page.goto('/period-tracker');
    
    // Open modal
    const openStartTime = Date.now();
    await page.click('button:has-text("How I Feel Today")');
    const openLoadTime = Date.now() - openStartTime;
    
    // Modal should open quickly
    expect(openLoadTime).toBeLessThan(1000);
    
    // Close modal
    const closeStartTime = Date.now();
    await page.click('button:has-text("×")');
    const closeLoadTime = Date.now() - closeStartTime;
    
    // Modal should close quickly
    expect(closeLoadTime).toBeLessThan(1000);
  });
});
