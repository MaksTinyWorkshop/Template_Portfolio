import { faker } from "@faker-js/faker";
import type { ArticleSummary } from "@/lib/modules/articles";

const articleTags = ["Tech", "Backend", "Frontend", "Next.js", "Java", "Test"];

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
