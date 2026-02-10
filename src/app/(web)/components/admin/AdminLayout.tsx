"use client";

import { Flex } from "@once-ui-system/core";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout admin minimal
 * La navigation admin est intégrée dans le Header principal
 * Le site gère déjà l'espacement du header via le layout global
 */
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Flex
      fillWidth
      horizontal="center"
      paddingX="24"
      style={{
        paddingTop: "var(--static-space-40)",
        paddingBottom: "var(--static-space-40)",
      }}
    >
      <Flex direction="column" maxWidth={56} fillWidth gap="40">
        {children}
      </Flex>
    </Flex>
  );
}
