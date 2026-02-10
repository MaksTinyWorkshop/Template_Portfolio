"use server";

import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/http/errors";
import { respondError, respondSuccess } from "@/lib/http/response";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { getProjectBySlug } from "@/lib/modules/projects";

const resolveSlug = (slugParam?: string | string[]) => {
  const slug = Array.isArray(slugParam) ? slugParam.join("/") : slugParam || "";
  if (!slug.trim()) {
    throw new ApiError("Slug manquant", 400);
  }
  return slug;
};

const handleGetProject = async (
  _request: NextRequest,
  context: { params: Promise<{ slug: string | string[] }>; },
) => {
  const { slug } = await context.params;
  const project = await getProjectBySlug(resolveSlug(slug));
  return respondSuccess({ project });
};

const handlePatchProject = async () =>
  respondError(new ApiError("Mise à jour non implémentée", 405));

const handleDeleteProject = async () =>
  respondError(new ApiError("Suppression non supportée", 405));

export const GET = withApiErrorHandling(handleGetProject);
export const PATCH = withApiErrorHandling(handlePatchProject);
export const DELETE = withApiErrorHandling(handleDeleteProject);
