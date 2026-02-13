import { describe, expect, it } from "vitest";

import { createPersonSchema, updatePersonSchema } from "@/lib/schemas/person.schema";

describe("person schemas", () => {
  it("normalise les champs optionnels vides en undefined", () => {
    const parsed = createPersonSchema.parse({
      firstName: " Max ",
      lastName: " Mustermann ",
      pseudo: "   ",
      role: "",
      bio: "   ",
      avatar: "",
    });

    expect(parsed.firstName).toBe("Max");
    expect(parsed.lastName).toBe("Mustermann");
    expect(parsed.pseudo).toBeUndefined();
    expect(parsed.role).toBeUndefined();
    expect(parsed.bio).toBeUndefined();
    expect(parsed.email).toBeUndefined();
    expect(parsed.avatar).toBeUndefined();
  });

  it("conserve les champs optionnels renseignés après trim", () => {
    const parsed = createPersonSchema.parse({
      firstName: " Max ",
      lastName: " Mustermann ",
      pseudo: " m4x ",
      role: " Dev ",
      bio: " Bio courte ",
      email: "  max@example.com ",
      avatar: " https://cdn.example/avatar.png ",
    });

    expect(parsed.pseudo).toBe("m4x");
    expect(parsed.role).toBe("Dev");
    expect(parsed.bio).toBe("Bio courte");
    expect(parsed.email).toBe("max@example.com");
    expect(parsed.avatar).toBe("https://cdn.example/avatar.png");
  });

  it("updatePersonSchema accepte un payload partiel", () => {
    const parsed = updatePersonSchema.parse({
      role: " Lead Dev ",
    });

    expect(parsed.role).toBe("Lead Dev");
    expect(parsed.firstName).toBeUndefined();
  });
});
