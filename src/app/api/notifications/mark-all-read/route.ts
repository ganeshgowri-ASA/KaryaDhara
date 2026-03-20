import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";

export async function POST() {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("Failed to mark all as read", 500);
  }
}
