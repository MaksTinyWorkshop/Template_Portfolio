import { Flex, Heading, Button } from "@once-ui-system/core";
import Link from "next/link";
import { listArticlesAdmin } from "@/lib/modules/articles";
import { PostsList } from "@/web/components/admin/PostsList";

// Force dynamic rendering - disable static generation during build
export const dynamic = 'force-dynamic';

interface PostListItem {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: "draft" | "scheduled" | "published";
  tags: string[];
}

/**
 * Page liste des articles (admin)
 */
export default async function AdminBlogPage() {
  const posts = await listArticlesAdmin();

  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "1400px" }}>
      <Flex horizontal="between" vertical="center" fillWidth>
        <Heading as="h1" variant="display-strong-l">
          📰 Articles
        </Heading>

        <Link href="/admin/blog/new">
          <Button variant="primary" size="m">
            ➕ Nouvel article
          </Button>
        </Link>
      </Flex>

      <PostsList initialPosts={posts} />
    </Flex>
  );
}
