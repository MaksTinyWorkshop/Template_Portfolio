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
  await page.waitForURL(/\/admin$/);
  await expect(page.getByRole("heading", { name: /Dashboard|Ton Dashboard/i })).toBeVisible();
}

test.describe
  .serial("Admin Persons @admin @persons @e2e", () => {
    test("crée, édite et supprime une personne", async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "Desktop Chromium",
        "Stateful test: run once to avoid shared DB races across browsers.",
      );

      await loginAsAdmin(
        page,
        getUniqueTestIp(testInfo.title, testInfo.file, testInfo.project.name),
      );

      const uniqueSuffix = Date.now();
      const firstName = `E2E${uniqueSuffix}`;
      const lastName = "Person";
      const pseudo = `e2e-person-${uniqueSuffix}`;
      const email = `e2e-person-${uniqueSuffix}@example.com`;
      const initialRole = "QA";
      const updatedRole = "Lead QA";

      await page.goto("/admin/persons/new");
      await page.waitForLoadState("domcontentloaded");

      await page.locator("#firstName").fill(firstName);
      await page.locator("#lastName").fill(lastName);
      await page.locator("#pseudo").fill(pseudo);
      await page.locator("#role").fill(initialRole);
      await page.locator("#email").fill(email);

      await Promise.all([
        page.waitForURL(/\/admin\/persons$/),
        page.getByRole("button", { name: /Créer la personne/i }).click(),
      ]);

      await expect(page.getByText(pseudo).first()).toBeVisible();

      const createdPerson = await page.evaluate(async (targetEmail: string) => {
        const response = await fetch("/api/admin/persons", {
          credentials: "include",
        });
        if (!response.ok) return null;
        const json = (await response.json()) as {
          success?: boolean;
          data?: Array<{ id: string; email: string | null; pseudo: string | null }>;
        };
        if (!json.success || !Array.isArray(json.data)) return null;
        return json.data.find((entry) => entry.email === targetEmail) ?? null;
      }, email);

      expect(createdPerson?.id).toBeTruthy();
      const personId = createdPerson?.id as string;

      await page.goto(`/admin/persons/${personId}`);
      await expect(page.getByRole("heading", { name: /Éditer la personne/i })).toBeVisible();
      await expect(page.locator("#role")).toHaveValue(initialRole);

      await page.locator("#role").fill(updatedRole);
      await Promise.all([
        page.waitForURL(/\/admin\/persons$/),
        page.getByRole("button", { name: /Mettre à jour/i }).click(),
      ]);

      await expect(page.getByText(new RegExp(`${firstName}\\s+${lastName}`)).first()).toBeVisible();
      await expect(page.getByText(new RegExp(`•\\s+${updatedRole}`)).first()).toBeVisible();

      const deleteStatus = await page.evaluate(async (id: string) => {
        const response = await fetch(`/api/admin/persons/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        return response.status;
      }, personId);
      expect(deleteStatus).toBe(200);

      await page.goto("/admin/persons");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.getByText(pseudo)).toHaveCount(0);
    });

    test("refuse la suppression du site owner via API admin", async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "Desktop Chromium",
        "Stateful test: run once to avoid shared DB races across browsers.",
      );

      await loginAsAdmin(
        page,
        getUniqueTestIp(testInfo.title, testInfo.file, testInfo.project.name),
      );

      const owner = await page.evaluate(async () => {
        const response = await fetch("/api/admin/persons", {
          credentials: "include",
        });
        if (!response.ok) return null;
        const json = (await response.json()) as {
          success?: boolean;
          data?: Array<{ id: string; siteOwner: boolean }>;
        };
        if (!json.success || !Array.isArray(json.data)) return null;
        return json.data.find((entry) => entry.siteOwner) ?? null;
      });

      expect(owner?.id).toBeTruthy();

      const deletionResult = await page.evaluate(async (id: string) => {
        const response = await fetch(`/api/admin/persons/${id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const payload = (await response.json()) as { success?: boolean; error?: string };
        return {
          status: response.status,
          success: Boolean(payload.success),
          error: payload.error ?? "",
        };
      }, owner?.id as string);

      expect(deletionResult.status).toBe(422);
      expect(deletionResult.success).toBe(false);
      expect(deletionResult.error).toMatch(/propriétaire|site/i);
    });

    test("supprime une personne non-owner via l'UI", async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "Desktop Chromium",
        "Stateful test: run once to avoid shared DB races across browsers.",
      );

      await loginAsAdmin(
        page,
        getUniqueTestIp(testInfo.title, testInfo.file, testInfo.project.name),
      );

      const uniqueSuffix = Date.now();
      const payload = {
        firstName: `Ui${uniqueSuffix}`,
        lastName: "Delete",
        pseudo: `e2e-ui-delete-${uniqueSuffix}`,
        role: "Tester",
        email: `e2e-ui-delete-${uniqueSuffix}@example.com`,
      };

      const created = await page.evaluate(async (input) => {
        const response = await fetch("/api/admin/persons", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        });
        const json = (await response.json()) as {
          success?: boolean;
          data?: { id?: string };
          error?: string;
        };
        return {
          status: response.status,
          success: Boolean(json.success),
          id: json.data?.id ?? "",
          error: json.error ?? "",
        };
      }, payload);

      expect(created.status).toBe(200);
      expect(created.success).toBe(true);
      expect(created.id).toBeTruthy();

      await page.goto("/admin/persons");
      await page.waitForLoadState("domcontentloaded");
      await expect(page.getByText(payload.pseudo).first()).toBeVisible();

      const personCard = page.locator(`[data-person-id="${created.id}"]`);
      await personCard.getByTestId("person-menu-trigger").click();
      await personCard.getByTestId("person-delete-action").click();

      const confirmDialog = page.getByRole("dialog");
      await expect(confirmDialog).toBeVisible();

      await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().includes(`/api/admin/persons/${created.id}`) &&
            response.request().method() === "DELETE" &&
            response.status() === 200,
        ),
        confirmDialog.getByRole("button", { name: /^Supprimer$/i }).click(),
      ]);

      await expect(page.locator(`[data-person-id="${created.id}"]`)).toHaveCount(0);
    });
  });
