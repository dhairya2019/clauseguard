import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navbar renders on all pages", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: "ClauseGuard" })
    ).toBeVisible();

    await page.goto("/analyze");
    await expect(
      page.getByRole("link", { name: "ClauseGuard" })
    ).toBeVisible();
  });

  test("navbar Analyze Contract link works", async ({ page }) => {
    await page.goto("/");
    await page
      .getByRole("navigation")
      .getByRole("link", { name: /analyze contract/i })
      .click();
    await expect(page).toHaveURL("/analyze");
  });

  test("navbar logo links to home", async ({ page }) => {
    await page.route("**/api/payment/status", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ used: 0, limit: 3, remaining: 3, isPaid: false }),
      })
    );

    await page.goto("/analyze");
    await page.getByRole("navigation").getByRole("link").first().click();
    await expect(page).toHaveURL("/");
  });

  test("responsive layout works on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /understand your contracts in minutes/i,
      })
    ).toBeVisible();
  });

  test("page title is correct", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/clauseguard/i);
  });
});
