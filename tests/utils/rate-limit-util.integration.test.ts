import { prisma } from "@/lib/prisma";
import { checkRateLimit, cleanupExpiredRateLimits, resetRateLimit } from "@/lib/utils/rate-limit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * Tests d'intégration rate limiting avec vraie BDD
 * Valide le comportement réel avec PostgreSQL
 */
const shouldRunDbIntegration = process.env.RUN_DB_INTEGRATION === "true";

describe.skipIf(!shouldRunDbIntegration)("Rate Limiting - Intégration DB", () => {
  const testKeyPrefix = "test-integration";

  beforeEach(async () => {
    // Cleanup avant chaque test
    await prisma.rateLimit.deleteMany({
      where: {
        key: {
          startsWith: testKeyPrefix,
        },
      },
    });
  });

  afterEach(async () => {
    // Cleanup après chaque test
    await prisma.rateLimit.deleteMany({
      where: {
        key: {
          startsWith: testKeyPrefix,
        },
      },
    });
  });

  describe("checkRateLimit()", () => {
    it("autorise les requêtes sous la limite", async () => {
      const key = `${testKeyPrefix}:under-limit`;
      const config = { key, maxRequests: 5, windowSeconds: 60 };

      // Première requête
      const result1 = await checkRateLimit(config);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(4);

      // Deuxième requête
      const result2 = await checkRateLimit(config);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(3);

      // Troisième requête
      const result3 = await checkRateLimit(config);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(2);
    });

    it("bloque les requêtes au-delà de la limite", async () => {
      const key = `${testKeyPrefix}:over-limit`;
      const config = { key, maxRequests: 3, windowSeconds: 60 };

      // Consommer la limite (3 requêtes)
      const result1 = await checkRateLimit(config);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(2);

      const result2 = await checkRateLimit(config);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);

      const result3 = await checkRateLimit(config);
      expect(result3.allowed).toBe(true);
      expect(result3.remaining).toBe(0);

      // Quatrième requête devrait être bloquée
      const result4 = await checkRateLimit(config);
      expect(result4.allowed).toBe(false);
      expect(result4.remaining).toBe(0);

      // Cinquième aussi
      const result5 = await checkRateLimit(config);
      expect(result5.allowed).toBe(false);
      expect(result5.remaining).toBe(0);
    });

    it("réinitialise après expiration de la fenêtre", async () => {
      const key = `${testKeyPrefix}:window-expiry`;
      const config = { key, maxRequests: 2, windowSeconds: 1 }; // 1 seconde

      // Première requête
      const result1 = await checkRateLimit(config);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(1);

      // Deuxième requête (atteint la limite)
      const result2 = await checkRateLimit(config);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(0);

      // Troisième requête bloquée
      const result3 = await checkRateLimit(config);
      expect(result3.allowed).toBe(false);

      // Attendre expiration (1.1s pour être sûr)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Quatrième requête devrait passer (fenêtre expirée)
      const result4 = await checkRateLimit(config);
      expect(result4.allowed).toBe(true);
      expect(result4.remaining).toBe(1);
    });

    it("gère correctement les clés différentes", async () => {
      const key1 = `${testKeyPrefix}:key-isolation-1`;
      const key2 = `${testKeyPrefix}:key-isolation-2`;
      const config1 = { key: key1, maxRequests: 2, windowSeconds: 60 };
      const config2 = { key: key2, maxRequests: 2, windowSeconds: 60 };

      // Consommer limite key1
      await checkRateLimit(config1);
      await checkRateLimit(config1);
      const result1 = await checkRateLimit(config1);
      expect(result1.allowed).toBe(false); // key1 bloquée

      // key2 devrait encore passer
      const result2 = await checkRateLimit(config2);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(1);
    });
  });

  describe("resetRateLimit()", () => {
    it("réinitialise le compteur pour une clé donnée", async () => {
      const key = `${testKeyPrefix}:reset-test`;
      const config = { key, maxRequests: 2, windowSeconds: 60 };

      // Consommer la limite
      await checkRateLimit(config);
      await checkRateLimit(config);
      const resultBlocked = await checkRateLimit(config);
      expect(resultBlocked.allowed).toBe(false);

      // Reset
      await resetRateLimit(key);

      // Devrait repasser
      const resultAfterReset = await checkRateLimit(config);
      expect(resultAfterReset.allowed).toBe(true);
      expect(resultAfterReset.remaining).toBe(1);
    });

    it("ne fait rien si la clé n'existe pas", async () => {
      const key = `${testKeyPrefix}:non-existent`;

      // Ne devrait pas throw
      await expect(resetRateLimit(key)).resolves.toBeUndefined();
    });
  });

  describe("cleanupExpiredRateLimits()", () => {
    it("supprime les entrées expirées", async () => {
      const key1 = `${testKeyPrefix}:cleanup-expired`;
      const key2 = `${testKeyPrefix}:cleanup-active`;

      // Créer une entrée expirée (fenêtre de 1s)
      await checkRateLimit({ key: key1, maxRequests: 5, windowSeconds: 1 });

      // Créer une entrée active (fenêtre de 3600s)
      await checkRateLimit({ key: key2, maxRequests: 5, windowSeconds: 3600 });

      // Attendre expiration de key1
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Cleanup
      const deletedCount = await cleanupExpiredRateLimits();
      expect(deletedCount).toBeGreaterThanOrEqual(1);

      // Vérifier que key1 n'existe plus
      const record1 = await prisma.rateLimit.findUnique({ where: { key: key1 } });
      expect(record1).toBeNull();

      // Vérifier que key2 existe toujours
      const record2 = await prisma.rateLimit.findUnique({ where: { key: key2 } });
      expect(record2).not.toBeNull();
    });

    it("retourne 0 si aucune entrée expirée", async () => {
      // Créer uniquement des entrées actives
      await checkRateLimit({
        key: `${testKeyPrefix}:cleanup-none`,
        maxRequests: 5,
        windowSeconds: 3600,
      });

      const deletedCount = await cleanupExpiredRateLimits();
      expect(deletedCount).toBe(0);
    });
  });

  describe("Race Conditions (concurrence)", () => {
    it("gère les requêtes concurrentes correctement", async () => {
      const key = `${testKeyPrefix}:concurrent`;
      const config = { key, maxRequests: 5, windowSeconds: 60 };

      // Lancer 10 requêtes en parallèle
      const results = await Promise.all(Array.from({ length: 10 }, () => checkRateLimit(config)));

      // Les 5 premières devraient passer
      const allowed = results.filter((r) => r.allowed);
      const blocked = results.filter((r) => !r.allowed);

      expect(allowed.length).toBe(5);
      expect(blocked.length).toBe(5);
    });
  });

  describe("Headers resetAt", () => {
    it("renvoie un resetAt cohérent", async () => {
      const key = `${testKeyPrefix}:reset-at`;
      const config = { key, maxRequests: 5, windowSeconds: 300 }; // 5 min

      const now = Date.now();
      const result = await checkRateLimit(config);

      expect(result.resetAt).toBeGreaterThan(now);
      expect(result.resetAt).toBeLessThanOrEqual(now + 300_000); // max 5 min
    });
  });
});
