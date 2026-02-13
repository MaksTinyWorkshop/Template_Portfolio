import { z } from "zod";

export const tagSchema = z.object({
  slug: z.string(),
  name: z.string(),
  color: z.string().nullable(),
});

export const articleSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  subtitle: z.string().nullable(),
  publishedAt: z.string().nullable(),
  image: z.string().nullable(),
  tags: z.array(tagSchema),
  content: z.string().nullable(),
});

export type Tag = z.infer<typeof tagSchema>;
export type ArticleSummary = z.infer<typeof articleSummarySchema>;
export const articleListSchema = z.array(articleSummarySchema);
