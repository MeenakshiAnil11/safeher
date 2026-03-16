/**
 * Test helper functions for SafeHer Playwright tests
 */

/**
 * Clear session storage and local storage
 */
async function clearSession(page) {
  const context = page.context();
  await context.clearCookies().catch(() => {});

  const baseURL =
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    context._options?.baseURL ||
    'http://localhost:3000';

  let targetPage = page;

  if (targetPage.isClosed()) {
    targetPage = await context.newPage();
  }

  try {
    // Prefer relative navigation (resolves against baseURL)
    await targetPage.goto('/', { waitUntil: 'domcontentloaded', timeout: 10000 });
  } catch (err) {
    try {
      await targetPage.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    } catch (innerErr) {
      try {
        await targetPage.goto('about:blank');
      } catch (noop) {
        // swallow last resort
      }
    }
  }

  try {
    await targetPage.evaluate(() => {
      window.localStorage?.clear?.();
      window.sessionStorage?.clear?.();
    });
  } catch (err) {
    // ignore storage clearing errors
  }

  if (targetPage !== page) {
    await targetPage.close().catch(() => {});
  }
}

/**
 * Login as a regular user
 */
async function loginAsUser(page, email = 'test@example.com', password = 'Test@1234') {
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard|\/admin\/dashboard/, { timeout: 5000 });
}

/**
 * Login as admin
 */
async function loginAsAdmin(page, email = 'admin@safeher.com', password = 'Admin@1234') {
  await page.goto('http://localhost:3000/admin/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 5000 });
}

/**
 * Wait for API response
 */
async function waitForAPIResponse(page, urlPattern) {
  return page.waitForResponse(response => 
    response.url().includes(urlPattern) && response.status() === 200
  );
}

/**
 * Take screenshot with timestamp
 */
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `tests/screenshots/${name}-${timestamp}.png`, fullPage: true });
}

module.exports = {
  clearSession,
  loginAsUser,
  loginAsAdmin,
  waitForAPIResponse,
  takeScreenshot
};

