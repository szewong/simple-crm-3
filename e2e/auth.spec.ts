import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // unauthenticated

  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
  });

  test("signup page renders correctly", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Create account" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible();
  });

  test("shows error for invalid login credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("nonexistent@example.com");
    await page.getByLabel("Password").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/invalid/i)).toBeVisible({ timeout: 10_000 });
  });

  test("can navigate between login and signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Sign up" }).click();
    await expect(page).toHaveURL(/\/signup/);

    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("successful login redirects to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("e2e-test@example.com");
    await page.getByLabel("Password").fill("TestPassword123!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/", { timeout: 10_000 });
  });
});
