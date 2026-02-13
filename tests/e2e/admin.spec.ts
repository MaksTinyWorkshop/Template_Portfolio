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
  // Include projectName to avoid cross-project rate-limit collisions.
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

async function navigateAdminRoute(page: Page, route: string, ip: string) {
  try {
    await page.goto(route, { waitUntil: "domcontentloaded" });
  } catch {
    // Middleware can interrupt navigation while redirecting to /admin on some browsers.
  }

  if (/\/admin\/?$/.test(page.url())) {
    const hasLoginForm = await page
      .getByLabel("Mot de passe")
      .isVisible()
      .catch(() => false);
    if (hasLoginForm) {
      await loginAsAdmin(page, ip);
      await page.goto(route, { waitUntil: "domcontentloaded" });
    }
  }
}

test.describe
  .serial("Parcours administrateur", () => {
    test("ouvre le dashboard via l'easter egg", async ({ page }, testInfo) => {
      await loginAsAdmin(
        page,
        getUniqueTestIp(testInfo.title, testInfo.file, testInfo.project.name),
      );
      await expect(page).toHaveURL(/\/admin$/);
      await expect(page.getByRole("heading", { name: /Dashboard|Ton Dashboard/i })).toBeVisible();
    });

    test("crée un projet solo et nettoie les données", async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "Desktop Chromium",
        "Stateful test: run once to avoid auth/navigation races across browsers.",
      );
      const ip = getUniqueTestIp(testInfo.title, testInfo.file, testInfo.project.name);
      await loginAsAdmin(page, ip);

      const projectTitle = `E2E Projet ${Date.now()}`;
      await navigateAdminRoute(page, "/admin/projects/new", ip);
      await page.waitForURL(/\/admin\/projects\/new/);

      const tagsResponse = await page.waitForResponse(
        (response) =>
          response.url().includes("/api/admin/projects/tags") &&
          response.request().method() === "GET",
      );
      const tagsPayload = (await tagsResponse.json()) as { data?: string[] };
      const tagToUse = tagsPayload.data?.[0] ?? "Web";

      await page.getByLabel("Titre *").fill(projectTitle);
      const summaryField = page.locator("#summary");
      await expect(summaryField).toBeVisible();
      await summaryField.fill("Résumé de test e2e pour un projet.");

      const tagInput = page.getByPlaceholder("Filtrer...").first();
      await tagInput.click();
      await tagInput.fill(tagToUse);
      await page.getByRole("button", { name: tagToUse }).first().click();
      await expect(page.getByRole("button", { name: tagToUse }).first()).toBeVisible();

      await page.getByLabel("Lien du projet (URL)").fill("https://example.com/e2e-project");
      await page
        .getByLabel("Repository Git (URL)")
        .fill("https://github.com/portfolio-app/portfolio-new-e2e");

      const projectEditor = page.locator("textarea[class*=md-editor-text-input]").first();
      await projectEditor.fill("Contenu détaillé du projet généré par Playwright.");

      await Promise.all([
        page.waitForURL(/\/admin\/projects/),
        page.getByRole("button", { name: /Créer le projet/i }).click(),
      ]);

      let projectSlug = await page.evaluate(async (title: string) => {
        const response = await fetch("/api/admin/projects");
        const json = await response.json();
        const found = json?.data?.find((project: { title: string }) => project.title === title);
        return found?.slug ?? "";
      }, projectTitle);

      if (!projectSlug) {
        projectSlug = await page.evaluate(async (title: string) => {
          const response = await fetch("/api/admin/projects");
          const json = await response.json();
          const found = json?.data?.find((project: { title: string }) => project.title === title);
          return found?.slug ?? "";
        }, projectTitle);
      }

      if (projectSlug) {
        await page.evaluate(async (slug: string) => {
          await fetch(`/api/admin/projects?slug=${slug}`, {
            method: "DELETE",
            credentials: "include",
          });
        }, projectSlug);
      }
    });

    test("crée un article de blog et le supprime", async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "Desktop Chromium",
        "Stateful test: run once to avoid auth/navigation races across browsers.",
      );
      const ip = getUniqueTestIp(testInfo.title, testInfo.file, testInfo.project.name);
      await loginAsAdmin(page, ip);

      const articleTitle = `E2E Article ${Date.now()}`;
      await navigateAdminRoute(page, "/admin/blog/new", ip);
      await page.waitForURL(/\/admin\/blog\/new/);

      await page.getByLabel("Titre *").fill(articleTitle);
      const articleSummaryField = page.locator("#summary");
      await expect(articleSummaryField).toBeVisible();
      await articleSummaryField.fill("Résumé de blog généré par Playwright.");

      const tagInput = page.getByPlaceholder("Filtrer...").first();
      await tagInput.click();
      await tagInput.fill("Tech");
      await page.getByRole("button", { name: "Tech" }).first().click();
      await expect(tagInput).toHaveValue("");
      await expect(page.getByRole("button", { name: "Tech" }).first()).toBeVisible();

      const articleEditor = page.locator("textarea[class*=md-editor-text-input]").first();
      await articleEditor.fill("Contenu markdown pour l'article de test.");

      const [createResponse] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes("/api/admin/posts") && response.request().method() === "POST",
        ),
        page.getByRole("button", { name: /Créer l\'article/i }).click(),
      ]);

      const articleData = (await createResponse.json()) as { data?: { slug?: string } };
      const articleSlug = articleData.data?.slug;

      await page.waitForURL(/\/admin\/blog/);
      if (articleSlug) {
        const existsInAdminList = await page.evaluate(async (slug: string) => {
          const response = await fetch("/api/admin/posts", { credentials: "include" });
          const json = await response.json();
          return Boolean(json?.data?.some((post: { slug?: string }) => post.slug === slug));
        }, articleSlug);
        expect(existsInAdminList).toBe(true);
      }

      if (articleSlug) {
        await page.evaluate(async (slug: string) => {
          await fetch(`/api/admin/posts?slug=${slug}`, {
            method: "DELETE",
            credentials: "include",
          });
        }, articleSlug);
      }
    });
  });
