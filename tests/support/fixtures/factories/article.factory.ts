import { faker } from "@faker-js/faker";
import type { ArticleSummary } from "@/lib/modules/articles";

const articleTags: ArticleSummary["tags"] = [
  { slug: "tech", name: "Tech", color: "#3B82F6" },
  { slug: "backend", name: "Backend", color: "#2563EB" },
  { slug: "frontend", name: "Frontend", color: "#14B8A6" },
  { slug: "next-js", name: "Next.js", color: "#111827" },
  { slug: "java", name: "Java", color: "#DC2626" },
  { slug: "test", name: "Test", color: "#7C3AED" },
];

export const createArticle = (overrides: Partial<ArticleSummary> = {}): ArticleSummary => {
  const slug = overrides.slug ?? faker.helpers.slugify(faker.lorem.words(3)).toLowerCase();
  return {
    slug,
    title: overrides.title ?? faker.lorem.words(4),
    summary: overrides.summary ?? faker.lorem.sentences(2),
    subtitle: overrides.subtitle ?? faker.lorem.sentence(),
    publishedAt: overrides.publishedAt ?? faker.date.past().toISOString(),
    image: overrides.image ?? faker.image.url(),
    tags:
      overrides.tags ??
      faker.helpers.arrayElements(articleTags, faker.number.int({ min: 1, max: 3 })),
    content: overrides.content ?? faker.lorem.paragraphs(2),
  };
};

export const createArticles = (count: number): ArticleSummary[] =>
  Array.from({ length: count }, () => createArticle());
