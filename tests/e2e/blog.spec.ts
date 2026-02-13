import { test, expect } from "../support/fixtures";

test.describe("Page blog", () => {
  test("affiche le titre principal", async ({ page }) => {
    await page.goto("/blog");

    await expect(page.getByRole("heading", { name: /Blog Tech & Développement/i })).toBeVisible();
  });

  test("liste plusieurs articles avec des liens vers /blog/", async ({ page }) => {
    await page.goto("/blog");

    const blogLinks = page.locator('a[href^="/blog/"]');
    await expect(blogLinks.first()).toBeVisible();
    await expect(await blogLinks.count()).toBeGreaterThan(0);
  });
});
