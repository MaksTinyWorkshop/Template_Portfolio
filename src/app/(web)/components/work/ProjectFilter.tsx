"use client";

import { useState, useMemo } from "react";
import { Column, Flex, Text } from "@once-ui-system/core";
import { ProjectTag } from "@/web/components/ui/ProjectTag";

interface ProjectFilterProps {
  allTags: string[];
  onFilterChange: (selectedTags: string[]) => void;
}

export const ProjectFilter: React.FC<ProjectFilterProps> = ({ allTags, onFilterChange }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagClick = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newSelectedTags);
    onFilterChange(newSelectedTags);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    onFilterChange([]);
  };

  return (
    <Column gap="16" fillWidth paddingX="l" marginBottom="l" horizontal="center">
      <Flex gap="8" vertical="center" wrap horizontal="center">
        <Text variant="label-strong-m" onBackground="neutral-weak">
          Filtrer par :
        </Text>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              opacity: selectedTags.length === 0 || selectedTags.includes(tag) ? 1 : 0.4,
              transition: "opacity 0.2s ease",
            }}
          >
            <ProjectTag tag={tag} />
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button
            onClick={handleClearFilters}
            style={{
              border: "none",
              background: "transparent",
              padding: "4px 12px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            <Text variant="label-default-s" onBackground="neutral-weak">
              Tout réinitialiser
            </Text>
          </button>
        )}
      </Flex>
    </Column>
  );
};
