import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUser,
  unauthorized,
  badRequest,
  getOrCreateWorkspace,
} from "@/lib/api-helpers";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const workspace = await getOrCreateWorkspace(user.id);

  const projects = await prisma.project.findMany({
    where: { workspaceId: workspace.id, status: "ACTIVE" },
    include: {
      _count: { select: { tasks: true } },
      sections: { orderBy: { position: "asc" } },
    },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { name, description, color, icon } = body;

  if (!name?.trim()) return badRequest("Name is required");

  const workspace = await getOrCreateWorkspace(user.id);

  const maxPosition = await prisma.project.aggregate({
    where: { workspaceId: workspace.id },
    _max: { position: true },
  });

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description || null,
      color: color || "#6366f1",
      icon: icon || null,
      position: (maxPosition._max.position ?? 0) + 1,
      workspaceId: workspace.id,
    },
    include: {
      _count: { select: { tasks: true } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
