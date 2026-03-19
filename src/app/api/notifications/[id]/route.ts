import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const body = await request.json();

    const notification = await prisma.notification.update({
      where: { id, userId: session.user.id },
      data: { isRead: body.isRead ?? true },
    });

    return NextResponse.json(notification);
  } catch {
    return errorResponse("Failed to update notification", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    await prisma.notification.delete({
      where: { id, userId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("Failed to delete notification", 500);
  }
}
