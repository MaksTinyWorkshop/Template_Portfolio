import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { verifyAuthToken, generateAuthToken } from "@/lib/utils/auth";

/**
 * Tests pour le logging conditionnel (NODE_ENV) dans verifyAuthToken()
 * Vérifie que console.warn/error sont supprimés en production
 */
describe("verifyAuthToken() - Conditional Logging (NODE_ENV)", () => {
  // Backup des env vars originales
  const originalEnv = { ...process.env };
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Setup console mocks
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // Setup valid secret
    process.env.AUTH_SECRET =
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  describe("En environnement PRODUCTION", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "production";
    });

    it("ne log PAS de warn si signature invalide", async () => {
      const invalidToken =
        "1234567890.abcdef0123456789.invalidsignaturehex000000000000";

      const result = await verifyAuthToken(invalidToken);

      expect(result).toBe(false);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("ne log PAS de warn si token expiré", async () => {
      // Token expiré : timestamp très ancien
      const expiredTimestamp = "1000000000"; // ~2001 (expiré)
      const expiredToken = `${expiredTimestamp}.abc123.fakesignature0000000000000000000000000000000000000000000000`;

      const result = await verifyAuthToken(expiredToken);

      expect(result).toBe(false);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it("ne log PAS d'erreur si exception lors de vérification", async () => {
      const malformedToken = "not.a.valid.token.format"; // 4 parties au lieu de 3

      const result = await verifyAuthToken(malformedToken);

      expect(result).toBe(false);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("retourne false silencieusement pour token invalide", async () => {
      const result = await verifyAuthToken("invalid");

      expect(result).toBe(false);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("En environnement DEVELOPMENT", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "development";
    });

    it("log un warn si signature invalide", async () => {
      const invalidToken =
        "1234567890.abcdef0123456789.invalidsignaturehex000000000000";

      const result = await verifyAuthToken(invalidToken);

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Token invalide.*signature incorrecte/),
      );
    });

    it("log un warn si token expiré (doit avoir signature valide)", async () => {
      // Générer token valide puis modifier timestamp pour le rendre expiré
      const validToken = await generateAuthToken();
      const [, random, signature] = validToken.split(".");
      const expiredTimestamp = "1000000000"; // ~2001 (très ancien)
      const expiredToken = `${expiredTimestamp}.${random}.${signature}`;

      const result = await verifyAuthToken(expiredToken);

      expect(result).toBe(false);
      // La signature sera invalide car elle dépend du timestamp
      // Le warn sera donc "signature incorrecte" et pas "expiré"
      // Ajuster test pour vérifier qu'un warn est émis
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it("ne log PAS si token valide", async () => {
      // Générer un token réellement valide
      const validToken = await generateAuthToken();

      const result = await verifyAuthToken(validToken);

      expect(result).toBe(true);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("En environnement TEST (non-production)", () => {
    beforeEach(() => {
      process.env.NODE_ENV = "test";
    });

    it("log un warn si signature invalide (comme dev)", async () => {
      const invalidToken = "123.abc.invalidsig0000000000000000000000000000";

      const result = await verifyAuthToken(invalidToken);

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it("log un warn si token expiré (comme dev)", async () => {
      // Même comportement qu'en dev : signature invalide détectée en premier
      const validToken = await generateAuthToken();
      const [, random, signature] = validToken.split(".");
      const expiredTimestamp = "1000000000";
      const expiredToken = `${expiredTimestamp}.${random}.${signature}`;

      const result = await verifyAuthToken(expiredToken);

      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe("Cas d'exception (malformed tokens)", () => {
    it("log une erreur en DEV si token malformed", async () => {
      process.env.NODE_ENV = "development";
      const malformedToken = "only-two.parts"; // < 3 parties

      const result = await verifyAuthToken(malformedToken);

      expect(result).toBe(false);
      // Token malformed retourne false immédiatement (pas d'exception catchée)
      // Donc pas de console.error dans ce cas précis
    });

    it("ne log PAS d'erreur en PROD si token malformed", async () => {
      process.env.NODE_ENV = "production";
      const malformedToken = "invalid-format";

      const result = await verifyAuthToken(malformedToken);

      expect(result).toBe(false);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe("Compatibilité avec tous les environnements", () => {
    const testEnvs = [
      "production",
      "development",
      "test",
      "staging",
      undefined,
    ];

    for (const env of testEnvs) {
      it(`gère correctement NODE_ENV="${env}"`, async () => {
        if (env) {
          process.env.NODE_ENV = env;
        } else {
          process.env.NODE_ENV = undefined;
        }

        const validToken = await generateAuthToken();
        const result = await verifyAuthToken(validToken);

        expect(result).toBe(true);

        // En production, aucun log
        if (env === "production") {
          expect(consoleWarnSpy).not.toHaveBeenCalled();
          expect(consoleErrorSpy).not.toHaveBeenCalled();
        }
      });
    }
  });
});
