import { Flex, Heading, Button } from "@once-ui-system/core";
import Link from "next/link";
import { listTagsAdmin } from "@/lib/modules/tags";
import { TagsList } from "@/web/components/admin/TagsList";

// Force dynamic rendering - disable static generation during build
export const dynamic = "force-dynamic";

/**
 * Page liste des tags (admin)
 */
export default async function AdminTagsPage() {
  const tags = await listTagsAdmin();

  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "1400px" }}>
      <Flex horizontal="between" vertical="center" fillWidth>
        <Heading as="h1" variant="display-strong-l">
          🏷️ Tags
        </Heading>

        <Link href="/admin/tags/new">
          <Button variant="primary" size="m">
            ➕ Nouveau tag
          </Button>
        </Link>
      </Flex>

      <TagsList initialTags={tags} />
    </Flex>
  );
}
