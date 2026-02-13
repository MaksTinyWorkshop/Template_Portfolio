import { describe, expect, it, vi } from "vitest";
import {
  ensureMediaRecord,
  ensureTagForCategory,
  normalizeSlugInput,
  normalizeStringList,
} from "@/lib/utils/content-normalizers";

describe("content normalizers", () => {
  it("returns empty slug when both inputs are missing", () => {
    expect(normalizeSlugInput(undefined, undefined)).toBe("");
  });

  it("trims and slugifies inputs consistently", () => {
    const slug = normalizeSlugInput(" custom-slug ", "fallback");
    expect(slug).toBe("custom-slug");
  });

  it("falls back to the title when slug is blank", () => {
    const slug = normalizeSlugInput("   ", "Hello World");
    expect(slug).toBe("hello-world");
  });

  it("dedupes whitespace and removes empties", () => {
    const raw = ["  foo ", null, "bar", "", "foo"];
    expect(normalizeStringList(raw)).toEqual(["foo", "bar"]);
  });

  it("throws ValidationError when tag name is empty", async () => {
    const tx = { tag: { upsert: vi.fn() } };
    await expect(ensureTagForCategory(tx as any, "   ", "project")).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("upserts a tag via prisma tx", async () => {
    const created = { id: "tag-1" };
    const tx = {
      tag: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(created),
      },
    };

    const tag = await ensureTagForCategory(tx as any, "My Tag", "project");
    expect(tag).toBe(created);
    expect(tx.tag.findFirst).toHaveBeenCalled();
    expect(tx.tag.create).toHaveBeenCalledWith({
      data: { slug: "my-tag", name: "My Tag", category: "project" },
    });
  });

  it("returns existing tag when findFirst matches (case-insensitive)", async () => {
    const existing = { id: "tag-existing" };
    const tx = {
      tag: {
        findFirst: vi.fn().mockResolvedValue(existing),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };

    const tag = await ensureTagForCategory(tx as any, " My Tag ", "project");
    expect(tag).toBe(existing);
    expect(tx.tag.create).not.toHaveBeenCalled();
  });

  it("queries eligible categories for article/global/project", async () => {
    const tx = {
      tag: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "tag-1" }),
      },
    };

    await ensureTagForCategory(tx as any, "My Tag", "article");
    expect(tx.tag.findFirst).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { in: ["article", "global"] },
        }),
      }),
    );

    await ensureTagForCategory(tx as any, "My Tag", "project");
    expect(tx.tag.findFirst).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { in: ["project", "global"] },
        }),
      }),
    );

    await ensureTagForCategory(tx as any, "My Tag", "global");
    expect(tx.tag.findFirst).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { in: ["global"] },
        }),
      }),
    );
  });

  it("handles slug collisions by suffixing the slug", async () => {
    const created = { id: "tag-2" };
    const tx = {
      tag: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn().mockResolvedValueOnce({ id: "collision" }).mockResolvedValueOnce(null),
        create: vi.fn().mockResolvedValue(created),
      },
    };

    const tag = await ensureTagForCategory(tx as any, "My Tag", "project");
    expect(tag).toBe(created);
    expect(tx.tag.create).toHaveBeenCalledWith({
      data: { slug: "my-tag-2", name: "My Tag", category: "project" },
    });
  });

  it("rejects when slugify returns empty", async () => {
    const tx = {
      tag: {
        findFirst: vi.fn().mockResolvedValue(null),
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    await expect(ensureTagForCategory(tx as any, "!!!", "project")).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  it("normalizes /images and /api/assets urls consistently", async () => {
    const tx = {
      media: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "m-1" }),
      },
    };

    // /images -> /api/assets
    await ensureMediaRecord(tx as any, "/images");
    expect(tx.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ url: "/api/assets" }),
      }),
    );

    // /api/assets path stays unchanged
    tx.media.findFirst.mockResolvedValueOnce(null);
    tx.media.create.mockResolvedValueOnce({ id: "m-2" });
    await ensureMediaRecord(tx as any, "/api/assets/foo.png");
    expect(tx.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ url: "/api/assets/foo.png" }),
      }),
    );
  });

  it("keeps unrelated absolute urls unchanged", async () => {
    const tx = {
      media: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: "m-3" }),
      },
    };

    await ensureMediaRecord(tx as any, " https://cdn.example.com/x.png ");
    expect(tx.media.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ url: "https://cdn.example.com/x.png" }),
      }),
    );
  });

  it("returns existing media when found", async () => {
    const existing = { id: "media-foo" };
    const tx = {
      media: {
        findFirst: vi.fn().mockResolvedValue(existing),
        create: vi.fn(),
      },
    };
    const media = await ensureMediaRecord(tx as any, "  /images/foo.png  ");
    expect(media).toBe(existing);
    expect(tx.media.create).not.toHaveBeenCalled();
  });

  it("returns null when media url is empty", async () => {
    const tx = { media: { findFirst: vi.fn(), create: vi.fn() } };
    expect(await ensureMediaRecord(tx as any, null)).toBeNull();
    expect(await ensureMediaRecord(tx as any, "   ")).toBeNull();
    expect(tx.media.findFirst).not.toHaveBeenCalled();
    expect(tx.media.create).not.toHaveBeenCalled();
  });

  it("creates media when absent", async () => {
    const created = { id: "m-1" };
    const tx = {
      media: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(created),
      },
    };

    const media = await ensureMediaRecord(tx as any, "/images/bar.png");
    expect(media).toBe(created);
    expect(tx.media.create).toHaveBeenCalledWith({
      data: {
        url: "/api/assets/bar.png",
        kind: "image",
        storageProvider: "local",
        uploadedById: null,
      },
    });
  });
});
