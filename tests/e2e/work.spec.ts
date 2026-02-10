import { test, expect } from "../support/fixtures";

test.describe("Page Projets", () => {
  test("affiche le titre et le filtre", async ({ page }) => {
    await page.goto("/work");

    await expect(page.getByRole("heading", { name: /Réalisations & Projets/i })).toBeVisible();
    await expect(page.getByText("Filtrer par :")).toBeVisible();

    const projectLink = page.locator('a[href^="/work/"]').first();
    await expect(projectLink).toBeVisible();
  });

  test("permet de sélectionner un tag et d’afficher le bouton Tout réinitialiser", async ({
    page,
  }) => {
    await page.goto("/work");

    const colorTag = page
      .getByRole("button", {
        name: /Web|Mobile|E-commerce|SaaS|Métier|Vitrine/,
      })
      .first();
    await expect(colorTag).toBeVisible();
    await colorTag.click();

    await expect(page.getByText(/Tout réinitialiser/i)).toBeVisible();
  });
});
