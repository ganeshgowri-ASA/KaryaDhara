import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, notFound } from "@/lib/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const project = await prisma.project.findFirst({
    where: { id: params.id },
    include: {
      _count: { select: { tasks: true } },
      sections: { orderBy: { position: "asc" } },
    },
  });

  if (!project) return notFound("Project not found");
  return NextResponse.json(project);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const existing = await prisma.project.findFirst({
    where: { id: params.id },
  });
  if (!existing) return notFound("Project not found");

  const body = await req.json();
  const { name, description, color, icon, status } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (color !== undefined) data.color = color;
  if (icon !== undefined) data.icon = icon;
  if (status !== undefined) data.status = status;

  const project = await prisma.project.update({
    where: { id: params.id },
    data,
    include: { _count: { select: { tasks: true } } },
  });

  return NextResponse.json(project);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const existing = await prisma.project.findFirst({
    where: { id: params.id },
  });
  if (!existing) return notFound("Project not found");

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
