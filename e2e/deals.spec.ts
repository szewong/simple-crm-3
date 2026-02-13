import { test, expect } from "@playwright/test";

test.describe("Deals Pipeline", () => {
  test("displays deals page", async ({ page }) => {
    await page.goto("/deals");
    await expect(page.getByText(/deals/i).first()).toBeVisible();
  });

  test("has board and list view toggle", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");

    // Look for view toggle buttons
    const boardButton = page.getByRole("button", { name: /board/i }).or(
      page.getByRole("tab", { name: /board/i })
    );
    const listButton = page.getByRole("button", { name: /list/i }).or(
      page.getByRole("tab", { name: /list/i })
    );

    const hasBoardView =
      (await boardButton.first().isVisible().catch(() => false)) ||
      (await listButton.first().isVisible().catch(() => false));

    expect(hasBoardView).toBeTruthy();
  });

  test("has add deal button", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByRole("button", { name: /add deal|new deal/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("can open add deal form", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");
    await page
      .getByRole("button", { name: /add deal|new deal/i })
      .click({ timeout: 10_000 });

    // Deal form should appear — look for the dialog with "Deal Title" label
    await expect(
      page
        .getByLabel(/deal title/i)
        .or(page.getByPlaceholder(/enterprise plan/i))
        .first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("pipeline board shows stages", async ({ page }) => {
    await page.goto("/deals");
    await page.waitForLoadState("networkidle");

    // Check for common pipeline stage names
    const stages = [
      /lead|qualification|qualified/i,
      /proposal|negotiation/i,
      /won|closed/i,
    ];

    let foundStages = 0;
    for (const stage of stages) {
      const el = page.getByText(stage).first();
      if (await el.isVisible().catch(() => false)) {
        foundStages++;
      }
    }

    // Should find at least one stage
    expect(foundStages).toBeGreaterThan(0);
  });
});
