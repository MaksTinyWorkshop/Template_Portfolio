import { expect, test } from "../support/fixtures";
import type { Page } from "@playwright/test";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "test";

function hashToByte(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash % 250) + 1;
}

function getUniqueTestIp(testTitle: string, file: string, projectName: string): string {
  const lastOctet = hashToByte(`${projectName}:${file}:${testTitle}`);
  return `203.0.113.${lastOctet}`;
}

async function loginAsAdmin(page: Page, ip: string) {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip });
  await page.goto("/about");
  await page.waitForLoadState("domcontentloaded");

  const avatar = page.getByAltText("Avatar").first();
  await avatar.scrollIntoViewIfNeeded();
  await avatar.click({ clickCount: 3 });

  await page.waitForURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /Admin Panel/i })).toBeVisible();

  await page.getByLabel("Mot de passe").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /Se connecter/i }).click();

  await expect(page.getByRole("heading", { name: /Dashboard|Ton Dashboard/i })).toBeVisible();
}

const slugifyForTags = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

test.describe
  .serial("Admin Tags @admin @tags @e2e", () => {
    test("crée, édite (URL=slug) et supprime un tag", async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "Desktop Chromium",
        "Stateful test: run once to avoid shared DB races across browsers.",
      );
      await loginAsAdmin(
        page,
        getUniqueTestIp(testInfo.title, testInfo.file, testInfo.project.name),
      );

      const uniqueSuffix = Date.now();
      const tagName = `E2E Tag ${uniqueSuffix}`;
      const tagSlug = slugifyForTags(tagName);
      const updatedName = `${tagName} v2`;
      const updatedSlug = slugifyForTags(updatedName);

      await page.goto("/admin/tags/new");
      await page.waitForLoadState("domcontentloaded");

      await page.locator("#name").fill(tagName);
      await page.locator('input[type="radio"][value="global"]').check();
      await page.locator("#color-text").fill("#123456");
      await page
        .locator('textarea[placeholder^="Brève description"]')
        .fill("Tag créé par Playwright");

      await Promise.all([
        page.waitForURL(/\/admin\/tags$/),
        page.getByRole("button", { name: /Créer le tag/i }).click(),
      ]);

      await expect(page.getByText(tagName).first()).toBeVisible();

      // Accès direct à la page d'édition via slug (sans ID dans l'URL)
      await page.goto(`/admin/tags/${encodeURIComponent(tagSlug)}`);
      await expect(page).toHaveURL(new RegExp(`/admin/tags/${tagSlug}$`));
      await expect(page.getByRole("heading", { name: /Éditer le tag/i })).toBeVisible();
      await expect(page.locator("#name")).toHaveValue(tagName);

      // Mettre à jour le nom -> slug regénéré
      await page.locator("#name").fill(updatedName);
      await Promise.all([
        page.waitForURL(/\/admin\/tags$/),
        page.getByRole("button", { name: /Mettre à jour/i }).click(),
      ]);

      await expect(page.getByText(updatedName).first()).toBeVisible();

      // Nettoyage via API (robuste)
      const deleteStatus = await page.evaluate(async (slug: string) => {
        const res = await fetch(`/api/admin/tags/${encodeURIComponent(slug)}`, {
          method: "DELETE",
          credentials: "include",
        });
        return res.status;
      }, updatedSlug);
      expect(deleteStatus).toBe(200);

      await page.goto("/admin/tags");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.getByText(updatedName)).toHaveCount(0);
    });
  });
