import { ValidationError } from "@/lib/http/errors";
import { TagNotFoundError } from "../domain/tag.errors";
import {
  createTag,
  deleteTag,
  getTagBySlug,
  listTags,
  updateTag,
} from "../infrastructure/tags.repo";
import type { TagAdminDetail, TagAdminListItem, TagAdminPayload } from "../types";

const mapTagToAdminDetail = (tag: TagAdminListItem): TagAdminDetail => ({
  id: tag.id,
  slug: tag.slug,
  name: tag.name,
  category: tag.category,
  description: tag.description ?? null,
  color: tag.color ?? null,
});

export const listTagsAdmin = async (): Promise<TagAdminListItem[]> => listTags();

export const getTagForAdmin = async (slug: string): Promise<TagAdminDetail> => {
  const tag = await getTagBySlug(slug);
  if (!tag) {
    throw new TagNotFoundError(slug);
  }
  return mapTagToAdminDetail(tag as TagAdminListItem);
};

export const createTagAdmin = async (
  payload: Required<Pick<TagAdminPayload, "name" | "category">> & TagAdminPayload,
) => {
  if (!payload.name?.trim()) {
    throw new ValidationError("Le nom est requis");
  }
  return createTag({
    name: payload.name,
    category: payload.category!,
    description: payload.description,
    color: payload.color,
  });
};

export const updateTagAdmin = async (slug: string, payload: TagAdminPayload) => {
  const existing = await getTagBySlug(slug);
  if (!existing) {
    throw new TagNotFoundError(slug);
  }
  return updateTag(existing.id, payload);
};

export const deleteTagAdmin = async (slug: string) => {
  const existing = await getTagBySlug(slug);
  if (!existing) {
    throw new TagNotFoundError(slug);
  }
  await deleteTag(existing.id);
};
