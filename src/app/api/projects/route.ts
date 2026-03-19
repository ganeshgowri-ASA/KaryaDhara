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
  const status = searchParams.get("status");
  const workspaceId = searchParams.get("workspaceId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (workspaceId) where.workspaceId = workspaceId;

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        _count: { select: { tasks: true, sections: true } },
        sections: {
          select: { id: true, name: true, position: true },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.project.count({ where }),
  ]);

  return paginatedResponse(projects, total, page, limit);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const body = await req.json();
    const {
      name,
      description,
      color,
      icon,
      workspaceId,
      startDate,
      endDate,
    } = body;

    if (!name?.trim()) return errorResponse("Name is required");
    if (!workspaceId) return errorResponse("workspaceId is required");

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description,
        color: color || "#6366f1",
        icon,
        workspaceId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        _count: { select: { tasks: true, sections: true } },
      },
    });

    return jsonResponse(project, 201);
  } catch (error) {
    console.error("Create project error:", error);
    return errorResponse("Failed to create project", 500);
  }
}
