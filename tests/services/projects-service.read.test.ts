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

  it("listProjects mappe heroImage depuis la gallerie et normalise les contacts", async () => {
    const repo = {
      listProjects: vi.fn().mockResolvedValue([
        {
          ...baseProject(),
          publishedAt: null,
          gallery: [
            { purpose: "gallery", order: null, media: { url: "https://example.com/0.png" } },
            { purpose: "gallery", order: 2, media: { url: "https://example.com/2.png" } },
            { purpose: "gallery", order: 1, media: { url: "https://example.com/1.png" } },
          ],
          tags: [
            { tag: { slug: "web", name: "Web", color: null } },
            { tag: { slug: "web", name: "Web", color: "#000" } },
          ],
          persons: [
            {
              role: null,
              person: {
                id: "p-1",
                fullName: "Bob",
                pseudo: null,
                role: null,
                firstName: null,
                lastName: null,
                email: null,
                siteOwner: false,
                avatarMedia: null,
                profileData: "oops",
              },
            },
            {
              role: null,
              person: {
                id: "p-1b",
                fullName: "Dana",
                pseudo: null,
                role: "Dev",
                firstName: null,
                lastName: null,
                email: null,
                siteOwner: false,
                avatarMedia: null,
                profileData: { contacts: "oops" },
              },
            },
            {
              role: null,
              person: {
                id: "p-2",
                fullName: "Alice",
                pseudo: "ali",
                role: "Dev",
                firstName: null,
                lastName: null,
                email: null,
                siteOwner: false,
                avatarMedia: null,
                profileData: {
                  contacts: {
                    linkedin: "ftp://example.com/in/alice",
                    github: "https://github.com/alice",
                  },
                },
              },
            },
            {
              role: null,
              person: {
                id: "p-3",
                fullName: "Charlie",
                pseudo: null,
                role: "Dev",
                firstName: null,
                lastName: null,
                email: null,
                siteOwner: false,
                avatarMedia: null,
                profileData: { contacts: { linkedin: "not-a-url" } },
              },
            },
          ],
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

    const { listProjects } = await import("@/lib/modules/projects/application/projects.service");
    const result = await listProjects();

    expect(result[0]).toMatchObject({
      publishedAt: null,
      heroImage: "https://example.com/0.png",
      typeProjectTag: [{ slug: "web", name: "Web", color: null }],
    });
    expect(result[0].team).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Bob", linkedIn: null, socials: [] }),
        expect.objectContaining({
          name: "ali",
          linkedIn: null,
          socials: [{ name: "github", url: "https://github.com/alice" }],
        }),
        expect.objectContaining({ name: "Charlie", linkedIn: null }),
      ]),
    );
  });

  it("listProjects trie la gallerie meme quand order est null", async () => {
    const repo = {
      listProjects: vi.fn().mockResolvedValue([
        {
          ...baseProject(),
          gallery: [
            { purpose: "gallery", order: null, media: { url: "https://example.com/a.png" } },
            { purpose: "gallery", order: null, media: { url: "https://example.com/b.png" } },
          ],
          persons: [],
          tags: [],
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

    const { listProjects } = await import("@/lib/modules/projects/application/projects.service");
    const result = await listProjects();
    expect(result[0]?.heroImage).toBe("https://example.com/a.png");
    expect(result[0]?.gallery).toEqual(["https://example.com/a.png", "https://example.com/b.png"]);
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

    const { listProjectSlugs } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
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
        tags: [{ tag: { slug: "web", name: "Web", color: null } }],
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

    const { getProjectBySlug } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
    const result = await getProjectBySlug("alpha");

    expect(repo.findProjectBySlug).toHaveBeenCalledWith("alpha");
    expect(result).toMatchObject({
      slug: "alpha",
      heroImage: "https://example.com/cover.png",
      typeProjectTag: [{ slug: "web", name: "Web", color: null }],
    });
    expect(result.gallery).toEqual(["https://example.com/1.png", "https://example.com/2.png"]);
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

    const { getProjectBySlug } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
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

    const { getProjectBySlug } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
    const { ProjectNotFoundError } = await import("@/lib/modules/projects/domain/project.errors");

    await expect(getProjectBySlug("missing")).rejects.toBeInstanceOf(ProjectNotFoundError);
  });

  it("listProjectsAdmin renvoie la liste admin", async () => {
    const repo = {
      listProjects: vi.fn().mockResolvedValue([
        {
          ...baseProject(),
          status: "draft",
          tags: [{ tag: { slug: "web", name: "Web", color: null } }],
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

    const { listProjectsAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
    const rows = await listProjectsAdmin();

    expect(repo.listProjects).toHaveBeenCalledTimes(1);
    expect(repo.listProjects.mock.calls[0]).toEqual([]);
    expect(rows[0]).toMatchObject({ slug: "alpha", status: "draft", typeProjectTag: ["Web"] });
  });

  it("listProjectsAdmin renvoie publishedAt vide si la date est absente", async () => {
    const repo = {
      listProjects: vi.fn().mockResolvedValue([
        {
          ...baseProject(),
          status: "draft",
          publishedAt: null,
          tags: [],
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

    const { listProjectsAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
    const rows = await listProjectsAdmin();
    expect(rows[0].publishedAt).toBe("");
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

    const { getProjectForAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
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
        gallery: [{ purpose: "cover", order: 0, media: { url: "https://example.com/cover.png" } }],
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
        tags: [{ tag: { slug: "web", name: "Web", color: null } }],
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

    const { getProjectForAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
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

  it("getProjectForAdmin ne pre-remplit pas featuredImage sans cover explicite", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn().mockResolvedValue({
        slug: "alpha",
        title: "Alpha",
        summary: null,
        publishedAt: new Date("2025-01-01T00:00:00Z"),
        status: "draft",
        gallery: [
          { purpose: "gallery", order: 0, media: { url: "https://example.com/1.png" } },
          { purpose: "gallery", order: 1, media: { url: "https://example.com/2.png" } },
        ],
        persons: [],
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

    const { getProjectForAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
    const detail = await getProjectForAdmin("alpha");

    expect(detail.metadata.featuredImage).toBeUndefined();
    expect(detail.metadata.images).toEqual([
      "https://example.com/1.png",
      "https://example.com/2.png",
    ]);
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

    const { getProjectForAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
    const detail = await getProjectForAdmin("alpha");

    expect(detail.metadata.team[0]).toMatchObject({
      name: "Alice",
      linkedIn: "https://linkedin.com/in/alice",
    });
    expect(detail.metadata.team[0].socials).toEqual([
      { name: "github", url: "https://github.com/alice" },
    ]);
  });

  it("getProjectForAdmin applique les fallback publishedAt/content et role vide", async () => {
    const repo = {
      listProjects: vi.fn(),
      findProjectBySlug: vi.fn().mockResolvedValue({
        slug: "alpha",
        title: "Alpha",
        summary: null,
        publishedAt: null,
        status: "draft",
        gallery: [],
        persons: [
          {
            role: null,
            person: {
              id: "p-1",
              fullName: "Alice",
              pseudo: null,
              role: null,
              firstName: null,
              lastName: null,
              email: null,
              siteOwner: false,
              avatarPath: null,
              avatarMedia: null,
              profileData: { contacts: {} },
            },
          },
        ],
        tags: [],
        link: null,
        repository: null,
        content: null,
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

    const { getProjectForAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
    const detail = await getProjectForAdmin("alpha");

    expect(detail.metadata.publishedAt).toBe("");
    expect(detail.content).toBe("");
    expect(detail.metadata.team[0]?.role).toBe("");
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
              // whitespace-only => getProfileContacts() drops it and normalizeHttpUrlOrNull() returns null.
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

    const { getProjectForAdmin } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
    const result = await getProjectForAdmin("alpha");

    expect(result.metadata.team[0].linkedIn).toBeUndefined();
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

    const { listProjectTagNames } = await import(
      "@/lib/modules/projects/application/projects.service"
    );
    const names = await listProjectTagNames();
    expect(names).toEqual(["Web", "Mobile"]);
  });
});
