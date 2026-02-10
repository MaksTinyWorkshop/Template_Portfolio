import { test, expect } from "../support/fixtures";

test.describe("Page blog", () => {
  test("affiche le titre principal et la section Posts récents", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByRole("heading", { name: /Blog Tech & Développement/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Posts récents/i })).toBeVisible();
  });

  test("liste plusieurs articles avec des liens vers /blog/", async ({ page }) => {
    await page.goto("/blog");

    const blogLinks = page.locator('a[href^="/blog/"]');
    await expect(blogLinks.first()).toBeVisible();
    await expect(await blogLinks.count()).toBeGreaterThan(0);
  });
});
