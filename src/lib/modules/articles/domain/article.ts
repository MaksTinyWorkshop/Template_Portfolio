export const ARTICLE_STATUSES = ["draft", "scheduled", "published"] as const;
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export type ArticleSlug = string;
