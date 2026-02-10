import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/portfolio_test";

const baseProject = () => ({
  slug: "alpha",
  title: "Alpha",
  summary: null,
  publishedAt: new Date("2025-01-01T00:00:00Z"),
  status: "published",
  gallery: [],
  persons: [],
  tags: [],
  link: null,
  repository: null,
  content: null,
});

describe("projects service - read/list", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("listProjects filtre les projets publies et renvoie des summaries", async () => {
    const repo = {
      listProjects: vi.fn().mockResolvedValue([baseProject()]),
      findProjectBySlug: vi.fn(),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { listProjects } = await import("@/lib/modules/projects/application/projects.service");
    const result = await listProjects();

    expect(repo.listProjects).toHaveBeenCalledWith({ onlyPublished: true });
    expect(result[0]).toMatchObject({ slug: "alpha", status: "published" });
  });

  it("listProjectSlugs renvoie les slugs publies", async () => {
    const repo = {
      listProjects: vi.fn().mockResolvedValue([baseProject(), { ...baseProject(), slug: "beta" }]),
      findProjectBySlug: vi.fn(),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { listProjectSlugs } = await import("@/lib/modules/projects/application/projects.service");
    const slugs = await listProjectSlugs();

    expect(repo.listProjects).toHaveBeenCalledWith({ onlyPublished: true });
    expect(slugs).toEqual(["alpha", "beta"]);
  });

  it("getProjectBySlug renvoie un summary quand il existe", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn().mockResolvedValue({
        ...baseProject(),
        // exercise hero image + gallery ordering + team mapping paths.
        gallery: [
          { purpose: "gallery", order: 2, media: { url: "https://example.com/2.png" } },
          { purpose: "cover", order: 1, media: { url: "https://example.com/cover.png" } },
          { purpose: "gallery", order: 0, media: { url: "https://example.com/1.png" } },
        ],
        persons: [
          { person: null },
          {
            role: null,
            person: {
              id: "p-1",
              fullName: "Alice",
              pseudo: "ali",
              role: "Dev",
              firstName: null,
              lastName: null,
              email: null,
              siteOwner: false,
              avatarMedia: { url: "https://example.com/a.png" },
              // No linkedin -> getProfileContacts() returns github only; extractLinkedIn() returns null.
              profileData: { contacts: { github: "https://github.com/alice" } },
            },
          },
        ],
        tags: [{ tag: { name: "Web" } }],
      }),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { getProjectBySlug } = await import("@/lib/modules/projects/application/projects.service");
    const result = await getProjectBySlug("alpha");

    expect(repo.findProjectBySlug).toHaveBeenCalledWith("alpha");
    expect(result).toMatchObject({
      slug: "alpha",
      heroImage: "https://example.com/cover.png",
      typeProjectTag: ["Web"],
    });
    expect(result.gallery).toEqual([
      "https://example.com/1.png",
      "https://example.com/cover.png",
      "https://example.com/2.png",
    ]);
    expect(result.images[0]).toBe("https://example.com/cover.png");
    expect(result.team[0].linkedIn).toBeNull();
  });

  it("getProjectBySlug ne definie pas de heroImage quand la gallerie est vide", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn().mockResolvedValue({
        ...baseProject(),
        gallery: [],
        persons: [],
        tags: [],
      }),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { getProjectBySlug } = await import("@/lib/modules/projects/application/projects.service");
    const result = await getProjectBySlug("alpha");

    expect(result.heroImage).toBeNull();
    expect(result.gallery).toEqual([]);
    expect(result.images).toEqual([]);
  });

  it("getProjectBySlug throw ProjectNotFoundError quand introuvable", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn().mockResolvedValue(null),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { getProjectBySlug } = await import("@/lib/modules/projects/application/projects.service");
    const { ProjectNotFoundError } = await import("@/lib/modules/projects/domain/project.errors");

    await expect(getProjectBySlug("missing")).rejects.toBeInstanceOf(ProjectNotFoundError);
  });

  it("listProjectsAdmin renvoie la liste admin", async () => {
    const repo = {
      listProjects: vi.fn().mockResolvedValue([
        {
          ...baseProject(),
          status: "draft",
          tags: [{ tag: { name: "Web" } }],
        },
      ]),
      findProjectBySlug: vi.fn(),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { listProjectsAdmin } = await import("@/lib/modules/projects/application/projects.service");
    const rows = await listProjectsAdmin();

    expect(repo.listProjects).toHaveBeenCalledTimes(1);
    expect(repo.listProjects.mock.calls[0]).toEqual([]);
    expect(rows[0]).toMatchObject({ slug: "alpha", status: "draft", typeProjectTag: ["Web"] });
  });

  it("getProjectForAdmin throw ProjectNotFoundError quand introuvable", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn().mockResolvedValue(null),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { getProjectForAdmin } = await import("@/lib/modules/projects/application/projects.service");
    const { ProjectNotFoundError } = await import("@/lib/modules/projects/domain/project.errors");

    await expect(getProjectForAdmin("missing")).rejects.toBeInstanceOf(ProjectNotFoundError);
  });

  it("getProjectForAdmin renvoie le detail admin", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn().mockResolvedValue({
        slug: "alpha",
        title: "Alpha",
        summary: null,
        publishedAt: new Date("2025-01-01T00:00:00Z"),
        status: "draft",
        gallery: [
          { purpose: "cover", order: 0, media: { url: "https://example.com/cover.png" } },
        ],
        persons: [
          { person: null },
          {
            role: "Dev",
            person: {
              id: "p-1",
              fullName: "Alice",
              pseudo: null,
              role: "Dev",
              firstName: null,
              lastName: null,
              email: null,
              siteOwner: true,
              avatarPath: null,
              avatarMedia: { url: "https://example.com/a.png" },
              profileData: { contacts: { github: "https://github.com/a" } },
            },
          },
        ],
        tags: [{ tag: { name: "Web" } }],
        link: null,
        repository: null,
        content: "Contenu",
      }),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { getProjectForAdmin } = await import("@/lib/modules/projects/application/projects.service");
    const detail = await getProjectForAdmin("alpha");

    expect(detail.slug).toBe("alpha");
    expect(detail.metadata).toMatchObject({
      title: "Alpha",
      status: "draft",
      typeProjectTag: ["Web"],
      featuredImage: "https://example.com/cover.png",
    });
    expect(detail.metadata.team.length).toBe(1);
  });

  it("getProjectForAdmin mappe les contacts et socials", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn().mockResolvedValue({
        slug: "alpha",
        title: "Alpha",
        summary: null,
        publishedAt: new Date("2025-01-01T00:00:00Z"),
        status: "draft",
        gallery: [],
        persons: [
          {
            role: null,
            person: {
              id: "p-1",
              fullName: "Alice",
              pseudo: "ali",
              role: "Dev",
              firstName: null,
              lastName: null,
              email: null,
              siteOwner: false,
              avatarPath: null,
              avatarMedia: null,
              profileData: {
                contacts: {
                  linkedin: " https://linkedin.com/in/alice ",
                  github: " https://github.com/alice ",
                  empty: "   ",
                  bad: 123,
                },
              },
            },
          },
        ],
        tags: [],
        link: null,
        repository: null,
        content: "Contenu",
      }),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { getProjectForAdmin } = await import("@/lib/modules/projects/application/projects.service");
    const detail = await getProjectForAdmin("alpha");

    expect(detail.metadata.team[0]).toMatchObject({
      name: "Alice",
      linkedIn: "https://linkedin.com/in/alice",
    });
    expect(detail.metadata.team[0].socials).toEqual([
      { name: "github", url: "https://github.com/alice" },
    ]);
  });

  it("getProjectForAdmin utilise extractLinkedIn si linkedin est vide apres sanitization", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn().mockResolvedValue({
        slug: "alpha",
        title: "Alpha",
        summary: null,
        publishedAt: new Date("2025-01-01T00:00:00Z"),
        status: "draft",
        gallery: [],
        persons: [
          {
            role: null,
            person: {
              id: "p-1",
              fullName: "Alice",
              pseudo: null,
              role: "Dev",
              firstName: null,
              lastName: null,
              email: null,
              siteOwner: false,
              avatarPath: null,
              avatarMedia: null,
              // whitespace-only => getProfileContacts() drops it, extractLinkedIn() returns raw value.
              profileData: { contacts: { linkedin: "   " } },
            },
          },
        ],
        tags: [],
        link: null,
        repository: null,
        content: "Contenu",
      }),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn(),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { getProjectForAdmin } = await import("@/lib/modules/projects/application/projects.service");
    const result = await getProjectForAdmin("alpha");

    expect(result.metadata.team[0].linkedIn).toBe("   ");
  });

  it("listProjectTagNames renvoie les noms de tags", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn(),
      findProjectBySlugTx: vi.fn(),
      listProjectsAdmin: vi.fn(),
      listProjectTags: vi.fn().mockResolvedValue([{ name: "Web" }, { name: "Mobile" }]),
      runProjectTransaction: vi.fn(),
      projectSlugExists: vi.fn(),
      clearProjectRelations: vi.fn(),
      createProject: vi.fn(),
      updateProject: vi.fn(),
      deleteProjectTx: vi.fn(),
    };
    vi.doMock("@/lib/modules/projects/infrastructure/projects.repo", () => repo);

    const { listProjectTagNames } = await import("@/lib/modules/projects/application/projects.service");
    const names = await listProjectTagNames();
    expect(names).toEqual(["Web", "Mobile"]);
  });
});
