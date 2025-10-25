// Test setup and utilities
const { test } = require('@playwright/test');

// Global test setup
test.beforeAll(async () => {
  console.log('🚀 Starting Playwright tests for SafeHer project');
});

test.afterAll(async () => {
  console.log('✅ Playwright tests completed');
});

// Helper functions for tests
const testHelpers = {
  // Mock authentication
  async mockAuth(page) {
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }));
    });
  },

  // Wait for page to be ready
  async waitForPageReady(page) {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  },

  // Take screenshot on failure
  async takeScreenshot(page, name) {
    await page.screenshot({ path: `test-results/${name}.png` });
  },

  // Check if element exists
  async elementExists(page, selector) {
    try {
      await page.waitForSelector(selector, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  },

  // Get performance metrics
  async getPerformanceMetrics(page) {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    return metrics;
  }
};

module.exports = { testHelpers };
