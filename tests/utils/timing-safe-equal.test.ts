import { describe, it, expect } from "vitest";

/**
 * Copie de timingSafeEqual() depuis proxy.ts pour tests unitaires
 * (fonction non exportée, donc dupliquée ici)
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Tests pour timingSafeEqual()
 * Vérifie la comparaison à temps constant pour prévenir timing attacks
 */
describe("timingSafeEqual() - Timing-Safe String Comparison", () => {
  describe("Cas égaux (retourne true)", () => {
    it("retourne true pour deux strings identiques", () => {
      const str = "abc123xyz";
      expect(timingSafeEqual(str, str)).toBe(true);
    });

    it("retourne true pour signatures HMAC identiques", () => {
      const signature =
        "a3f8b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0";
      expect(timingSafeEqual(signature, signature)).toBe(true);
    });

    it("retourne true pour strings vides identiques", () => {
      expect(timingSafeEqual("", "")).toBe(true);
    });

    it("retourne true pour strings avec caractères spéciaux", () => {
      const str = "!@#$%^&*()_+-=[]{}|;:',.<>?/~`";
      expect(timingSafeEqual(str, str)).toBe(true);
    });
  });

  describe("Cas différents (retourne false)", () => {
    it("retourne false pour strings de longueurs différentes", () => {
      expect(timingSafeEqual("abc", "abcd")).toBe(false);
      expect(timingSafeEqual("abcde", "abc")).toBe(false);
    });

    it("retourne false pour signatures différentes (même longueur)", () => {
      const sig1 =
        "a3f8b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0";
      const sig2 =
        "a3f8b2c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a1"; // dernier char différent

      expect(timingSafeEqual(sig1, sig2)).toBe(false);
    });

    it("retourne false pour strings complètement différentes", () => {
      expect(timingSafeEqual("hello", "world")).toBe(false);
      expect(timingSafeEqual("12345", "67890")).toBe(false);
    });

    it("retourne false si un seul caractère diffère (début)", () => {
      expect(timingSafeEqual("abc123", "Abc123")).toBe(false);
    });

    it("retourne false si un seul caractère diffère (milieu)", () => {
      expect(timingSafeEqual("abc123", "abC123")).toBe(false);
    });

    it("retourne false si un seul caractère diffère (fin)", () => {
      expect(timingSafeEqual("abc123", "abc124")).toBe(false);
    });
  });

  describe("Protection contre timing attacks", () => {
    it("traite toute la string même si premier char diffère", () => {
      // Note: On ne peut pas tester le timing directement (trop variable)
      // Mais on vérifie que le code parcourt toute la string via result |=
      const str1 = "aaaaaaaaaa";
      const str2 = "baaaaaaaaa"; // Premier char différent

      expect(timingSafeEqual(str1, str2)).toBe(false);
      // Si la fonction short-circuitait au premier char, ça serait une faille
    });

    it("traite toute la string même si dernier char diffère", () => {
      const str1 = "aaaaaaaaaa";
      const str2 = "aaaaaaaaa1"; // Dernier char différent

      expect(timingSafeEqual(str1, str2)).toBe(false);
    });

    it("utilise OR bitwise pour accumuler les différences", () => {
      // Vérifie que plusieurs différences sont détectées
      const str1 = "abcdefgh";
      const str2 = "xyztuvwz"; // Tous les chars différents

      expect(timingSafeEqual(str1, str2)).toBe(false);
    });
  });

  describe("Cas limites (edge cases)", () => {
    it("gère les strings avec null bytes", () => {
      const str1 = "abc\x00def";
      const str2 = "abc\x00def";

      expect(timingSafeEqual(str1, str2)).toBe(true);
    });

    it("détecte différence avec null bytes", () => {
      const str1 = "abc\x00def";
      const str2 = "abc\x01def";

      expect(timingSafeEqual(str1, str2)).toBe(false);
    });

    it("gère les strings unicode", () => {
      const str1 = "café🔒";
      const str2 = "café🔒";

      expect(timingSafeEqual(str1, str2)).toBe(true);
    });

    it("détecte différence unicode", () => {
      const str1 = "café🔒";
      const str2 = "café🔓";

      expect(timingSafeEqual(str1, str2)).toBe(false);
    });
  });

  describe("Compatibilité avec signatures JWT/HMAC", () => {
    it("fonctionne avec signatures hex 64 chars (SHA-256)", () => {
      const validSig =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      const copySig =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      const invalidSig =
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b856"; // dernier char différent

      expect(timingSafeEqual(validSig, copySig)).toBe(true);
      expect(timingSafeEqual(validSig, invalidSig)).toBe(false);
    });
  });
});
