import type { ArticleStatus } from "./domain/article";

export interface ArticleAdminMetadata {
  title: string;
  summary: string;
  publishedAt: string;
  status: ArticleStatus;
  tags: string[];
  image?: string;
}

export interface ArticleAdminPayload extends ArticleAdminMetadata {
  slug?: string;
  content: string;
}

export interface ArticleAdminListItem {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: ArticleStatus;
  tags: string[];
}

export interface ArticleAdminDetail {
  slug: string;
  metadata: ArticleAdminMetadata;
  content: string;
}
