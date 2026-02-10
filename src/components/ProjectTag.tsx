"use client";

import { Flex, Text } from "@once-ui-system/core";

interface ProjectTagProps {
  tag: string;
}

const tagColorMap: Record<string, { bg: string; text: string }> = {
  Web: { bg: "#3B82F6", text: "#FFFFFF" },
  Mobile: { bg: "#8B5CF6", text: "#FFFFFF" },
  "E-commerce": { bg: "#10B981", text: "#FFFFFF" },
  SaaS: { bg: "#F59E0B", text: "#FFFFFF" },
  Métier: { bg: "#06B6D4", text: "#FFFFFF" },
  Vitrine: { bg: "#6B7280", text: "#FFFFFF" },
};

export const ProjectTag: React.FC<ProjectTagProps> = ({ tag }) => {
  const colors = tagColorMap[tag] || {
    bg: "#9CA3AF",
    text: "#FFFFFF",
  };

  return (
    <Flex
      paddingX="s"
      paddingY="4"
      radius="full"
      style={{
        backgroundColor: colors.bg,
        width: "fit-content",
      }}
    >
      <Text
        variant="label-default-s"
        style={{
          color: colors.text,
          fontWeight: 500,
        }}
      >
        {tag}
      </Text>
    </Flex>
  );
};
