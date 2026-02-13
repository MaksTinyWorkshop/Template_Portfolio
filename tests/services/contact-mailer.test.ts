import { beforeEach, describe, expect, it, vi } from "vitest";

const baseEnv = () => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";
  delete process.env.CONTACT_WEBHOOK_URL;
  delete process.env.CONTACT_EMAIL_RECIPIENT;
  delete process.env.CONTACT_EMAIL_SENDER;
};

describe("contact mailer - sendContactNotification", () => {
  beforeEach(() => {
    vi.resetModules();
    baseEnv();
  });

  it("ne declenche pas de webhook si CONTACT_WEBHOOK_URL est absent", async () => {
    const fetchSpy = vi.fn();
    // @ts-expect-error - override for test
    globalThis.fetch = fetchSpy;

    const { sendContactNotification } = await import("@/lib/modules/person/infrastructure/mailer");
    await sendContactNotification({
      name: "Test Contact",
      email: "test@example.com",
      message: "Un message avec suffisamment de caractères.",
      subject: "Hello",
    });

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("utilise le sujet par defaut si subject est absent", async () => {
    const fetchSpy = vi.fn();
    // @ts-expect-error - override for test
    globalThis.fetch = fetchSpy;
    const debugSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    const { sendContactNotification } = await import("@/lib/modules/person/infrastructure/mailer");
    await sendContactNotification({
      name: "Test Contact",
      email: "test@example.com",
      message: "Un message avec suffisamment de caractères.",
    } as any);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(debugSpy).toHaveBeenCalledWith(expect.stringContaining("Sujet : non renseigné"));
  });

  it("poste un webhook quand CONTACT_WEBHOOK_URL est defini", async () => {
    process.env.CONTACT_WEBHOOK_URL = "https://example.com/webhook";
    process.env.CONTACT_EMAIL_RECIPIENT = "dest@example.com";
    process.env.CONTACT_EMAIL_SENDER = "no-reply@example.com";

    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    // @ts-expect-error - override for test
    globalThis.fetch = fetchSpy;

    const { sendContactNotification } = await import("@/lib/modules/person/infrastructure/mailer");
    await sendContactNotification({
      name: "Test Contact",
      email: "test@example.com",
      message: "Un message avec suffisamment de caractères.",
      subject: "Hello",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://example.com/webhook");
    expect(options).toMatchObject({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const body = JSON.parse((options as { body: string }).body);
    expect(body).toMatchObject({
      recipient: "dest@example.com",
      sender: "no-reply@example.com",
      name: "Test Contact",
      email: "test@example.com",
      subject: "Hello",
    });
  });
});
