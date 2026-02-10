import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
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

const notifyMock = vi.fn();
vi.mock("@/web/components/utils/ToastService", () => ({
  ToastServiceProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useToastService: () => ({ notify: notifyMock }),
}));

const fetchMock = vi.fn();
global.fetch = fetchMock;

const setFetchResponses = (...responses: Array<unknown>) => {
  fetchMock.mockReset();
  responses.forEach((response) => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => response,
    });
  });
};

describe("ProjectForm UI", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("notifie le succès lors de la création", async () => {
    setFetchResponses(
      { success: true, data: ["Web"] },
      { success: true, data: [] },
      { success: true, data: { slug: "test-" } },
    );

    fetchMock.mockImplementation(async (input: RequestInfo) => {
      const url = typeof input === "string" ? input : input.url;
      if (url === "/api/availability") {
        return { ok: true, json: async () => ({ success: true, data: null }) };
      }
      if (url?.startsWith("/api/admin/projects/tags")) {
        return { ok: true, json: async () => ({ success: true, data: [] }) };
      }
      if (url?.startsWith("/api/admin/persons")) {
        return { ok: true, json: async () => ({ success: true, data: [] }) };
      }
      if (url === "/api/admin/projects") {
        return { ok: true, json: async () => ({ success: true, data: { slug: "test-" } }) };
      }
      return { ok: true, json: async () => ({ success: true, data: [] }) };
    });

    const user = userEvent.setup();
    const { ProjectForm } = await import("@/app/(web)/components/admin/ProjectForm");
    const { Providers } = await import("@/web/components/utils/Providers");

    render(
      <Providers>
        <ProjectForm
          mode="create"
          initialData={
            {
              title: "",
              summary: "",
              publishedAt: new Date().toISOString().split("T")[0],
              status: "draft",
              typeProjectTag: ["Web"],
              featuredImage: "",
              images: [],
              team: [],
              link: "",
              repository: "",
              content: "",
            } as const
          }
        />
      </Providers>,
    );

    const titleInput = document.getElementById("title") as HTMLInputElement | null;
    const summaryInput = document.getElementById("summary") as HTMLTextAreaElement | null;

    if (!titleInput || !summaryInput) {
      throw new Error("Impossible de trouver les champs title/summary");
    }

    await user.type(titleInput, "Nouveau projet");
    await user.type(summaryInput, "Résumé rapide");
    await user.type(screen.getByTestId("md-editor"), "Contenu complet");

    const createButton = await screen.findByRole("button", { name: /Créer le projet/i });
    await user.click(createButton);

    const getCallUrl = (input: RequestInfo | undefined) =>
      typeof input === "string" ? input : input && "url" in input ? input.url : undefined;

    await waitFor(() =>
      expect(notifyMock).toHaveBeenCalledWith(expect.objectContaining({ variant: "success" })),
    );
  });
});
