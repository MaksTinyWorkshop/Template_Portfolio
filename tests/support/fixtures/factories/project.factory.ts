import { faker } from "@faker-js/faker";
import type { ProjectSummary } from "@/lib/modules/projects";

const defaultTags = ["Web", "Mobile", "SaaS", "Vitrine", "Métier", "E-commerce"];

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
      })),
  };
};

export const createProjects = (count: number): ProjectSummary[] =>
  Array.from({ length: count }, () => createProject());
