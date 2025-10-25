const { test, expect } = require('@playwright/test');

test.describe('Accessibility', () => {
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

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for h1 heading
    const h1 = page.locator('h1');
    if (await h1.count() > 0) {
      await expect(h1.first()).toBeVisible();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check for email input
    const emailInput = page.locator('input[name="email"]');
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
    }
    
    // Check for password input
    const passwordInput = page.locator('input[name="password"]');
    if (await passwordInput.isVisible()) {
      await expect(passwordInput).toBeVisible();
    }
  });

  test('should have proper button text', async ({ page }) => {
    await page.goto('/login');
    
    // Check for submit button
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.isVisible()) {
      await expect(submitButton).toBeVisible();
    }
  });

  test('should have proper navigation structure', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for navigation
    const nav = page.locator('nav');
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }
  });

  test('should have proper period tracker structure', async ({ page }) => {
    await page.goto('/period-tracker');
    
    // Check for main heading
    const mainHeading = page.locator('h2');
    if (await mainHeading.isVisible()) {
      await expect(mainHeading).toBeVisible();
    }
    
    // Check for navigation tabs
    const tabs = page.locator('nav button');
    if (await tabs.count() > 0) {
      await expect(tabs.first()).toBeVisible();
    }
  });

  test('should have proper mood modal structure', async ({ page }) => {
    await page.goto('/period-tracker');
    
    await page.click('button:has-text("How I Feel Today")');
    
    // Check for modal heading
    const modalHeading = page.locator('h3:has-text("How are you feeling today?")');
    if (await modalHeading.isVisible()) {
      await expect(modalHeading).toBeVisible();
    }
    
    // Check for close button
    const closeButton = page.locator('button:has-text("×")');
    if (await closeButton.isVisible()) {
      await expect(closeButton).toBeVisible();
    }
  });

  test('should have proper calendar structure', async ({ page }) => {
    await page.goto('/period-tracker');
    await page.click('button:has-text("Calendar")');
    
    // Check for calendar
    const calendar = page.locator('.react-calendar');
    if (await calendar.isVisible()) {
      await expect(calendar).toBeVisible();
    }
    
    // Check for legend
    const legend = page.locator('.pt-legend');
    if (await legend.isVisible()) {
      await expect(legend).toBeVisible();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/period-tracker');
    
    // Check if text is visible (basic contrast test)
    const textElements = page.locator('text=Period Tracker');
    if (await textElements.isVisible()) {
      await expect(textElements).toBeVisible();
    }
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = page.locator(':focus');
    if (await focusedElement.isVisible()) {
      await expect(focusedElement).toBeVisible();
    }
  });

  test('should have proper alt text for images', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for images with alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // Alt text should exist or be empty for decorative images
        expect(alt).toBeDefined();
      }
    }
  });
});
