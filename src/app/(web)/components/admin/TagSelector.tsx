"use client";

import { Button, Flex, Input, Text } from "@once-ui-system/core";
import { useEffect, useMemo, useRef, useState } from "react";

interface TagSelectorProps {
  selectedTags: string[];
  availableTags: readonly string[];
  onTagsChange: (tags: string[]) => void;
  label: string;
  allowCustom?: boolean;
}

export function TagSelector({
  selectedTags,
  availableTags,
  onTagsChange,
  label,
  allowCustom = false,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const availableTagsIndex = useMemo(() => {
    const index = new Map<string, string>();
    for (const tag of availableTags) {
      index.set(tag.toLowerCase(), tag);
    }
    return index;
  }, [availableTags]);

  // Filtrer les suggestions selon l'input
  const lowerInput = inputValue.toLowerCase();
  const filteredSuggestions = availableTags.filter(
    (tag) =>
      !selectedTags.includes(tag) && tag.toLowerCase().includes(lowerInput || "") && tag.length,
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;

    if (!allowCustom) {
      const canonical = availableTagsIndex.get(trimmed.toLowerCase());
      if (!canonical) return;
      if (selectedTags.includes(canonical)) return;
      onTagsChange([...selectedTags, canonical]);
      setInputValue("");
      setShowSuggestions(false);
      return;
    }

    if (!selectedTags.includes(trimmed)) {
      onTagsChange([...selectedTags, trimmed]);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag));
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setShowSuggestions(false);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      // When `allowCustom` is disabled, the input is only a filter: selection happens via click.
      if (allowCustom && inputValue.trim()) addTag(inputValue);
    }
  };

  useEffect(() => {
    if (!showSuggestions) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!rootRef.current) return;
      if (rootRef.current.contains(target)) return;
      setShowSuggestions(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [showSuggestions]);

  return (
    <div ref={rootRef}>
      <Flex direction="column" gap="16">
        <Text variant="label-default-s" onBackground="neutral-weak">
          {label}
        </Text>

        {/* Tags sélectionnés */}
        <Flex gap="8" wrap>
          {selectedTags.map((tag) => (
            <Flex key={tag} gap="4" vertical="center">
              <button
                type="button"
                onClick={() => removeTag(tag)}
                style={{
                  padding: "6px 14px",
                  border: "none",
                  borderRadius: "12px",
                  backgroundColor: "var(--scheme-blue-700)",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "var(--neutral-on-background-strong)",
                }}
              >
                {tag}
              </button>
            </Flex>
          ))}
        </Flex>

        {/* Input avec suggestions */}
        <div style={{ position: "relative", width: "100%" }}>
          <Flex gap="8">
            <Input
              id="tag-input"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Filtrer..."
            />
            <Button
              variant="secondary"
              size="s"
              type="button"
              onClick={() => setShowSuggestions((prev) => !prev)}
            >
              {showSuggestions ? "Masquer" : "Voir tout"}
            </Button>
          </Flex>

          {/* Suggestions dropdown */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                maxHeight: "200px",
                overflowY: "auto",
                backgroundColor: "var(--neutral-background-medium)",
                border: "1px solid var(--neutral-border-medium)",
                borderRadius: "8px",
                zIndex: 10,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
            >
              {filteredSuggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 12px",
                    textAlign: "left",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "14px",
                    transition: "background-color 0.2s",
                    color: "var(--neutral-on-background-strong)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--neutral-background-weak)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </Flex>
    </div>
  );
}
