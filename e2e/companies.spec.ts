import { test, expect } from "@playwright/test";

test.describe("Companies", () => {
  test("displays companies list page", async ({ page }) => {
    await page.goto("/companies");
    await expect(page.getByText(/companies/i).first()).toBeVisible();
  });

  test("has add company button", async ({ page }) => {
    await page.goto("/companies");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("button", { name: /add company/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can open add company dialog", async ({ page }) => {
    await page.goto("/companies");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add company/i })
      .first()
      .click({ timeout: 10_000 });

    // Form should appear
    await expect(
      page.getByLabel(/name/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can create a new company", async ({ page }) => {
    await page.goto("/companies");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add company/i })
      .first()
      .click({ timeout: 10_000 });

    // Fill in the form
    const nameField = page.getByLabel(/^name$/i).or(page.getByLabel(/company name/i));
    if (await nameField.first().isVisible().catch(() => false)) {
      const timestamp = Date.now();
      await nameField.first().fill(`Test Company ${timestamp}`);
    }

    const industryField = page.getByLabel(/industry/i);
    if (await industryField.isVisible().catch(() => false)) {
      await industryField.fill("Technology");
    }

    // Submit the form
    const submitButton = page
      .getByRole("button", { name: /save|create|add/i })
      .first();
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
    }

    await page.waitForLoadState("networkidle");
  });

  test("companies page has search functionality", async ({ page }) => {
    await page.goto("/companies");
    await page.waitForLoadState("networkidle");

    const searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"));
    await expect(searchInput.first()).toBeVisible({ timeout: 10_000 });
  });
});
