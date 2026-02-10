import { z } from "zod";
import { PROJECT_STATUSES } from "../domain/project";

const projectTeamMemberSchema = z.object({
  name: z.string(),
  role: z.string().nullable(),
  avatar: z.string().nullable(),
  linkedIn: z.string().url().nullable(),
});

const projectStatusTuple = [...PROJECT_STATUSES] as const;

export const projectSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  publishedAt: z.string().nullable(),
  status: z.enum(projectStatusTuple),
  typeProjectTag: z.array(z.string()),
  images: z.array(z.string()),
  gallery: z.array(z.string()),
  heroImage: z.string().nullable(),
  link: z.string().nullable(),
  repository: z.string().nullable(),
  content: z.string().nullable(),
  team: z.array(projectTeamMemberSchema),
});

export type ProjectSummary = z.infer<typeof projectSummarySchema>;
export const projectListSchema = z.array(projectSummarySchema);
