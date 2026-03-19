import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, notFound } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const existing = await prisma.comment.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!existing) return notFound("Comment not found");

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
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const existing = await prisma.comment.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!existing) return notFound("Comment not found");

  await prisma.comment.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
