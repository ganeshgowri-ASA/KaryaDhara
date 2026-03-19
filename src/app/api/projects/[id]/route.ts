import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";
import { ProjectStatus } from "@prisma/client";

const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(50).nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  position: z.number().optional(),
  startDate: z.string().datetime().nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: { select: { tasks: true, sections: true } },
        sections: {
          include: {
            tasks: {
              select: { id: true, title: true, status: true, priority: true },
              orderBy: { position: "asc" },
            },
          },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!project) return errorResponse("Project not found", 404);

    return NextResponse.json(project);
  } catch {
    return errorResponse("Failed to fetch project", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateProjectSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate !== undefined) {
      updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    }
    if (data.endDate !== undefined) {
      updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    }

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { tasks: true, sections: true } },
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    return errorResponse("Failed to update project", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) return errorResponse("Project not found", 404);

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("Failed to delete project", 500);
  }
}
