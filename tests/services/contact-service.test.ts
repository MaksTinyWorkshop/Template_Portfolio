import { describe, expect, it, vi, beforeEach } from "vitest";

describe("contact service - handleContactRequest", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("rejette les payloads invalides avec ValidationError", async () => {
    const { handleContactRequest } = await import(
      "@/lib/modules/person/application/contact.service"
    );
    const { ValidationError } = await import("@/lib/http/errors");

    await expect(handleContactRequest({ email: "missing@fields.com" })).rejects.toBeInstanceOf(
      ValidationError,
    );
  });

  it("valide le payload et appelle le mailer", async () => {
    const sendContactNotification = vi.fn().mockResolvedValue(undefined);
    vi.doMock("@/lib/modules/person/infrastructure/mailer", () => ({
      sendContactNotification,
    }));

    const { handleContactRequest } = await import(
      "@/lib/modules/person/application/contact.service"
    );
    const payload = {
      name: "Test Contact",
      email: "test@example.com",
      message: "Un message avec suffisamment de caractères.",
      subject: "Hello",
    };

    const result = await handleContactRequest(payload);
    expect(result).toMatchObject(payload);
    expect(sendContactNotification).toHaveBeenCalledWith(result);
  });
});
