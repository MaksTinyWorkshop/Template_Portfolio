"use server";

import { NextRequest } from "next/server";
import { respondSuccess } from "@/lib/http/response";
import { withApiErrorHandling } from "@/lib/http/with-api-error";
import { listProjects } from "@/lib/modules/projects";

const handleGetProjects = async (_request: NextRequest) => {
  const projects = await listProjects();
  return respondSuccess({ projects });
};

export const GET = withApiErrorHandling(handleGetProjects);
