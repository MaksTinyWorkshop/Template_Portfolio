import { Flex, Heading } from "@once-ui-system/core";
import { PostForm } from "@/web/components/admin/PostForm";
import { getArticleForAdmin } from "@/lib/modules/articles";
import { notFound } from "next/navigation";
import type { PostMetadata } from "@/web/types";

// Désactiver le prerendering pour cette page admin
export const dynamic = 'force-dynamic';

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = await getArticleForAdmin(slug);
  } catch (error) {
    console.error("Article introuvable", error);
    notFound();
  }

  const initialData = {
    ...post.metadata,
    slug: post.slug,
    content: post.content,
  } as PostMetadata & { content: string };

  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "1200px" }}>
      <Heading as="h1" variant="display-strong-l">
        ✏️ Éditer: {post.metadata.title}
      </Heading>

      <PostForm mode="edit" initialData={initialData} />
    </Flex>
  );
}
