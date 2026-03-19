import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  getAuthSession,
  parsePagination,
  paginatedResponse,
  errorResponse,
} from "@/lib/api-helpers";
import { ProjectStatus } from "@prisma/client";

const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  workspaceId: z.string(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const url = new URL(request.url);
  const pagination = parsePagination(url);
  const workspaceId = url.searchParams.get("workspaceId");
  const status = url.searchParams.get("status") as ProjectStatus | null;

  try {
    const where = {
      workspace: {
        members: { some: { userId: session.user.id } },
      },
      ...(workspaceId && { workspaceId }),
      ...(status && { status }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        include: {
          _count: { select: { tasks: true, sections: true } },
          sections: { select: { id: true, name: true }, orderBy: { position: "asc" } },
        },
        orderBy: { position: "asc" },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      prisma.project.count({ where }),
    ]);

    return paginatedResponse(projects, total, pagination);
  } catch {
    return errorResponse("Failed to fetch projects", 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || "#6366f1",
        icon: data.icon,
        workspaceId: data.workspaceId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
      include: {
        _count: { select: { tasks: true, sections: true } },
      },
    });

    await prisma.activity.create({
      data: {
        type: "PROJECT_CREATED",
        userId: session.user.id,
        projectId: project.id,
        workspaceId: data.workspaceId,
        meta: { name: data.name },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    return errorResponse("Failed to create project", 500);
  }
}
