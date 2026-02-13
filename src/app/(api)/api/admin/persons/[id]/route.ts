import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { updatePersonSchema } from "@/lib/schemas/person.schema";
import { deletePersonAdmin, getPersonForAdmin, updatePersonAdmin } from "@/lib/modules/person";

const requireAuth = async () => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }
};

export const GET = withApiErrorHandling(
  async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAuth();
    const { id } = await params;
    const person = await getPersonForAdmin(id);
    return NextResponse.json<ApiResponse>({ success: true, data: person });
  },
);

export const PUT = withApiErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const updateData = updatePersonSchema.parse(body);
    const updated = await updatePersonAdmin(id, updateData);

    revalidatePath("/admin/persons");
    revalidatePath("/admin");

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Personne mise à jour avec succès",
      data: { id: updated.id },
    });
  },
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAuth();
    const { id } = await params;
    await deletePersonAdmin(id);

    revalidatePath("/admin/persons");
    revalidatePath("/admin");

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Personne supprimée avec succès",
      data: { id },
    });
  },
);
