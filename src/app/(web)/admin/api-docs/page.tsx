import { Flex, Heading, Text } from "@once-ui-system/core";

export default function AdminApiDocsPage() {
  return (
    <Flex direction="column" fillWidth gap="16">
      <Flex direction="column" gap="8">
        <Heading as="h1" variant="display-strong-m">
          📘 API Docs (Swagger)
        </Heading>
        <Text variant="body-default-m" onBackground="neutral-weak">
          Documentation générée depuis les routes existantes.
        </Text>
      </Flex>

      <div
        style={{
          width: "100%",
          minHeight: "72vh",
          border: "1px solid var(--neutral-border-medium)",
          borderRadius: "12px",
          overflow: "hidden",
          background: "white",
        }}
      >
        <iframe
          title="Swagger UI"
          src="/api/admin/openapi/ui"
          style={{ width: "100%", height: "72vh", border: 0 }}
        />
      </div>
    </Flex>
  );
}
