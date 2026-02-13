import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("displays dashboard page with key sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/total contacts/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test("displays stat cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check for actual dashboard stat labels
    const statLabels = [
      /total contacts/i,
      /active deals/i,
      /pipeline value/i,
      /activities this week/i,
    ];
    for (const label of statLabels) {
      await expect(page.getByText(label).first()).toBeVisible({
        timeout: 10_000,
      });
    }
  });

  test("sidebar navigation is visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check sidebar links
    const navLinks = [
      "Dashboard",
      "Contacts",
      "Companies",
      "Deals",
      "Activities",
      "Settings",
    ];
    for (const link of navLinks) {
      await expect(
        page.getByRole("link", { name: new RegExp(link, "i") }).first()
      ).toBeVisible();
    }
  });

  test("can navigate to each section from sidebar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to Contacts
    await page.getByRole("link", { name: /contacts/i }).first().click();
    await expect(page).toHaveURL(/\/contacts/);

    // Navigate to Companies
    await page.getByRole("link", { name: /companies/i }).first().click();
    await expect(page).toHaveURL(/\/companies/);

    // Navigate to Deals
    await page.getByRole("link", { name: /deals/i }).first().click();
    await expect(page).toHaveURL(/\/deals/);

    // Navigate to Activities
    await page.getByRole("link", { name: /activities/i }).first().click();
    await expect(page).toHaveURL(/\/activities/);

    // Navigate back to Dashboard
    await page.getByRole("link", { name: /dashboard/i }).first().click();
    await expect(page).toHaveURL("/");
  });
});
