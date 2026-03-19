import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAuth,
  errorResponse,
  jsonResponse,
  parsePagination,
  paginatedResponse,
} from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const { page, limit, skip } = parsePagination(searchParams);
  const workspaceId = searchParams.get("workspaceId");

  const where: Record<string, unknown> = {};
  if (workspaceId) where.workspaceId = workspaceId;

  const [labels, total] = await Promise.all([
    prisma.label.findMany({
      where,
      include: {
        _count: { select: { tasks: true } },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
    prisma.label.count({ where }),
  ]);

  return paginatedResponse(labels, total, page, limit);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const { name, color, workspaceId } = await req.json();

    if (!name?.trim()) return errorResponse("Name is required");
    if (!workspaceId) return errorResponse("workspaceId is required");

    const label = await prisma.label.create({
      data: {
        name: name.trim(),
        color: color || "#94a3b8",
        workspaceId,
      },
      include: { _count: { select: { tasks: true } } },
    });

    return jsonResponse(label, 201);
  } catch {
    return errorResponse("Label with this name already exists in workspace", 409);
  }
}
