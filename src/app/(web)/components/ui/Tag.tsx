"use client";

import { Flex, Text } from "@once-ui-system/core";

interface TagProps {
  name: string;
  color?: string | null;
}

const DEFAULT_TAG_COLOR = "#9CA3AF";
const DEFAULT_TEXT_COLOR = "#FFFFFF";

export const Tag: React.FC<TagProps> = ({ name, color }) => {
  const backgroundColor = color || DEFAULT_TAG_COLOR;

  return (
    <Flex
      paddingX="s"
      paddingY="4"
      radius="full"
      style={{
        backgroundColor,
        width: "fit-content",
      }}
    >
      <Text
        variant="label-default-s"
        style={{
          color: DEFAULT_TEXT_COLOR,
          fontWeight: 500,
        }}
      >
        {name}
      </Text>
    </Flex>
  );
};
