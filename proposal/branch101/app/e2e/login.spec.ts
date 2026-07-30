import { test, expect } from '@playwright/test';

test.describe('Login & Basic Navigation', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();
  });

  test('should login with an active demo SU PIN', async ({ page }) => {
    const pin = process.env.E2E_ADMIN_PIN;
    test.skip(!pin, 'E2E_ADMIN_PIN is required');

    await page.goto('/login');
    await page.getByLabel('キャスト名').fill('admin');
    await page.getByLabel(/PIN/).fill(pin!);
    await page.getByRole('button', { name: 'ログイン' }).click();
    await page.waitForURL('/admin');
    await expect(page.getByRole('heading', { name: 'admin さん' })).toBeVisible();
    await expect(page.getByRole('link', { name: /初回導入・一括更新/ })).toBeVisible();

    await page.getByRole('link', { name: /初回導入・一括更新/ }).click();
    await page.waitForURL('/admin/csv');
    await expect(page.getByRole('heading', { name: 'CSV入出力' })).toBeVisible();
    await page.getByRole('link', { name: '管理トップへ戻る' }).click();
    await page.waitForURL('/admin');

    await page.getByRole('link', { name: 'アカウント管理' }).click();
    await page.waitForURL('/admin/users');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: 'アカウント事前登録' })).toBeVisible();
    await page.getByLabel('ログイン名').fill(`manager-${Date.now()}`);
    await page.getByLabel('表示名').fill('テスト店長');
    await page.getByLabel('読み仮名').fill('てすとてんちょう');
    await page.getByLabel('所属店舗').selectOption({ label: 'デモ店舗' });
    await page.getByLabel('権限・役職').selectOption('STORE_MANAGER');
    await page.getByRole('button', { name: '事前登録する' }).click();
    await expect(page.getByText('テスト店長を登録しました。')).toBeVisible();

    await page.getByRole('link', { name: '管理トップへ戻る' }).click();
    await page.waitForURL('/admin');
    await page.getByRole('link', { name: 'ロール・管理店舗' }).click();
    await page.waitForURL('/admin/roles');
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should complete initial SU setup and login again', async ({ page }) => {
    const setupCode = process.env.E2E_SETUP_CODE;
    test.skip(!setupCode || process.env.E2E_LOCKOUT_TEST === '1', 'Successful setup scenario is not selected');
    const pin = '1234';

    await page.goto('/initial-setup');
    await page.getByLabel('キャスト名').fill('admin');
    await page.getByLabel('初期設定コード').fill(setupCode!);
    await page.getByLabel(/新しいPIN/).fill(pin);
    await page.getByRole('button', { name: 'PINを設定してログイン' }).click();
    await page.waitForURL('/admin');
    await expect(page.getByRole('heading', { name: 'admin さん' })).toBeVisible();

    await page.getByRole('button', { name: 'ログアウト' }).click();
    await page.waitForURL('/login');
    await page.goto('/login');
    await page.fill('input[name="loginName"]', 'admin');
    await page.fill('input[name="password"]', pin);
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
    await expect(page.getByRole('heading', { name: 'admin さん' })).toBeVisible();
  });

  test('should lock a setup code after five failures', async ({ page }) => {
    const setupCode = process.env.E2E_SETUP_CODE;
    test.skip(!setupCode || process.env.E2E_LOCKOUT_TEST !== '1', 'Lockout scenario is not selected');
    const wrongCode = setupCode === 'AAAAAAAAAA' ? 'BBBBBBBBBB' : 'AAAAAAAAAA';

    await page.goto('/initial-setup');
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await page.getByLabel('キャスト名').fill('admin');
      await page.getByLabel('初期設定コード').fill(wrongCode);
      await page.getByLabel(/新しいPIN/).fill('1234');
      await page.getByRole('button', { name: 'PINを設定してログイン' }).click();
      await expect(page.getByText(/キャスト名または初期設定コードが正しくない/)).toBeVisible();
    }

    await page.getByLabel('初期設定コード').fill(setupCode!);
    await page.getByRole('button', { name: 'PINを設定してログイン' }).click();
    await expect(page.getByText(/キャスト名または初期設定コードが正しくない/)).toBeVisible();
    await expect(page).toHaveURL(/\/initial-setup$/);
  });
});
