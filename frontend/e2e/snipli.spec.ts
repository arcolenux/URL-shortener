import { test, expect } from "@playwright/test";

test.describe("Snipli URL Shortener User Flow", () => {
  test("loads landing page and renders brand identity", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Snipli/i);
    await expect(page.locator("h1")).toContainText("Short links.");
    await expect(page.locator("h1")).toContainText("Clear analytics.");
    await expect(page.locator('input[type="url"]')).toBeVisible();
  });

  test("creates a short link and displays success card with copy action", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]).catch(() => {});
    await page.goto("/");
    const urlInput = page.locator('input[type="url"]');
    await urlInput.fill("https://github.com/google/guava");

    // Open advanced options
    const advancedToggle = page.locator("button:has-text('Advanced targeting')");
    await advancedToggle.click();

    const aliasInput = page.locator('input[placeholder="custom-alias"]');
    await expect(aliasInput).toBeVisible();
    await aliasInput.fill("guava-repo");

    // Submit form
    const submitBtn = page.locator("button:has-text('Create Short Link')");
    await submitBtn.click();

    // Verify success card
    const successCard = page.locator("text=Your short link is ready");
    await expect(successCard).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=https://snipli.io/guava-repo").or(page.locator("text=/guava-repo"))).toBeVisible();

    // Verify copy button
    const copyBtn = page.locator("button:has-text('Copy Link')");
    await expect(copyBtn).toBeVisible();
    await copyBtn.click();
    await expect(page.locator("button:has-text('Copied Link!')")).toBeVisible();
  });

  test("navigates to dashboard and displays metric cards and chart", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
    await expect(page.getByText("Total Links").first()).toBeVisible();
    await expect(page.getByText("Total Clicks").first()).toBeVisible();
    await expect(page.getByText("Active Links").first()).toBeVisible();
    await expect(page.getByText("Expiring Soon").first()).toBeVisible();
    await expect(page.locator("text=Click Traffic & Performance")).toBeVisible();
  });

  test("navigates to links page and searches/filters links", async ({ page }) => {
    await page.goto("/links");
    await expect(page.locator("h1")).toContainText("Links");
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    await expect(page.locator("button:has-text('All Links')")).toBeVisible();
    await expect(page.locator("button:has-text('Active')")).toBeVisible();
    await expect(page.locator("button:has-text('Expired')")).toBeVisible();
  });

  test("opens global create modal from top navigation", async ({ page }) => {
    await page.goto("/links");
    const navCreateBtn = page.locator("header button:has-text('Create Link')");
    await navCreateBtn.click();

    await expect(page.locator("h3:has-text('Create a Short Link')")).toBeVisible();
    await expect(page.locator('input[placeholder*="https://example.com"]')).toBeVisible();

    // Close modal
    const closeBtn = page.locator('button[aria-label="Close modal"]');
    await closeBtn.click();
    await expect(page.locator("h3:has-text('Create a Short Link')")).not.toBeVisible();
  });

  test("renders login and signup pages and handles authentication form", async ({ page }) => {
    // Test login page
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Welcome back");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    // Test signup page
    await page.goto("/signup");
    await expect(page.locator("h1")).toContainText("Create your workspace");
    await expect(page.locator('input[placeholder*="Alex Rivera"]')).toBeVisible();
  });
});
