import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { generateAuthToken } from "@/lib/utils/auth";
import { MIN_SECRET_LENGTH } from "@/lib/utils/auth-constants";

/**
 * Tests pour la validation des secrets dans generateAuthToken()
 * Vérifie le comportement fail-fast en production vs warn en dev
 */
describe("generateAuthToken() - Secret Validation", () => {
  // Backup des env vars originales
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset console mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original env
    process.env = { ...originalEnv };
  });

  describe("Secret manquant (AUTH_SECRET et ADMIN_PASSWORD undefined)", () => {
    it("throw une erreur si aucun secret n'est défini", async () => {
      delete process.env.AUTH_SECRET;
      delete process.env.ADMIN_PASSWORD;

      await expect(generateAuthToken()).rejects.toThrow(
        /SÉCURITÉ CRITIQUE.*AUTH_SECRET.*ADMIN_PASSWORD/,
      );
    });
  });

  describe("Secret trop court (< MIN_SECRET_LENGTH)", () => {
    describe("En environnement PRODUCTION", () => {
      beforeEach(() => {
        process.env.NODE_ENV = "production";
      });

      it("throw une erreur si secret < MIN_SECRET_LENGTH chars", async () => {
        const shortSecret = "a".repeat(MIN_SECRET_LENGTH - 1); // 31 chars (< 32)
        process.env.AUTH_SECRET = shortSecret;

        await expect(generateAuthToken()).rejects.toThrow(
          /SÉCURITÉ CRITIQUE.*Le secret a seulement/,
        );
        await expect(generateAuthToken()).rejects.toThrow(
          new RegExp(`${MIN_SECRET_LENGTH - 1} caractères`),
        );
      });

      it("throw avec message précisant minimum requis", async () => {
        process.env.AUTH_SECRET = "tooshort";

        await expect(generateAuthToken()).rejects.toThrow(
          new RegExp(`Minimum requis: ${MIN_SECRET_LENGTH * 2} caractères`),
        );
      });

      it("throw avec suggestion openssl", async () => {
        process.env.AUTH_SECRET = "weak";

        await expect(generateAuthToken()).rejects.toThrow(/openssl rand -hex 32/);
      });
    });

    describe("En environnement DEVELOPMENT", () => {
      beforeEach(() => {
        process.env.NODE_ENV = "development";
        vi.spyOn(console, "warn").mockImplementation(() => {});
      });

      it("émet un console.warn si secret < MIN_SECRET_LENGTH chars", async () => {
        const shortSecret = "dev_secret_12345"; // < 32 chars
        process.env.AUTH_SECRET = shortSecret;

        const token = await generateAuthToken();

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringMatching(/SÉCURITÉ.*Le secret a seulement/),
        );
        expect(token).toBeDefined();
        expect(typeof token).toBe("string");
      });

      it("génère quand même un token valide (flexibilité dev)", async () => {
        process.env.AUTH_SECRET = "short";

        const token = await generateAuthToken();

        expect(token).toBeDefined();
        expect(token.split(".")).toHaveLength(3); // Format: timestamp.random.signature
      });

      it("warn contient la longueur actuelle du secret", async () => {
        const shortSecret = "12345"; // 5 chars
        process.env.AUTH_SECRET = shortSecret;

        await generateAuthToken();

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining(`${shortSecret.length} caractères`),
        );
      });
    });

    describe("En environnement TEST (non-production)", () => {
      beforeEach(() => {
        process.env.NODE_ENV = "test";
        vi.spyOn(console, "warn").mockImplementation(() => {});
      });

      it("émet un warn (comme dev)", async () => {
        process.env.AUTH_SECRET = "test_secret";

        const token = await generateAuthToken();

        expect(console.warn).toHaveBeenCalled();
        expect(token).toBeDefined();
      });
    });
  });

  describe("Secret valide (>= MIN_SECRET_LENGTH)", () => {
    it("génère un token sans erreur si secret >= MIN_SECRET_LENGTH", async () => {
      const validSecret = "a".repeat(MIN_SECRET_LENGTH); // Exactement 32 chars
      process.env.AUTH_SECRET = validSecret;

      const token = await generateAuthToken();

      expect(token).toBeDefined();
      expect(token.split(".")).toHaveLength(3);
    });

    it("génère un token sans warn en production avec secret valide", async () => {
      process.env.NODE_ENV = "production";
      process.env.AUTH_SECRET = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // 64 chars
      vi.spyOn(console, "warn").mockImplementation(() => {});

      const token = await generateAuthToken();

      expect(console.warn).not.toHaveBeenCalled();
      expect(token).toBeDefined();
    });

    it("accepte AUTH_SECRET prioritairement à ADMIN_PASSWORD", async () => {
      process.env.AUTH_SECRET = "a".repeat(MIN_SECRET_LENGTH);
      process.env.ADMIN_PASSWORD = "short"; // < MIN_SECRET_LENGTH

      const token = await generateAuthToken();

      expect(token).toBeDefined();
      // Aucun warn car AUTH_SECRET est valide (prioritaire)
    });
  });

  describe("Fallback ADMIN_PASSWORD", () => {
    it("utilise ADMIN_PASSWORD si AUTH_SECRET absent", async () => {
      delete process.env.AUTH_SECRET;
      process.env.ADMIN_PASSWORD = "a".repeat(MIN_SECRET_LENGTH);

      const token = await generateAuthToken();

      expect(token).toBeDefined();
      expect(token.split(".")).toHaveLength(3);
    });

    it("throw en production si ADMIN_PASSWORD < MIN_SECRET_LENGTH", async () => {
      process.env.NODE_ENV = "production";
      delete process.env.AUTH_SECRET;
      process.env.ADMIN_PASSWORD = "weak";

      await expect(generateAuthToken()).rejects.toThrow(/SÉCURITÉ CRITIQUE/);
    });
  });
});
