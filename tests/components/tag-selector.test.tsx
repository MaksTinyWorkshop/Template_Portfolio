import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagSelector } from "@/web/components/admin/TagSelector";

describe("TagSelector", () => {
  it("displays suggestions when requested and allows selecting tags", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <TagSelector
        selectedTags={[]}
        availableTags={["Tech", "Design", "Dev"]}
        onTagsChange={handleChange}
        label="Tags"
      />,
    );

    const button = screen.getByRole("button", { name: /voir tout/i });
    await user.click(button);

    expect(screen.getByText("Tech")).toBeInTheDocument();
    await user.click(screen.getByText("Tech"));
    expect(handleChange).toHaveBeenCalledWith(["Tech"]);
  });

  it("closes suggestions when clicking outside", async () => {
    const user = userEvent.setup();

    render(
      <>
        <TagSelector
          selectedTags={[]}
          availableTags={["Tech", "Design", "Dev"]}
          onTagsChange={() => {}}
          label="Tags"
        />
        <button type="button">Outside</button>
      </>,
    );

    await user.click(screen.getByRole("button", { name: /voir tout/i }));
    expect(screen.getByText("Tech")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByText("Tech")).not.toBeInTheDocument();
  });
});
