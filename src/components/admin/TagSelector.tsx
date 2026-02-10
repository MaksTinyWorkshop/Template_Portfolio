"use client";

import { Flex, Input } from "@once-ui-system/core";
import { useState } from "react";

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
  allowCustom = false,
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filtrer les suggestions selon l'input
  const filteredSuggestions = availableTags.filter(
    (tag) => tag.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.includes(tag),
  );

  const addTag = (tag: string) => {
    if (tag.trim() && !selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag.trim()]);
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
    if (e.key === "Enter") {
      e.preventDefault();
      if (allowCustom && inputValue.trim()) {
        addTag(inputValue);
      } else if (filteredSuggestions.length > 0) {
        addTag(filteredSuggestions[0]);
      }
    }
  };

  return (
    <Flex direction="column" gap="16">
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
            onFocus={() => setShowSuggestions(inputValue.length > 0)}
            placeholder="Tags..."
          />
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
  );
}
