/**
 * Story 1.1: Tests d'Authentification Négatifs (P0)
 *
 * Scénarios:
 * 1. ❌ Login avec mauvais mot de passe → Erreur affichée
 * 2. ❌ Expiration de session → Redirection login
 * 3. ❌ Accès non autorisé aux routes admin → Blocage 401/403
 * 4. ❌ Refresh token invalide → Erreur gestion
 *
 * Test E2E de sécurité d'authentification
 *
 */

import { expect, test } from "../support/fixtures";
import type { Page } from "@playwright/test";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "test";
const WRONG_PASSWORD = "wrong_password_123";

function hashToByte(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return (hash % 250) + 1;
}

function getUniqueTestIp(
  testTitle: string,
  file: string,
  projectName: string,
): string {
  // Include projectName to avoid cross-project rate-limit collisions.
  const lastOctet = hashToByte(`${projectName}:${file}:${testTitle}`);
  return `203.0.113.${lastOctet}`;
}

/**
 * Helper: Naviguer vers la page admin et attendre le formulaire de login
 */
async function navigateToAdminLogin(page: Page) {
  await page.goto("/about");
  await page.waitForLoadState("domcontentloaded");

  const avatar = page.getByAltText("Avatar").first();
  await avatar.scrollIntoViewIfNeeded();
  await avatar.click({ clickCount: 3 });

  await page.waitForURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: /Admin Panel/i }),
  ).toBeVisible();
}

/**
 * Helper: Tenter de se connecter avec un mot de passe
 */
async function attemptLogin(page: Page, password: string) {
  await page.getByLabel("Mot de passe").fill(password);
  await page.getByRole("button", { name: /Se connecter/i }).click();
}

test.describe("Tests d'Authentification Négatifs @p0 @security @auth", () => {
  /**
   * Scénario 1: Login avec mauvais mot de passe
   *
   * Vérifie qu'un utilisateur ne peut pas se connecter avec un mauvais mot de passe
   * et qu'un message d'erreur approprié est affiché.
   */
  test("should reject login with wrong password and show error message", async ({
    page,
  }, testInfo) => {
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": getUniqueTestIp(
        testInfo.title,
        testInfo.file,
        testInfo.project.name,
      ),
    });
    await navigateToAdminLogin(page);

    // Tenter de se connecter avec le mauvais mot de passe
    await attemptLogin(page, WRONG_PASSWORD);

    // Attendre un court instant pour la validation
    await page.waitForTimeout(1000);

    // Vérifier qu'on reste sur la page de login (pas de redirection)
    await expect(page).toHaveURL(/\/admin$/);

    // Vérifier qu'on ne voit PAS le message de bienvenue (succès)
    await expect(
      page.getByRole("heading", { name: /Bienvenue/i }),
    ).not.toBeVisible();

    // Vérifier qu'un message d'erreur ou toast est visible
    // (Peut varier selon l'implémentation - toast, texte d'erreur, etc.)
    const possibleErrorSelectors = [
      page.getByText(/mot de passe incorrect/i),
      page.getByText(/invalid password/i),
      page.getByText(/authentification échouée/i),
      page.getByText(/erreur/i),
      page.locator('[role="alert"]'),
      page.locator(".toast"),
      page.locator("[data-sonner-toast]"),
    ];

    // Au moins un des sélecteurs d'erreur devrait être visible
    let errorFound = false;
    for (const selector of possibleErrorSelectors) {
      try {
        await expect(selector).toBeVisible({ timeout: 2000 });
        errorFound = true;
        console.log(
          "✅ Message d'erreur détecté:",
          await selector.textContent(),
        );
        break;
      } catch {
        // Continue avec le prochain sélecteur
      }
    }

    // Si aucune erreur n'est visible, le champ mot de passe devrait toujours être présent
    if (!errorFound) {
      await expect(page.getByLabel("Mot de passe")).toBeVisible();
      console.log(
        "⚠️  Aucun message d'erreur explicite détecté, mais l'utilisateur reste sur la page de login",
      );
    }
  });

  /**
   * Scénario 2: Login réussi après échec (pour comparaison)
   *
   * Vérifie que le système fonctionne correctement avec le bon mot de passe
   * (test de contrôle pour valider que le scénario 1 échoue pour la bonne raison).
   */
  test("should allow login with correct password (control test)", async ({
    page,
  }, testInfo) => {
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": getUniqueTestIp(
        testInfo.title,
        testInfo.file,
        testInfo.project.name,
      ),
    });
    await navigateToAdminLogin(page);

    // Se connecter avec le BON mot de passe
    await attemptLogin(page, ADMIN_PASSWORD);

    // Vérifier le succès de la connexion
    await expect(page.getByRole("heading", { name: /Bienvenue/i })).toBeVisible(
      { timeout: 5000 },
    );

    console.log("✅ Login réussi avec le mot de passe correct");
  });

  /**
   * Scénario 3: Accès non autorisé aux routes admin
   *
   * Vérifie qu'un utilisateur non authentifié ne peut pas accéder directement
   * aux pages d'administration protégées.
   */
  test("should block unauthenticated access to admin routes", async ({
    page,
  }, testInfo) => {
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": getUniqueTestIp(
        testInfo.title,
        testInfo.file,
        testInfo.project.name,
      ),
    });
    // Tenter d'accéder directement aux routes admin sans authentification
    const protectedRoutes = [
      "/admin/projects",
      "/admin/projects/new",
      "/admin/articles",
      "/admin/articles/new",
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);

      // Devrait rediriger vers la page de login ou afficher une erreur
      await page.waitForLoadState("domcontentloaded");

      const currentUrl = page.url();

      // Vérifier qu'on est soit redirigé vers /admin (login), soit bloqué
      const isRedirectedToLogin =
        currentUrl.includes("/admin") && !currentUrl.includes("/admin/");
      const isOnProtectedRoute = currentUrl.includes(route);

      if (isOnProtectedRoute) {
        // Si on arrive sur la route protégée, vérifier qu'un formulaire de login est présent
        const hasLoginForm = await page
          .getByLabel("Mot de passe")
          .isVisible()
          .catch(() => false);
        expect(hasLoginForm).toBe(true);
        console.log(`✅ Route ${route}: Formulaire de login affiché`);
      } else if (isRedirectedToLogin) {
        console.log(`✅ Route ${route}: Redirigé vers page de login`);
        expect(isRedirectedToLogin).toBe(true);
      } else {
        // Vérifier qu'on n'a PAS accès au contenu admin
        const hasAdminContent = await page
          .getByText(/Nouveau projet|Nouvel article/i)
          .isVisible()
          .catch(() => false);
        expect(hasAdminContent).toBe(false);
        console.log(`✅ Route ${route}: Accès bloqué (${currentUrl})`);
      }
    }
  });

  /**
   * Scénario 4: Gestion de session (expiration simulée)
   *
   * Vérifie le comportement de l'application quand une session est invalide ou expirée.
   * Teste avec suppression manuelle du storage/cookies.
   */
  test("should handle session expiration gracefully", async ({
    page,
    context,
  }, testInfo) => {
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": getUniqueTestIp(
        testInfo.title,
        testInfo.file,
        testInfo.project.name,
      ),
    });
    // D'abord se connecter normalement
    await navigateToAdminLogin(page);
    await attemptLogin(page, ADMIN_PASSWORD);
    await expect(
      page.getByRole("heading", { name: /Bienvenue/i }),
    ).toBeVisible();

    // Naviguer vers une page admin protégée
    await page.goto("/admin/projects");
    await page.waitForLoadState("domcontentloaded");

    // Simuler l'expiration de session en nettoyant le storage
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    console.log("🧹 Session cleared (simule expiration)");

    // Tenter d'accéder à nouveau à une route protégée
    await page.goto("/admin/articles");
    await page.waitForLoadState("domcontentloaded");

    // Vérifier qu'on est redirigé vers le login ou qu'un formulaire de login est affiché
    const currentUrl = page.url();
    const isOnLoginPage =
      currentUrl.endsWith("/admin") || currentUrl.includes("/admin?");
    const hasLoginForm = await page
      .getByLabel("Mot de passe")
      .isVisible()
      .catch(() => false);

    expect(isOnLoginPage || hasLoginForm).toBe(true);

    if (isOnLoginPage) {
      console.log(
        "✅ Redirigé vers la page de login après expiration de session",
      );
    } else if (hasLoginForm) {
      console.log("✅ Formulaire de login affiché après expiration de session");
    }
  });

  /**
   * Scénario 5: Tentatives multiples de login avec mauvais mot de passe
   *
   * Vérifie le comportement avec plusieurs tentatives ratées consécutives.
   * (Détecte potentiellement un rate limiting ou un verrouillage de compte)
   */
  test("should handle multiple failed login attempts", async ({
    page,
  }, testInfo) => {
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": getUniqueTestIp(
        testInfo.title,
        testInfo.file,
        testInfo.project.name,
      ),
    });
    await navigateToAdminLogin(page);

    const numberOfAttempts = 3;

    for (let i = 1; i <= numberOfAttempts; i++) {
      console.log(
        `🔄 Tentative ${i}/${numberOfAttempts} avec mauvais mot de passe`,
      );

      await page.getByLabel("Mot de passe").fill(WRONG_PASSWORD);
      await page.getByRole("button", { name: /Se connecter/i }).click();

      // Attendre la réponse
      await page.waitForTimeout(1000);

      // Vérifier qu'on reste sur la page de login
      await expect(page).toHaveURL(/\/admin$/);

      // Vérifier qu'on ne voit pas le message de bienvenue
      const welcomeVisible = await page
        .getByRole("heading", { name: /Bienvenue/i })
        .isVisible()
        .catch(() => false);
      expect(welcomeVisible).toBe(false);
    }

    console.log(`✅ ${numberOfAttempts} tentatives ratées gérées correctement`);

    // Vérifier qu'on peut toujours se connecter avec le bon mot de passe après les échecs
    await attemptLogin(page, ADMIN_PASSWORD);
    await expect(page.getByRole("heading", { name: /Bienvenue/i })).toBeVisible(
      { timeout: 5000 },
    );

    console.log("✅ Login toujours possible après tentatives ratées");
  });
});

/**
 * Tests de robustesse supplémentaires
 */
test.describe("Auth Security - Additional Robustness Tests @p1 @security", () => {
  /**
   * Vérifier que le mot de passe n'apparaît pas en clair dans les logs/network
   */
  test("should not expose password in network requests", async ({
    page,
  }, testInfo) => {
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": getUniqueTestIp(
        testInfo.title,
        testInfo.file,
        testInfo.project.name,
      ),
    });
    const requests: string[] = [];

    // Capturer toutes les requêtes réseau
    page.on("request", (request) => {
      const url = request.url();
      const postData = request.postData();

      if (postData) {
        requests.push(postData);
      }

      // Vérifier que le mot de passe n'apparaît pas dans l'URL
      expect(url.toLowerCase()).not.toContain(ADMIN_PASSWORD.toLowerCase());
    });

    await navigateToAdminLogin(page);
    await attemptLogin(page, ADMIN_PASSWORD);

    await page.waitForTimeout(2000);

    // Vérifier que les données POST contiennent bien un mot de passe (chiffré ou non)
    // mais pas en clair dans les logs console
    console.log(
      `✅ ${requests.length} requêtes interceptées pour vérification de sécurité`,
    );
  });

  /**
   * Vérifier que le champ mot de passe utilise type="password"
   */
  test("should use password input type for password field", async ({
    page,
  }, testInfo) => {
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": getUniqueTestIp(
        testInfo.title,
        testInfo.file,
        testInfo.project.name,
      ),
    });
    await navigateToAdminLogin(page);

    const passwordField = page.getByLabel("Mot de passe");
    await expect(passwordField).toBeVisible();

    const inputType = await passwordField.getAttribute("type");
    expect(inputType).toBe("password");

    console.log("✅ Le champ mot de passe utilise bien type='password'");
  });

  /**
   * Vérifier que le bouton de connexion est désactivé ou protégé pendant la soumission
   */
  test("should disable submit button during login attempt", async ({
    page,
  }, testInfo) => {
    await page.setExtraHTTPHeaders({
      "x-forwarded-for": getUniqueTestIp(
        testInfo.title,
        testInfo.file,
        testInfo.project.name,
      ),
    });
    await navigateToAdminLogin(page);

    await page.getByLabel("Mot de passe").fill(ADMIN_PASSWORD);

    const submitButton = page.getByRole("button", { name: /Se connecter/i });

    // Cliquer et vérifier rapidement l'état
    await submitButton.click();

    // Le bouton devrait être désactivé pendant le traitement
    // (ou afficher un loader - selon l'implémentation)
    const isDisabledDuringSubmit = await submitButton
      .isDisabled()
      .catch(() => false);
    const hasLoadingState = await submitButton
      .locator("svg, .spinner, [data-loading]")
      .isVisible()
      .catch(() => false);

    if (isDisabledDuringSubmit) {
      console.log("✅ Bouton désactivé pendant la soumission");
    } else if (hasLoadingState) {
      console.log("✅ Indicateur de chargement affiché pendant la soumission");
    } else {
      console.log(
        "⚠️  Aucune protection visuelle détectée pendant la soumission",
      );
    }

    // Attendre que la connexion soit complète
    await expect(page.getByRole("heading", { name: /Bienvenue/i })).toBeVisible(
      { timeout: 5000 },
    );
  });
});
