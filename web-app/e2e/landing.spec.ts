import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero section with title and CTA", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: /understand your contracts in minutes/i,
      })
    ).toBeVisible();

    await expect(
      page.getByText(/paste any contract and get instant/i)
    ).toBeVisible();

    const cta = page.getByRole("link", { name: /analyze a contract free/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/analyze");
  });

  test("renders How It Works section with 3 steps", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /how it works/i })
    ).toBeVisible();

    await expect(
      page.getByText("Paste Your Contract", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("AI Analyzes Every Clause", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText("Get Actionable Results", { exact: true })
    ).toBeVisible();

    await expect(page.getByText("Step 1")).toBeVisible();
    await expect(page.getByText("Step 2")).toBeVisible();
    await expect(page.getByText("Step 3")).toBeVisible();
  });

  test("renders Pricing section with Free and Pro plans", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /simple pricing/i })
    ).toBeVisible();

    await expect(page.getByText("$0")).toBeVisible();
    await expect(page.getByText("3 analyses per month")).toBeVisible();

    const startFree = page.getByRole("link", { name: /start free/i });
    await expect(startFree).toBeVisible();
    await expect(startFree).toHaveAttribute("href", "/analyze");

    await expect(page.getByText("Coming Soon")).toBeVisible();
  });

  test("renders FAQ section with questions", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /frequently asked questions/i })
    ).toBeVisible();

    await expect(
      page.getByText(/is clauseguard a replacement for a lawyer/i)
    ).toBeVisible();
    await expect(
      page.getByText(/what types of contracts can i analyze/i)
    ).toBeVisible();
    await expect(
      page.getByText(/is my contract data stored/i)
    ).toBeVisible();
  });

  test("CTA navigates to analyze page", async ({ page }) => {
    await page.getByRole("link", { name: /analyze a contract free/i }).click();
    await expect(page).toHaveURL("/analyze");
    await expect(
      page.getByRole("heading", { name: /analyze your contract/i })
    ).toBeVisible();
  });
});
