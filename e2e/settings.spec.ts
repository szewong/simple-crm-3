import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("can navigate to settings", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("link", { name: /settings/i }).first().click();
    await expect(page).toHaveURL(/\/settings/);
  });

  test("displays profile settings", async ({ page }) => {
    await page.goto("/settings/profile");
    await expect(page.getByText(/profile/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("displays account settings", async ({ page }) => {
    await page.goto("/settings/account");
    await expect(page.getByText(/account/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("profile page has form fields", async ({ page }) => {
    await page.goto("/settings/profile");
    await page.waitForLoadState("networkidle");

    // Should have name/email fields
    const hasFormFields =
      (await page
        .getByLabel(/name|full name/i)
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByLabel(/email/i)
        .first()
        .isVisible()
        .catch(() => false));

    expect(hasFormFields).toBeTruthy();
  });
});
