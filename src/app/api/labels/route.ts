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

  const labels = await prisma.label.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(labels);
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { name, color } = body;

  if (!name?.trim()) return badRequest("Name is required");

  const workspace = await getOrCreateWorkspace(user.id);

  const label = await prisma.label.create({
    data: {
      name: name.trim(),
      color: color || "#94a3b8",
      workspaceId: workspace.id,
    },
  });

  return NextResponse.json(label, { status: 201 });
}
