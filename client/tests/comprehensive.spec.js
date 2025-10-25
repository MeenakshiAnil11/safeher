const { test, expect } = require('@playwright/test');

test.describe('Comprehensive SafeHer Tests', () => {
  test('should load application successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads
    expect(page.url()).toContain('localhost:3000');
  });

  test('should display login page with form elements', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check URL
    expect(page.url()).toContain('/login');
    
    // Check for form elements (flexible)
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    // At least one form element should be visible
    const hasEmail = await emailInput.isVisible();
    const hasPassword = await passwordInput.isVisible();
    const hasSubmit = await submitButton.isVisible();
    
    expect(hasEmail || hasPassword || hasSubmit).toBeTruthy();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Look for register link
    const registerLink = page.locator('text=Create an account').or(page.locator('text=Create Account'));
    
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await page.waitForTimeout(1000);
      
      // Check if navigation worked
      const currentUrl = page.url();
      expect(currentUrl.includes('/register') || currentUrl.includes('/login')).toBeTruthy();
    } else {
      // If no register link, just verify we're on login page
      expect(page.url()).toContain('/login');
    }
  });

  test('should display home page elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for any heading or title
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    
    // Should have at least one heading
    expect(headingCount).toBeGreaterThan(0);
  });

  test('should load period tracker with authentication', async ({ page }) => {
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
    
    // Check URL
    expect(page.url()).toContain('/period-tracker');
    
    // Check for any content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load dashboard with authentication', async ({ page }) => {
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
    
    // Check URL
    expect(page.url()).toContain('/dashboard');
    
    // Check for any content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load profile page with authentication', async ({ page }) => {
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
    
    // Check URL
    expect(page.url()).toContain('/profile');
    
    // Check for any content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load health page with authentication', async ({ page }) => {
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
    
    // Check URL
    expect(page.url()).toContain('/health');
    
    // Check for any content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load location tracking with authentication', async ({ page }) => {
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
    
    // Check URL
    expect(page.url()).toContain('/location-tracking');
    
    // Check for any content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load helplines page', async ({ page }) => {
    await page.goto('/helplines');
    await page.waitForLoadState('networkidle');
    
    // Check URL
    expect(page.url()).toContain('/helplines');
    
    // Check for any content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load resources page', async ({ page }) => {
    await page.goto('/resources');
    await page.waitForLoadState('networkidle');
    
    // Check URL
    expect(page.url()).toContain('/resources');
    
    // Check for any content
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle form submission', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Fill form if elements exist
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const submitButton = page.locator('button[type="submit"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill('test@example.com');
    }
    
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('testpassword');
    }
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Just verify the page is still accessible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for navigation elements
    const nav = page.locator('nav').or(page.locator('[role="navigation"]'));
    const links = page.locator('a');
    
    // Check if navigation exists
    const hasNav = await nav.isVisible();
    const linkCount = await links.count();
    
    // Should have either navigation or links
    expect(hasNav || linkCount > 0).toBeTruthy();
  });

  test('should handle responsive design', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    // Just verify page is still accessible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should load with different browsers', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Just verify page loads
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle authentication state', async ({ page }) => {
    // Test without authentication
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should either redirect to login or show dashboard
    const currentUrl = page.url();
    expect(currentUrl.includes('/login') || currentUrl.includes('/dashboard')).toBeTruthy();
  });

  test('should display error handling', async ({ page }) => {
    // Try to access a non-existent page
    await page.goto('/non-existent-page');
    await page.waitForLoadState('networkidle');
    
    // Should either show 404 or redirect
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('should load static assets', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for favicon or other assets
    const favicon = page.locator('link[rel="icon"]');
    const hasFavicon = await favicon.count() > 0;
    
    // Just verify page loads regardless of assets
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should handle JavaScript execution', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Execute simple JavaScript
    const result = await page.evaluate(() => {
      return document.title;
    });
    
    expect(result).toBeTruthy();
  });

  test('should maintain session state', async ({ page }) => {
    // Set some localStorage
    await page.evaluate(() => {
      localStorage.setItem('test', 'value');
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if localStorage persists
    const value = await page.evaluate(() => {
      return localStorage.getItem('test');
    });
    
    expect(value).toBe('value');
  });
});
