import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const checkRateLimitMock = vi.fn();
const handleContactRequestMock = vi.fn();

vi.mock("@/lib/utils/rate-limit", () => ({
  checkRateLimit: checkRateLimitMock,
}));

vi.mock("@/lib/modules/person", () => ({
  handleContactRequest: handleContactRequestMock,
}));

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const buildRequest = (body: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const loadHandler = async () => (await import("@/app/(api)/api/contact/route")).POST;

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules();
    checkRateLimitMock.mockReset();
    handleContactRequestMock.mockReset();
  });

  it("renvoie 400 quand le payload est invalide", async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: true,
      remaining: 3,
      resetAt: Date.now() + 1000,
    });
    const request = buildRequest({ email: "missing@fields.com" });
    const postContact = await loadHandler();

    const response = await postContact(request);
    expect(response.status).toBe(400);

    const payload = await response.json();
    expect(payload.error).toBe("Données invalides");

    // Details peuvent être présents ou non selon mapErrorToStatus
    if (payload.details) {
      expect(Array.isArray(payload.details)).toBe(true);
      expect(
        (payload.details as Array<{ path: string[] }>).some((issue) => issue.path[0] === "name"),
      ).toBe(true);
    }
  });

  it("renvoie 201 quand la payload est valide", async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: true,
      remaining: 3,
      resetAt: Date.now() + 1000,
    });
    handleContactRequestMock.mockResolvedValueOnce(undefined);
    const request = buildRequest({
      name: "Test Contact",
      email: "test@example.com",
      message: "Un message avec suffisamment de caractères.",
      subject: "Hello",
    });
    const postContact = await loadHandler();

    const response = await postContact(request);
    expect(response.status).toBe(201);

    const payload = await response.json();
    expect(payload).toEqual({ status: "queued" });
  });

  it("renvoie 429 lorsqu'on atteint le rate limit", async () => {
    const resetAt = Date.now() + 90_000;
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: false,
      remaining: 0,
      resetAt,
    });
    const request = buildRequest({
      name: "Test Contact",
      email: "test@example.com",
      message: "Un message avec suffisamment de caractères.",
      subject: "Hello",
    });
    const postContact = await loadHandler();

    const response = await postContact(request);
    expect(response.status).toBe(429);
    const retryAfterHeader = response.headers.get("Retry-After");
    expect(retryAfterHeader).not.toBeNull();
    const payload = await response.json();
    expect(payload.error).toContain("Trop de messages");
  });

  it("renvoie 500 quand le traitement interne echoue", async () => {
    checkRateLimitMock.mockResolvedValueOnce({
      allowed: true,
      remaining: 3,
      resetAt: Date.now() + 1000,
    });
    handleContactRequestMock.mockRejectedValueOnce(new Error("mailer down"));
    const request = buildRequest({
      name: "Test Contact",
      email: "test@example.com",
      message: "Un message avec suffisamment de caractères.",
      subject: "Hello",
    });
    const postContact = await loadHandler();

    const response = await postContact(request);
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toEqual({ error: "mailer down" });
  });
});
