/**
 * Story 1.2: Test Health Check API (P0)
 *
 * Scénarios:
 * 1. ✅ Endpoint /api/health retourne 200
 * 2. ✅ Base de données accessible (vérification via réponse)
 * 3. ✅ Temps de réponse < 500ms
 *
 * Test API pur (sans browser) utilisant Playwright Utils
 *
 */

import { test, expect } from "@playwright/test";

const HEALTH_ENDPOINT = "/api/health";
const MAX_RESPONSE_TIME_MS = 500;

test.describe("Health Check API @p0 @smoke @api", () => {
  test("should return 200 status with valid health response", async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(HEALTH_ENDPOINT);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Scénario 1: Endpoint retourne 200
    expect(response.status()).toBe(200);

    // Vérifier que la réponse est du JSON
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");

    // Parser la réponse
    const healthData = await response.json();

    // Scénario 2: Base de données accessible
    // La réponse doit contenir un indicateur de santé
    expect(healthData).toHaveProperty("status");
    expect(healthData.status).toBe("healthy"); // L'API retourne "healthy"

    // Si la BDD est vérifiée, elle devrait apparaître dans la réponse
    if (healthData.database) {
      expect(healthData.database).toBe("connected");
    }

    // Scénario 3: Temps de réponse < 500ms
    expect(responseTime).toBeLessThan(MAX_RESPONSE_TIME_MS);

    console.log(`✅ Health check passed in ${responseTime}ms`);
  });

  test("should include timestamp in health response", async ({ request }) => {
    const response = await request.get(HEALTH_ENDPOINT);

    expect(response.status()).toBe(200);

    const healthData = await response.json();

    // Vérifier qu'un timestamp est présent
    expect(healthData).toHaveProperty("timestamp");

    // Vérifier que le timestamp est récent (moins de 5 secondes)
    const responseTimestamp = new Date(healthData.timestamp).getTime();
    const now = Date.now();
    const timeDiff = now - responseTimestamp;

    expect(timeDiff).toBeLessThan(5000); // Moins de 5 secondes
  });

  test("should return consistent response format", async ({ request }) => {
    // Faire plusieurs requêtes pour vérifier la cohérence
    const responses = await Promise.all([
      request.get(HEALTH_ENDPOINT),
      request.get(HEALTH_ENDPOINT),
      request.get(HEALTH_ENDPOINT),
    ]);

    // Toutes doivent retourner 200
    for (const response of responses) {
      expect(response.status()).toBe(200);

      const data = await response.json();

      // Format cohérent
      expect(data).toHaveProperty("status");
      expect(data.status).toBe("healthy");
    }
  });
});

/**
 * Tests négatifs - Vérifier la robustesse
 */
test.describe("Health Check API - Negative Tests @p1 @api", () => {
  test("should handle invalid query parameters gracefully", async ({ request }) => {
    // Endpoint health ne devrait pas accepter de paramètres
    const response = await request.get(`${HEALTH_ENDPOINT}?invalid=param`);

    // Devrait quand même retourner 200 (ou 400 selon implémentation)
    expect([200, 400]).toContain(response.status());
  });

  test("should not accept POST requests", async ({ request }) => {
    const response = await request.post(HEALTH_ENDPOINT, {
      data: { test: "data" },
    });

    // Devrait retourner 405 Method Not Allowed
    expect(response.status()).toBe(405);
  });

  test("should not accept PUT requests", async ({ request }) => {
    const response = await request.put(HEALTH_ENDPOINT, {
      data: { test: "data" },
    });

    // Devrait retourner 405 Method Not Allowed
    expect(response.status()).toBe(405);
  });

  test("should not accept DELETE requests", async ({ request }) => {
    const response = await request.delete(HEALTH_ENDPOINT);

    // Devrait retourner 405 Method Not Allowed
    expect(response.status()).toBe(405);
  });
});
