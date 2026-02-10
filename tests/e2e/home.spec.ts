import { test, expect } from "../support/fixtures";

test.describe("Page d’accueil", () => {
  test("affiche le hero avec l’accroche principale", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Du développement utile/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Autres projets/i })).toBeVisible();
  });

  test("propose un bouton vers la page À propos", async ({ page }) => {
    await page.goto("/");

    const aboutLink = page.locator("#about");
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toHaveAttribute("href", "/about");
  });

  test("montre les sections Dernier projet et Derniers articles publiés", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Dernier projet/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Derniers articles publiés/i })).toBeVisible();
  });
});
