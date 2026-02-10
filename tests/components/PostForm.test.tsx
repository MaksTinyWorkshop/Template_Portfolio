import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, type ReactNode } from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
}));

const notifyMock = vi.fn();
vi.mock("@/web/components/utils/ToastService", () => ({
  ToastServiceProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useToastService: () => ({ notify: notifyMock }),
}));

vi.mock("./TagSelector", () => ({
  TagSelector: ({ onTagsChange }: { onTagsChange: (tags: string[]) => void }) => {
    useEffect(() => {
      onTagsChange(["Tech"]);
    }, [onTagsChange]);
    return <div data-testid="tag-selector" />;
  },
}));

vi.mock("@uiw/react-md-editor", () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      data-testid="md-editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

const fetchMock = vi.fn();
global.fetch = fetchMock as typeof global.fetch;

vi.mock("@uiw/react-md-editor", () => ({
  __esModule: true,
  default: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <textarea
      data-testid="md-editor"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

describe("PostForm client", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("soumet l'article en mode create", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo) => {
      const url = typeof input === "string" ? input : input.url;
      return {
        ok: true,
        json: async () => {
          if (url === "/api/admin/posts") {
            return { success: true };
          }
          return { success: true, data: [] };
        },
      };
    });

    const { PostForm } = await import("@/app/(web)/components/admin/PostForm");
    const { Providers } = await import("@/web/components/utils/Providers");

    render(
      <Providers>
        <PostForm
          mode="create"
          initialData={
            {
              title: "",
              summary: "",
              publishedAt: new Date().toISOString().split("T")[0],
              status: "draft",
              tags: ["Tech"],
              image: "",
              content: "",
            } as const
          }
        />
      </Providers>,
    );

    const titleInput = document.getElementById("title") as HTMLInputElement | null;
    const summaryInput = document.getElementById("summary") as HTMLTextAreaElement | null;
    const editor = await screen.findByTestId("md-editor");

    if (!titleInput || !summaryInput || !editor) {
      throw new Error("Impossible de trouver les champs title/summary/editor");
    }

    const user = userEvent.setup();

    await user.type(titleInput, "Titre article");
    await user.type(summaryInput, "Résumé ici");
    await user.type(editor, "Contenu MDX");

    await user.click(screen.getByRole("button", { name: /Créer l'article/i }));

    const getCallUrl = (input: RequestInfo | undefined) =>
      typeof input === "string" ? input : input && "url" in input ? input.url : undefined;

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "success" })),
    );
  });
});
