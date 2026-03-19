import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
  successResponse,
  parsePagination,
  paginatedResponse,
} from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const { page, limit, skip } = parsePagination(req);
  const url = req.nextUrl;

  const status = url.searchParams.get("status");
  const workspaceId = url.searchParams.get("workspaceId");

  try {
    const where: Record<string, unknown> = {
      workspace: {
        members: { some: { userId: user.id } },
      },
    };
    if (status) where.status = status;
    if (workspaceId) where.workspaceId = workspaceId;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { tasks: true, sections: true } },
          sections: { orderBy: { position: "asc" } },
        },
      }),
      prisma.project.count({ where }),
    ]);

    return paginatedResponse(projects, total, page, limit);
  } catch (err) {
    return errorResponse(
      "Failed to fetch projects",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  try {
    const body = await req.json();
    const { name, description, color, workspaceId, startDate, endDate } = body;

    if (!name?.trim()) return errorResponse("Project name is required");
    if (!workspaceId) return errorResponse("Workspace ID is required");

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId: user.id },
    });
    if (!membership) return errorResponse("Not a member of this workspace", 403);

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description || null,
        color: color || "#6366f1",
        workspaceId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
      include: {
        _count: { select: { tasks: true, sections: true } },
      },
    });

    return successResponse(project, 201);
  } catch (err) {
    return errorResponse(
      "Failed to create project",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
