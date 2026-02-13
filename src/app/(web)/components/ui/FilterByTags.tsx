"use client";

import { Tag } from "@/web/components/ui/Tag";
import { Column, Flex, Text } from "@once-ui-system/core";
import { useMemo, useState } from "react";

interface TagData {
  slug: string;
  name: string;
  color?: string | null;
}

interface FilterByTagsProps {
  allTags: TagData[];
  onFilterChange: (selectedTags: string[]) => void;
  label?: string;
  resetLabel?: string;
}

export const FilterByTags: React.FC<FilterByTagsProps> = ({
  allTags,
  onFilterChange,
  label = "Filtrer par :",
  resetLabel = "Tout réinitialiser",
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const sortedTags = useMemo(
    () => [...allTags].sort((a, b) => a.name.localeCompare(b.name)),
    [allTags],
  );

  const handleTagClick = (tagSlug: string) => {
    const newSelectedTags = selectedTags.includes(tagSlug)
      ? selectedTags.filter((t) => t !== tagSlug)
      : [...selectedTags, tagSlug];

    setSelectedTags(newSelectedTags);
    onFilterChange(newSelectedTags);
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
    onFilterChange([]);
  };

  if (!sortedTags.length) {
    return null;
  }

  return (
    <Column gap="16" fillWidth paddingX="l" marginBottom="l" horizontal="center">
      <Flex gap="8" vertical="center" wrap horizontal="center">
        <Text variant="label-strong-m" onBackground="neutral-weak">
          {label}
        </Text>
        {sortedTags.map((tag) => (
          <button
            key={tag.slug}
            type="button"
            onClick={() => handleTagClick(tag.slug)}
            style={{
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              opacity: selectedTags.length === 0 || selectedTags.includes(tag.slug) ? 1 : 0.4,
              transition: "opacity 0.2s ease",
            }}
          >
            <Tag name={tag.name} color={tag.color} />
          </button>
        ))}
        {selectedTags.length > 0 && (
          <button
            type="button"
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
              {resetLabel}
            </Text>
          </button>
        )}
      </Flex>
    </Column>
  );
};
