import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const existing = await prisma.comment.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!existing) return errorResponse("Comment not found", 404);

  const { content } = await req.json();

  const comment = await prisma.comment.update({
    where: { id: params.id },
    data: { content, isEdited: true },
    include: { user: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(comment);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const existing = await prisma.comment.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!existing) return errorResponse("Comment not found", 404);

  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
