import { test, expect } from "@playwright/test";

test.describe("Activities", () => {
  test("displays activities page", async ({ page }) => {
    await page.goto("/activities");
    await expect(page.getByText(/activities/i).first()).toBeVisible();
  });

  test("has activity tabs or filters", async ({ page }) => {
    await page.goto("/activities");
    await page.waitForLoadState("networkidle");

    // Look for tabs or filter buttons
    const hasFilters =
      (await page
        .getByRole("tab")
        .first()
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByRole("button", { name: /all|filter|my tasks/i })
        .first()
        .isVisible()
        .catch(() => false));

    expect(hasFilters).toBeTruthy();
  });

  test("has add activity button", async ({ page }) => {
    await page.goto("/activities");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("button", { name: /add activity|new activity|log activity/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can open add activity form", async ({ page }) => {
    await page.goto("/activities");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add activity|new activity|log activity/i })
      .click({ timeout: 10_000 });

    // Activity form should appear with type selection
    await expect(
      page
        .getByLabel(/type|title|subject/i)
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });
});
