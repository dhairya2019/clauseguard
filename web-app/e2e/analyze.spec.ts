import { test, expect } from "@playwright/test";

test.describe("Analyze Page", () => {
  test.beforeEach(async ({ page }) => {
    // Mock the payment status endpoint (no Redis in CI)
    await page.route("**/api/payment/status", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ used: 0, limit: 3, remaining: 3, isPaid: false }),
      })
    );
    await page.goto("/analyze");
  });

  test("renders analyze page with input and heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /analyze your contract/i })
    ).toBeVisible();

    await expect(
      page.getByPlaceholder(/paste your contract text/i)
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: /analyze contract/i })
    ).toBeVisible();
  });

  test("shows character count and minimum requirement", async ({ page }) => {
    await expect(page.getByText(/0 characters/)).toBeVisible();
    await expect(page.getByText(/minimum 50 required/i)).toBeVisible();
  });

  test("analyze button disabled with short text", async ({ page }) => {
    const textarea = page.getByPlaceholder(/paste your contract text/i);
    await textarea.fill("This is too short.");

    const button = page.getByRole("button", { name: /analyze contract/i });
    await expect(button).toBeDisabled();
  });

  test("analyze button enabled with sufficient text", async ({ page }) => {
    const textarea = page.getByPlaceholder(/paste your contract text/i);
    await textarea.fill(
      "This is a sample contract clause that is long enough to meet the minimum character requirement for analysis submission."
    );

    const button = page.getByRole("button", { name: /analyze contract/i });
    await expect(button).toBeEnabled();
  });

  test("shows usage counter for free users", async ({ page }) => {
    // The usage counter should show remaining analyses
    await expect(page.getByText(/3 of 3/)).toBeVisible({ timeout: 5000 });
  });

  test("submits contract and shows loading state", async ({ page }) => {
    // Mock the analyze endpoint to hang (simulates streaming)
    await page.route("**/api/analyze", (route) =>
      // Don't fulfill — simulates a pending request
      new Promise(() => {})
    );

    const textarea = page.getByPlaceholder(/paste your contract text/i);
    await textarea.fill(
      "This is a sample contract clause that is long enough to meet the minimum character requirement for analysis submission."
    );

    await page.getByRole("button", { name: /analyze contract/i }).click();

    // Should show analyzing state
    await expect(page.getByText(/analyzing/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/stop analysis/i)).toBeVisible();
  });

  test("shows upgrade modal on 429 rate limit", async ({ page }) => {
    // Set usage to limit reached
    await page.route("**/api/payment/status", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ used: 3, limit: 3, remaining: 0, isPaid: false }),
      })
    );

    // Reload to pick up new mock
    await page.goto("/analyze");

    // Set localStorage to match
    await page.evaluate(() => {
      localStorage.setItem(
        "clauseguard_usage",
        JSON.stringify({ used: 3, limit: 3, isPaid: false })
      );
    });
    await page.goto("/analyze");

    const textarea = page.getByPlaceholder(/paste your contract text/i);
    await textarea.fill(
      "This is a sample contract clause that is long enough to meet the minimum character requirement for analysis submission."
    );

    await page.getByRole("button", { name: /analyze contract/i }).click();

    // Should show the upgrade modal
    await expect(page.getByText(/upgrade to unlimited/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("paid users see unlimited badge", async ({ page }) => {
    await page.route("**/api/payment/status", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ used: 10, limit: 3, remaining: 0, isPaid: true }),
      })
    );

    // Set localStorage before navigating so initial render has paid state
    await page.goto("/analyze");
    await page.evaluate(() => {
      localStorage.setItem(
        "clauseguard_usage",
        JSON.stringify({ used: 0, limit: Infinity, isPaid: true })
      );
    });
    await page.reload();

    await expect(page.getByText(/unlimited/i)).toBeVisible({ timeout: 10000 });
  });
});
