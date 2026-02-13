import { describe, expect, it } from "vitest";
import { teamMemberInputSchema } from "@/lib/schemas/project.schema";

describe("project schema - optionalUrlAllowEmpty", () => {
  const baseMember = () => ({
    name: "Alice",
    role: "Dev",
  });

  it("accepte linkedIn vide (chaine vide)", () => {
    const parsed = teamMemberInputSchema.parse({
      ...baseMember(),
      linkedIn: "",
    });
    expect(parsed.linkedIn).toBe("");
  });

  it("accepte linkedIn valide", () => {
    const parsed = teamMemberInputSchema.parse({
      ...baseMember(),
      linkedIn: "https://www.linkedin.com/in/alice",
    });
    expect(parsed.linkedIn).toBe("https://www.linkedin.com/in/alice");
  });

  it("rejette linkedIn invalide", () => {
    expect(() =>
      teamMemberInputSchema.parse({
        ...baseMember(),
        linkedIn: "not-a-url",
      }),
    ).toThrow(/URL LinkedIn invalide/);
  });

  it("accepte un social url vide et un social url valide", () => {
    const parsed = teamMemberInputSchema.parse({
      ...baseMember(),
      socials: [
        { name: "github", url: "" },
        { name: "x", url: "https://example.com" },
      ],
    });
    expect(parsed.socials?.[0]?.url).toBe("");
    expect(parsed.socials?.[1]?.url).toBe("https://example.com");
  });

  it("rejette un social url invalide", () => {
    expect(() =>
      teamMemberInputSchema.parse({
        ...baseMember(),
        socials: [{ name: "github", url: "not-a-url" }],
      }),
    ).toThrow(/URL invalide/);
  });
});
