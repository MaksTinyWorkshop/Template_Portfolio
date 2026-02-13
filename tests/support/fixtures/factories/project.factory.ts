import { faker } from "@faker-js/faker";
import type { ProjectSummary } from "@/lib/modules/projects";

const defaultTags: ProjectSummary["typeProjectTag"] = [
  { slug: "web", name: "Web", color: "#3B82F6" },
  { slug: "mobile", name: "Mobile", color: "#14B8A6" },
  { slug: "saas", name: "SaaS", color: "#7C3AED" },
  { slug: "vitrine", name: "Vitrine", color: "#2563EB" },
  { slug: "metier", name: "Metier", color: "#1D4ED8" },
  { slug: "e-commerce", name: "E-commerce", color: "#DC2626" },
];

export const createProject = (overrides: Partial<ProjectSummary> = {}): ProjectSummary => {
  const slug = overrides.slug ?? faker.helpers.slugify(faker.lorem.words(3)).toLowerCase();
  const title = overrides.title ?? faker.company.name();
  const publishedAt = overrides.publishedAt ?? faker.date.past().toISOString();
  const tags =
    overrides.typeProjectTag ??
    faker.helpers.arrayElements(defaultTags, faker.number.int({ min: 1, max: 3 }));

  return {
    slug,
    title,
    summary: overrides.summary ?? faker.lorem.sentences(2),
    publishedAt,
    status: overrides.status ?? "published",
    typeProjectTag: tags,
    images: overrides.images ?? [faker.image.url(), faker.image.url()],
    gallery: overrides.gallery ?? [faker.image.url(), faker.image.url()],
    heroImage: overrides.heroImage ?? faker.image.url(),
    link: overrides.link ?? `https://example.com/${slug}`,
    repository: overrides.repository ?? `https://github.com/${faker.internet.userName()}/${slug}`,
    content: overrides.content ?? faker.lorem.paragraphs(2),
    team:
      overrides.team ??
      Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
        name: faker.person.fullName(),
        role: faker.name.jobTitle(),
        avatar: faker.image.avatar(),
        linkedIn: null,
        socials: [],
      })),
  };
};

export const createProjects = (count: number): ProjectSummary[] =>
  Array.from({ length: count }, () => createProject());
