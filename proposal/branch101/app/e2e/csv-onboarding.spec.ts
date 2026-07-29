import { expect, test } from "@playwright/test";

const adminPin = process.env.E2E_ADMIN_PIN;

test.describe("CSV onboarding and account safety", () => {
  test.skip(!adminPin, "E2E_ADMIN_PIN is required");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("キャスト名").fill("admin");
    await page.getByLabel(/PIN/).fill(adminPin!);
    await page.getByRole("button", { name: "ログイン" }).click();
    await page.waitForURL("/admin");
  });

  test("upserts active accounts with four-digit PINs and downloads credentials", async ({ page }) => {
    await page.goto("/admin/csv");
    const csv = [
      "operation,login_name,display_name,display_name_kana,store_name,pin,permission_level,job_title",
      "UPSERT,cast001,キャスト一号,きゃすといちごう,本店,2345,GENERAL_USER,CAST",
      "UPSERT,deputy001,副店長一号,ふくてんちょういちごう,本店,,STORE_ADMIN,STORE_DEPUTY_MANAGER",
    ].join("\r\n");
    await page
      .getByRole("heading", { name: /アカウント/ })
      .locator("..")
      .locator('input[type="file"]')
      .setInputFiles({ name: "accounts.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
    await page.getByRole("button", { name: "アップロードして検証" }).first().click();
    await expect(page.getByText(/PREVIEW_READY/)).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "この内容で反映する" }).click();
    await expect(page.getByText("cast001")).toBeVisible();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "資格情報CSVをダウンロード" }).click();
    expect((await download).suggestedFilename()).toBe("account-credentials.csv");
  });

  test("shows the last-super-user rule as a normal page error", async ({ page }) => {
    await page.goto("/admin/roles");
    await page.getByRole("button", { name: "SUPER_USERを取消" }).click();
    await expect(page.getByText("最後の有効なスーパーユーザーは変更できません。")).toBeVisible();
  });

  test("imports 200 active users in one transaction", async ({ page }) => {
    test.setTimeout(180_000);
    test.skip(process.env.E2E_BULK_200 !== "1", "bulk verification is opt-in");
    await page.goto("/admin/csv");
    const header =
      "operation,login_name,display_name,display_name_kana,store_name,pin,permission_level,job_title";
    const rows = Array.from({ length: 200 }, (_, index) => {
      const suffix = String(index + 1).padStart(3, "0");
      return `UPSERT,bulk${suffix},一括${suffix},いっかつ${suffix},本店,,GENERAL_USER,CAST`;
    });
    const section = page.getByRole("heading", { name: /アカウント/ }).locator("..");
    await section.locator('input[type="file"]').setInputFiles({
      name: "accounts-200.csv",
      mimeType: "text/csv",
      buffer: Buffer.from([header, ...rows].join("\r\n")),
    });
    await section.getByRole("button", { name: "アップロードして検証" }).click();
    await expect(page.getByText(/行数: 200/)).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "この内容で反映する" }).click();
    await expect(page.getByRole("button", { name: "資格情報CSVをダウンロード" })).toBeVisible({
      timeout: 120_000,
    });
    await expect(page.getByRole("button", { name: "反映済み" })).toBeDisabled();
  });
});
