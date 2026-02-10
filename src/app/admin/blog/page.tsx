import { Flex, Heading, Button } from "@once-ui-system/core";
import Link from "next/link";
import dynamic from "next/dynamic";
import { listMDXFiles } from "@/utils/mdx-admin";

// Lazy load du composant PostsList pour améliorer les performances
const PostsList = dynamic(
  () => import("@/components/admin/PostsList").then((mod) => mod.PostsList),
  {
    loading: () => (
      <Flex direction="column" gap="16" fillWidth>
        <div style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
          Chargement des articles...
        </div>
      </Flex>
    ),
  },
);

interface PostListItem {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  status: "draft" | "scheduled" | "published";
  tag: string;
}

/**
 * Page liste des articles (admin)
 */
export default async function AdminBlogPage() {
  const result = await listMDXFiles("post");
  const posts = (result.success ? result.data || [] : []) as PostListItem[];

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
