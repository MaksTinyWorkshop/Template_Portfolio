import { describe, it, expect } from "vitest";
import { contactSchema } from "@/lib/schemas/contact.schema";

/**
 * Tests pour la sanitization HTML du schéma contact
 * Vérifie la protection contre XSS (defense-in-depth)
 */
describe("contactSchema - HTML Sanitization", () => {
  describe("sanitizeHTML() sur le champ name", () => {
    it("supprime les balises script (garde le contenu interne)", () => {
      const input = {
        name: "John<script>alert('XSS')</script>Doe",
        email: "john@example.com",
        message: "Message valide de test",
      };

      const result = contactSchema.parse(input);

      // sanitizeHTML() enlève les balises mais garde le texte interne
      expect(result.name).toBe("Johnalert('XSS')Doe");
      expect(result.name).not.toContain("<script>");
      expect(result.name).not.toContain("</script>");
    });

    it("supprime les attributs d'événements (onclick, onerror)", () => {
      const input = {
        name: 'John onclick="alert(1)" Doe',
        email: "john@example.com",
        message: "Message valide",
      };

      const result = contactSchema.parse(input);

      // Regex enlève "onclick=" mais garde la valeur quoted
      expect(result.name).toBe('John "alert(1)" Doe');
      expect(result.name).not.toContain("onclick=");
    });

    it("supprime les protocoles javascript:", () => {
      const input = {
        name: "John javascript:alert(1) Doe",
        email: "john@example.com",
        message: "Message valide",
      };

      const result = contactSchema.parse(input);

      expect(result.name).toBe("John alert(1) Doe");
      expect(result.name).not.toContain("javascript:");
    });

    it("supprime toutes les balises HTML", () => {
      const input = {
        name: "<b>John</b> <i>Doe</i>",
        email: "john@example.com",
        message: "Message valide",
      };

      const result = contactSchema.parse(input);

      expect(result.name).toBe("John Doe");
      expect(result.name).not.toContain("<b>");
      expect(result.name).not.toContain("</i>");
    });
  });

  describe("sanitizeHTML() sur le champ subject (optional)", () => {
    it("supprime les balises HTML du subject", () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Test <img src=x>Suite",
        message: "Message valide de test",
      };

      const result = contactSchema.parse(input);

      expect(result.subject).toBe("Test Suite");
      expect(result.subject).not.toContain("<img");
      expect(result.subject).not.toContain("src=");
    });

    it("gère le subject undefined (optional)", () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        message: "Message valide",
      };

      const result = contactSchema.parse(input);

      expect(result.subject).toBeUndefined();
    });
  });

  describe("sanitizeHTML() sur le champ message", () => {
    it("supprime les balises script du message", () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        message:
          "Bonjour, voici mon message <script>fetch('evil.com')</script> important",
      };

      const result = contactSchema.parse(input);

      expect(result.message).toBe("Bonjour, voici mon message fetch('evil.com') important");
      expect(result.message).not.toContain("<script>");
      expect(result.message).not.toContain("</script>");
    });

    it("supprime les balises iframe et embed", () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        message: 'Message <iframe src="evil"></iframe> avec contenu',
      };

      const result = contactSchema.parse(input);

      expect(result.message).toBe("Message  avec contenu");
      expect(result.message).not.toContain("<iframe");
      expect(result.message).not.toContain("</iframe>");
    });

    it("supprime les attributs onload, onerror, onmouseover", () => {
      const input = {
        name: "John Doe",
        email: "john@example.com",
        message: 'Test onload="alert(1)" onerror="alert(2)" message',
      };

      const result = contactSchema.parse(input);

      // Regex enlève "onload=" et "onerror=" mais garde les valeurs quoted
      expect(result.message).toBe('Test "alert(1)" "alert(2)" message');
      expect(result.message).not.toContain("onload=");
      expect(result.message).not.toContain("onerror=");
    });
  });

  describe("Combinaisons XSS complexes", () => {
    it("gère plusieurs vecteurs XSS simultanés (supprime balises)", () => {
      const input = {
        name: '<script></script><img src=x>John',
        email: "john@example.com",
        subject: "javascript:void(0) Test",
        message:
          '<iframe src="evil"></iframe>Message<script></script>',
      };

      const result = contactSchema.parse(input);

      expect(result.name).toBe("John");
      expect(result.subject).toBe("void(0) Test"); // javascript: supprimé
      expect(result.message).toBe("Message");

      // Vérifier balises HTML supprimées
      expect(result.name).not.toContain("<");
      expect(result.name).not.toContain(">");
      expect(result.subject).not.toContain("javascript:");
      expect(result.message).not.toContain("<iframe");
      expect(result.message).not.toContain("<script>");
    });
  });

  describe("Cas légitimes (pas de faux positifs)", () => {
    it("préserve le texte normal sans HTML", () => {
      const input = {
        name: "Jean-Marie O'Connor",
        email: "jean@example.com",
        subject: "Question sur le projet X",
        message:
          "Bonjour, j'aimerais discuter de votre offre. Merci d'avance !",
      };

      const result = contactSchema.parse(input);

      expect(result.name).toBe("Jean-Marie O'Connor");
      expect(result.subject).toBe("Question sur le projet X");
      expect(result.message).toBe(
        "Bonjour, j'aimerais discuter de votre offre. Merci d'avance !",
      );
    });

    it("préserve les caractères spéciaux légitimes", () => {
      const input = {
        name: "Müller & Söhne",
        email: "mueller@example.com",
        message: "Prix : 100€ - Réduction 20% (18+2 gratuit)",
      };

      const result = contactSchema.parse(input);

      expect(result.name).toBe("Müller & Söhne");
      expect(result.message).toBe("Prix : 100€ - Réduction 20% (18+2 gratuit)");
    });
  });
});
