import { Flex, Heading } from "@once-ui-system/core";
import { AssetsManager } from "@/web/components/admin/AssetsManager";

export const dynamic = "force-dynamic";

export default function AdminAssetsPage() {
  return (
    <Flex direction="column" fillWidth gap="24" style={{ maxWidth: "1400px" }}>
      <Flex horizontal="between" vertical="center" fillWidth>
        <Heading as="h1" variant="display-strong-l">
          🗂️ Assets
        </Heading>
      </Flex>
      <AssetsManager />
    </Flex>
  );
}
