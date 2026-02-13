import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const metadata = {
  title: "Titre",
  summary: "Résumé",
  publishedAt: "2025-01-01T00:00:00Z",
  status: "draft",
  tags: ["Tech"],
  image: "/img/hero.png",
};

const buildJsonRequest = (method: string, body: Record<string, unknown>) =>
  new NextRequest("http://localhost/api/admin/posts", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const buildDeleteRequest = (slug?: string) =>
  new NextRequest(
    `http://localhost/api/admin/posts${slug ? `?slug=${encodeURIComponent(slug)}` : ""}`,
    { method: "DELETE" },
  );

describe("API admin/posts route", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.mock("@/lib/utils/auth", () => ({
      checkAuthAPI: vi.fn(),
    }));
    vi.mock("@/lib/modules/articles", () => ({
      createArticleAdmin: vi.fn(),
      updateArticleAdmin: vi.fn(),
      deleteArticleAdmin: vi.fn(),
      listArticlesAdmin: vi.fn(),
    }));
    vi.mock("next/cache", () => ({
      revalidatePath: vi.fn(),
    }));
  });

  it("refuse POST sans authentification", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { POST } = await import("@/app/(api)/api/admin/posts/route");
    const response = await POST(buildJsonRequest("POST", { metadata, content: "foo" }));
    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({ success: false, error: "Non authentifié" });
  });

  it("refuse GET sans authentification", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { GET } = await import("@/app/(api)/api/admin/posts/route");
    const response = await GET({} as NextRequest);
    expect(response.status).toBe(401);
  });

  it("retourne la liste quand authentifié", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const articles = await import("@/lib/modules/articles");
    (articles.listArticlesAdmin as ReturnType<typeof vi.fn>).mockResolvedValue([{ slug: "foo" }]);

    const { GET } = await import("@/app/(api)/api/admin/posts/route");
    const response = await GET({} as NextRequest);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: true, data: [{ slug: "foo" }] });
  });

  it("retourne 500 si la liste des articles echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const articles = await import("@/lib/modules/articles");
    (articles.listArticlesAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("db down"),
    );

    const { GET } = await import("@/app/(api)/api/admin/posts/route");
    const response = await GET({} as NextRequest);
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: false, error: "db down" });
  });

  it("crée un article et revalide les chemins", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const articles = await import("@/lib/modules/articles");
    (articles.createArticleAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ slug: "super" });

    const { POST } = await import("@/app/(api)/api/admin/posts/route");
    const response = await POST(
      buildJsonRequest("POST", {
        metadata,
        content: "Contenu complet",
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: true, data: { slug: "super" } });

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/super");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("retourne 500 si la creation echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const articles = await import("@/lib/modules/articles");
    (articles.createArticleAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));

    const { POST } = await import("@/app/(api)/api/admin/posts/route");
    const response = await POST(
      buildJsonRequest("POST", {
        metadata,
        content: "Contenu complet",
      }),
    );

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: false, error: "boom" });
  });

  it("refuse PUT sans authentification", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { PUT } = await import("@/app/(api)/api/admin/posts/route");
    const response = await PUT(
      buildJsonRequest("PUT", {
        slug: "super",
        metadata,
        content: "Toe",
      }),
    );
    expect(response.status).toBe(401);
  });

  it("met à jour un article via PUT", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const articles = await import("@/lib/modules/articles");
    (articles.updateArticleAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({ slug: "super" });

    const { PUT } = await import("@/app/(api)/api/admin/posts/route");
    const response = await PUT(
      buildJsonRequest("PUT", {
        slug: "super",
        metadata,
        content: "Toe",
      }),
    );

    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: true, data: { slug: "super" } });
    const updated = payload.data;

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/super");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(updated.slug).toBe("super");
  });

  it("retourne 500 si la mise a jour echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const articles = await import("@/lib/modules/articles");
    (articles.updateArticleAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));

    const { PUT } = await import("@/app/(api)/api/admin/posts/route");
    const response = await PUT(
      buildJsonRequest("PUT", {
        slug: "super",
        metadata,
        content: "Toe",
      }),
    );

    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: false, error: "boom" });
  });

  it("revalide l'ancien slug quand le slug change", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const articles = await import("@/lib/modules/articles");
    (articles.updateArticleAdmin as ReturnType<typeof vi.fn>).mockResolvedValue({
      slug: "nouveau",
    });

    const { PUT } = await import("@/app/(api)/api/admin/posts/route");
    const response = await PUT(
      buildJsonRequest("PUT", {
        slug: "nouveau",
        oldSlug: "ancien",
        metadata,
        content: "Toe",
      }),
    );

    expect(response.status).toBe(200);

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/nouveau");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/ancien");
  });

  it("retourne une erreur 400 quand le payload est invalide", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { POST, PUT } = await import("@/app/(api)/api/admin/posts/route");
    const badPost = await POST(buildJsonRequest("POST", { title: "bypass" }));
    expect(badPost.status).toBe(400);

    const badPut = await PUT(
      buildJsonRequest("PUT", {
        slug: "",
      }),
    );
    expect(badPut.status).toBe(400);
  });

  it("refuse DELETE sans authentification", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(false);

    const { DELETE } = await import("@/app/(api)/api/admin/posts/route");
    const response = await DELETE(buildDeleteRequest("super"));
    expect(response.status).toBe(401);
  });

  it("supprime un article via DELETE et revalide les chemins", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const articles = await import("@/lib/modules/articles");
    (articles.deleteArticleAdmin as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

    const { DELETE } = await import("@/app/(api)/api/admin/posts/route");
    const response = await DELETE(buildDeleteRequest("super"));
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload).toMatchObject({ success: true, data: { slug: "super" } });

    const { revalidatePath } = await import("next/cache");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/blog/super");
    expect(revalidatePath).toHaveBeenCalledWith("/admin/blog");
    expect(revalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("retourne 400 sur DELETE quand le slug est manquant", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);

    const { DELETE } = await import("@/app/(api)/api/admin/posts/route");
    const response = await DELETE(buildDeleteRequest());
    expect(response.status).toBe(400);
  });

  it("retourne 500 si la suppression echoue", async () => {
    const auth = (await import("@/lib/utils/auth")).checkAuthAPI as ReturnType<typeof vi.fn>;
    auth.mockResolvedValue(true);
    const articles = await import("@/lib/modules/articles");
    (articles.deleteArticleAdmin as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("boom"));

    const { DELETE } = await import("@/app/(api)/api/admin/posts/route");
    const response = await DELETE(buildDeleteRequest("super"));
    expect(response.status).toBe(500);
    const payload = await response.json();
    expect(payload).toMatchObject({ success: false, error: "boom" });
  });
});
