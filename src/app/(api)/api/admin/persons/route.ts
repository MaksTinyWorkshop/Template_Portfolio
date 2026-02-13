import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { ApiResponse } from "@/web/types";
import { checkAuthAPI } from "@/lib/utils/auth";
import { ApiError } from "@/lib/http/errors";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { createPersonSchema } from "@/lib/schemas/person.schema";
import { createPersonAdmin, listPersonsAdmin } from "@/lib/modules/person";

const requireAuth = async () => {
  const isAuthenticated = await checkAuthAPI();
  if (!isAuthenticated) {
    throw new ApiError("Non authentifié", 401);
  }
};

export const GET = withApiErrorHandling(async () => {
  await requireAuth();
  const data = await listPersonsAdmin();
  return NextResponse.json<ApiResponse>({ success: true, data });
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireAuth();
  const body = await request.json();
  const validatedData = createPersonSchema.parse(body);
  const created = await createPersonAdmin(validatedData);

  revalidatePath("/admin/persons");
  revalidatePath("/admin");

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Personne créée avec succès",
    data: { id: created.id },
  });
});
