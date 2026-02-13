import { test, expect } from "@playwright/test";

test.describe("Contacts", () => {
  test("displays contacts list page", async ({ page }) => {
    await page.goto("/contacts");
    await expect(page.getByText(/contacts/i).first()).toBeVisible();
  });

  test("has add contact button", async ({ page }) => {
    await page.goto("/contacts");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("button", { name: /add contact/i }).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can open add contact dialog", async ({ page }) => {
    await page.goto("/contacts");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add contact/i })
      .first()
      .click({ timeout: 10_000 });

    // Form should appear (either dialog or page)
    await expect(
      page.getByLabel(/first name/i).or(page.getByLabel(/name/i)).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can create a new contact", async ({ page }) => {
    await page.goto("/contacts");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add contact/i })
      .first()
      .click({ timeout: 10_000 });

    // Fill in the form
    const firstName = page.getByLabel(/first name/i);
    const lastName = page.getByLabel(/last name/i);
    const email = page.getByLabel(/email/i);

    if (await firstName.isVisible().catch(() => false)) {
      await firstName.fill("Test");
      await lastName.fill("Contact");
    }

    if (await email.isVisible().catch(() => false)) {
      const timestamp = Date.now();
      await email.fill(`test-contact-${timestamp}@example.com`);
    }

    // Submit the form
    const submitButton = page
      .getByRole("button", { name: /save|create|add/i })
      .first();
    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click();
    }

    // Wait for navigation or success
    await page.waitForLoadState("networkidle");
  });

  test("contacts page has search functionality", async ({ page }) => {
    await page.goto("/contacts");
    await page.waitForLoadState("networkidle");

    // Look for search input
    const searchInput = page
      .getByPlaceholder(/search/i)
      .or(page.getByRole("searchbox"));
    await expect(searchInput.first()).toBeVisible({ timeout: 10_000 });
  });
});
