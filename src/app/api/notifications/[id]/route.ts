import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
} from "@/lib/api-helpers";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  // Notifications are computed on-the-fly, so dismiss is a no-op acknowledgment
  return successResponse({ id, isRead: true });
}
