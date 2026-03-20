import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const body = await req.json();
  const { taskId, content } = body;

  if (!taskId || !content?.trim()) return errorResponse("taskId and content are required", 400);

  const comment = await prisma.comment.create({
    data: {
      taskId,
      userId: session.user.id,
      content: content.trim(),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
