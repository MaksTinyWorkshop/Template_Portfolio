import { describe, expect, it, vi } from "vitest";
import {
  ensureMediaRecord,
  ensureTagForCategory,
  normalizeSlugInput,
  normalizeStringList,
} from "@/lib/utils/content-normalizers";

describe("content normalizers", () => {
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
        upsert: vi.fn().mockResolvedValue(created),
      },
    };

    const tag = await ensureTagForCategory(tx as any, "My Tag", "project");
    expect(tag).toBe(created);
    expect(tx.tag.upsert).toHaveBeenCalledWith({
      where: { slug: "my-tag" },
      create: { slug: "my-tag", name: "My Tag", category: "project" },
      update: { name: "My Tag" },
    });
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
        url: "/images/bar.png",
        kind: "image",
        storagePath: "/images/bar.png",
        storageProvider: "local",
        uploadedById: null,
      },
    });
  });
});
