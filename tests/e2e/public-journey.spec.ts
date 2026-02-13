import { test, expect } from "../support/fixtures";
import type { Page } from "@playwright/test";

const navigateTo = async (page: Page, href: string, fallbackLabel: RegExp) => {
  const navLink = page.locator(`a[href="${href}"]`).first();
  if (await navLink.isVisible()) {
    await navLink.click({ force: true });
    return;
  }

  const navButton = page.getByRole("button", { name: fallbackLabel }).first();
  if ((await navButton.count()) > 0 && (await navButton.isVisible())) {
    await navButton.click({ force: true });
    return;
  }

  await page.goto(href);
};

test.describe("Parcours public complet", () => {
  test("navigue entre home, work et blog avec filtres actifs", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /Du développement utile, pensé pour durer/i }),
    ).toBeVisible();

    await navigateTo(page, "/work", /Projets/i);

    await expect(page).toHaveURL(/\/work/);
    await expect(page.getByRole("heading", { name: /Réalisations & Projets/i })).toBeVisible();

    const firstTag = page
      .getByRole("button", {
        name: /Web|Mobile|E-commerce|SaaS|Métier|Vitrine/i,
      })
      .first();
    await expect(firstTag).toBeVisible();
    await firstTag.click();

    await expect(page.getByText(/Tout réinitialiser/i)).toBeVisible();
    await expect(page.locator('a[href^="/work/"]').first()).toBeVisible();

    await navigateTo(page, "/blog", /Blog/i);

    await expect(page).toHaveURL(/\/blog/);
    await expect(page.getByRole("heading", { name: /Blog Tech & Développement/i })).toBeVisible();
    await expect(page.locator('a[href^="/blog/"]').first()).toBeVisible();
  });

  test("les liens externes s’ouvrent dans un nouvel onglet", async ({ page }) => {
    await page.goto("/legal");

    const footerLink = page.getByRole("link", { name: /Once UI/i });
    await expect(footerLink).toHaveAttribute("href", "https://once-ui.com/");
    await expect(footerLink).toHaveAttribute("target", "_blank");
    await expect(footerLink).toHaveAttribute("rel", /noopener noreferrer/);
  });
});
