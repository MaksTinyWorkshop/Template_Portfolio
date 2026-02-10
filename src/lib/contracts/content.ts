import type { Status as PrismaStatus } from "@prisma/client";

export type ContentStatus = PrismaStatus;
export const CONTENT_STATUSES: ContentStatus[] = ["draft", "scheduled", "published"];
