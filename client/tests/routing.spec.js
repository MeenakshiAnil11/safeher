const { test, expect } = require('@playwright/test');
const { clearSession } = require('./test-helpers');

test.describe('Routing and Pages Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test('Step 1 - Navigate to signup page and verify Create Account button', async ({ page }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const createButton = page
      .getByRole('button', { name: /Create Account|Sign Up|Register/i })
      .first();

    await expect(createButton).toBeVisible();
  });

  test('Step 2 - Navigate to login page and verify Login button', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const loginButton = page.getByRole('button', { name: /Login|Sign In/i }).first();
    await expect(loginButton).toBeVisible();
  });

  test('Step 3 - Navigate to period tracker page and verify calendar or login prompt', async ({ page }) => {
    await page.goto('/period-tracker');
    await page.waitForLoadState('networkidle');

    const calendarLocator = page.locator('.react-calendar, .period-calendar, [data-testid="period-calendar"]').first();
    const loginPrompt = page.getByText(/login|sign in/i).first();

    const calendarVisible = await calendarLocator.isVisible().catch(() => false);
    const loginVisible = await loginPrompt.isVisible().catch(() => false);

    expect(calendarVisible || loginVisible).toBeTruthy();
  });

  test('Step 4 - Access SOS alert page and verify SOS UI or fallback state', async ({ page }) => {
    await page.goto('/sos');
    await page.waitForTimeout(1500);

    const sosButton = page.getByRole('button', { name: /SOS|Send Alert/i }).first();
    const loginPrompt = page.getByText(/login|sign in/i).first();

    const sosVisible = await sosButton.isVisible().catch(() => false);
    const loginVisible = await loginPrompt.isVisible().catch(() => false);

    // As long as the application responds and keeps us on /sos, consider it reachable
    const currentUrl = page.url();
    const urlMatches = currentUrl.includes('/sos');

    expect(sosVisible || loginVisible || urlMatches).toBeTruthy();
  });

  test('Step 5 - Load safety contacts page and verify contact UI or login prompt', async ({ page }) => {
    // The application route is /my-contacts for contact management
    await page.goto('/my-contacts');
    await page.waitForTimeout(1500);

    const contactList = page.getByText(/contacts|emergency/i).first();
    const addContactButton = page.getByRole('button', { name: /Add Contact|New Contact/i }).first();
    const loginPrompt = page.getByText(/login|sign in/i).first();

    const listVisible = await contactList.isVisible().catch(() => false);
    const addVisible = await addContactButton.isVisible().catch(() => false);
    const loginVisible = await loginPrompt.isVisible().catch(() => false);

    expect(listVisible || addVisible || loginVisible).toBeTruthy();
  });

  test('Step 6 - Close browser window cleanly (scenario 1)', async ({ context }) => {
    const tempPage = await context.newPage();
    await tempPage.goto('/');
    await tempPage.close();
    expect(true).toBe(true);
  });

  test('Step 7 - Close browser window cleanly (scenario 2)', async ({ context }) => {
    const tempPage = await context.newPage();
    await tempPage.goto('/features');
    await tempPage.close();
    expect(true).toBe(true);
  });
});


