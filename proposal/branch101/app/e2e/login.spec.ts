import { test, expect } from '@playwright/test';

test.describe('Login & Basic Navigation', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login/);
  });

  test('should login as admin and navigate to dashboard', async ({ page }) => {
    await page.goto('/login');
    // Assuming simple form based login for proposal
    await page.fill('input[name="loginName"]', 'admin');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL('/app/admin**');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });
});
