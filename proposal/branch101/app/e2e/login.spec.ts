import { test, expect } from '@playwright/test';

test.describe('Login & Basic Navigation', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
  });

  test('should complete initial SU setup and login again', async ({ page }) => {
    const setupCode = process.env.E2E_SETUP_CODE;
    test.skip(!setupCode, 'E2E_SETUP_CODE is required for the initial setup scenario');
    const password = 'AccountE2E123!';

    await page.goto('/initial-setup');
    await page.getByLabel('キャスト名').fill('admin');
    await page.getByLabel('初期設定コード').fill(setupCode!);
    await page.getByLabel(/新しいパスワード/).fill(password);
    await page.getByRole('button', { name: 'パスワードを設定してログイン' }).click();
    await page.waitForURL('/admin');
    await expect(page.getByRole('heading', { name: 'admin さん' })).toBeVisible();

    await page.getByRole('button', { name: 'ログアウト' }).click();
    await page.waitForURL('/login');
    await page.goto('/login');
    await page.fill('input[name="loginName"]', 'admin');
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    await expect(page.getByRole('heading', { name: 'admin さん' })).toBeVisible();
  });
});
