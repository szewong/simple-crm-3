import { test as setup, expect } from "@playwright/test";

const TEST_EMAIL = "e2e-test@example.com";
const TEST_PASSWORD = "TestPassword123!";
const TEST_NAME = "E2E Test User";

setup("create test account and authenticate", async ({ page }) => {
  // Try signing up first
  await page.goto("/signup");
  await page.getByLabel("Full name").fill(TEST_NAME);
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  // Wait for either redirect to dashboard or error (user already exists)
  const response = await Promise.race([
    page.waitForURL("/", { timeout: 10_000 }).then(() => "dashboard"),
    page
      .getByText("User already registered")
      .waitFor({ timeout: 10_000 })
      .then(() => "exists"),
  ]).catch(() => "timeout");

  if (response === "exists" || response === "timeout") {
    // User already exists — log in instead
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_EMAIL);
    await page.getByLabel("Password").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/", { timeout: 10_000 });
  }

  // Verify we're on the dashboard
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("link", { name: /dashboard/i })
  ).toBeVisible();

  // Save signed-in state
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
