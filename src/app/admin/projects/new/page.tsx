import { Flex, Heading } from "@once-ui-system/core";
import { ProjectForm } from "@/components/admin/ProjectForm";

/**
 * Page de création d'un nouveau projet
 */
export default function NewProjectPage() {
  return (
    <Flex direction="column" fillWidth gap="24">
      <Flex horizontal="center" s={{ horizontal: "start" }}>
        <Heading as="h1" variant="display-strong-l">
          ✨ Nouveau projet
        </Heading>
      </Flex>

      <ProjectForm mode="create" />
    </Flex>
  );
}
