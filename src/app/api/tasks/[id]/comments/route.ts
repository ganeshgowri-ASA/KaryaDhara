import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  errorResponse,
  jsonResponse,
  parsePagination,
  paginatedResponse,
} from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const { page, limit, skip } = parsePagination(req.nextUrl.searchParams);

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { taskId: params.id },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.comment.count({ where: { taskId: params.id } }),
  ]);

  return paginatedResponse(comments, total, page, limit);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task) return errorResponse("Task not found", 404);

  try {
    const { content } = await req.json();
    if (!content?.trim()) return errorResponse("Content is required");

    const comment = await prisma.comment.create({
      data: {
        taskId: params.id,
        userId: session.user.id,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return jsonResponse(comment, 201);
  } catch (error) {
    console.error("Create comment error:", error);
    return errorResponse("Failed to create comment", 500);
  }
}
