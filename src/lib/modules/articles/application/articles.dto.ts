import { z } from "zod";

export const articleSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  subtitle: z.string().nullable(),
  publishedAt: z.string().nullable(),
  image: z.string().nullable(),
  tags: z.array(z.string()),
  content: z.string().nullable(),
});

export type ArticleSummary = z.infer<typeof articleSummarySchema>;
export const articleListSchema = z.array(articleSummarySchema);
