import { z } from "zod";
import { PROJECT_STATUSES } from "../domain/project";

const projectTeamMemberSchema = z.object({
  name: z.string(),
  role: z.string().nullable(),
  avatar: z.string().nullable(),
  linkedIn: z.string().url().nullable().catch(null),
  socials: z
    .array(
      z.object({
        name: z.string(),
        url: z.string(),
      }),
    )
    .default([]),
  email: z.string().email().nullable().optional(),
  isSiteOwner: z.boolean().optional(),
  personId: z.string().optional(),
});

const tagSchema = z.object({
  slug: z.string(),
  name: z.string(),
  color: z.string().nullable(),
});

const projectStatusTuple = [...PROJECT_STATUSES] as const;

export const projectSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  publishedAt: z.string().nullable(),
  status: z.enum(projectStatusTuple),
  typeProjectTag: z.array(tagSchema),
  images: z.array(z.string()),
  gallery: z.array(z.string()),
  heroImage: z.string().nullable(),
  link: z.string().nullable(),
  repository: z.string().nullable(),
  content: z.string().nullable(),
  team: z.array(projectTeamMemberSchema),
});

export type Tag = z.infer<typeof tagSchema>;
export type ProjectSummary = z.infer<typeof projectSummarySchema>;
export const projectListSchema = z.array(projectSummarySchema);
