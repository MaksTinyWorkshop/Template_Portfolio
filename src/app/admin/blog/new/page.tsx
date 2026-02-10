import { Flex, Heading } from "@once-ui-system/core";
import { PostForm } from "@/components/admin/PostForm";

/**
 * Page de création d'un nouvel article
 */
export default function NewPostPage() {
  return (
    <Flex direction="column" fillWidth gap="24">
      <Flex horizontal="center" s={{ horizontal: "start" }}>
        <Heading as="h1" variant="display-strong-l">
          ✍️ Nouvel article
        </Heading>
      </Flex>

      <PostForm mode="create" />
    </Flex>
  );
}
