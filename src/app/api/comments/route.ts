import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, badRequest } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { taskId, content } = body;

  if (!taskId || !content?.trim()) return badRequest("taskId and content are required");

  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId: user.id,
      content: content.trim(),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
