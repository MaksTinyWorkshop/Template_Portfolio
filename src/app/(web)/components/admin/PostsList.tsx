"use client";

import { Text } from "@once-ui-system/core";
import { ContentList, type ContentConfig } from "./ContentList";
import type { Post } from "@/web/types/content";

interface PostsListProps {
  initialPosts: Post[];
}

const postConfig: ContentConfig<Post> = {
  type: "post",
  apiRoute: "/api/admin/posts",
  editRoute: (slug) => `/admin/blog/${slug}`,
  newRoute: "/admin/blog/new",
  emptyTitle: "Aucun article",
  emptyMessage: "Créez votre premier article pour commencer.",
  newButtonLabel: "➕ Nouvel article",
  deleteConfirmMessage: (slug) => `Êtes-vous sûr de vouloir supprimer l'article "${slug}" ?`,
  publishConfirmMessage: (title) => `Publier l'article "${title}" ? Cela créera un commit Git.`,
  deleteSuccessMessage: "Article supprimé avec succès",
  publishSuccessMessage: "Article publié avec succès !",
  renderTags: (post) => (
    <Text variant="label-default-s" onBackground="neutral-weak">
      🏷️ {post.tags.join(", ")}
    </Text>
  ),
};

export function PostsList({ initialPosts }: PostsListProps) {
  return <ContentList initialItems={initialPosts} config={postConfig} />;
}
