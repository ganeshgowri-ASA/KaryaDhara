import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const taskInclude = {
  assignee: { select: { id: true, name: true, email: true, image: true } },
  creator: { select: { id: true, name: true, email: true, image: true } },
  labels: { include: { label: true } },
  subtasks: {
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      position: true,
      dueDate: true,
      startDate: true,
      completedAt: true,
      projectId: true,
      sectionId: true,
      assigneeId: true,
      creatorId: true,
      parentId: true,
      isArchived: true,
      createdAt: true,
      updatedAt: true,
      description: true,
    },
  },
  blockedBy: {
    include: {
      blocking: { select: { id: true, title: true } },
      blocked: { select: { id: true, title: true } },
    },
  },
  blocks: {
    include: {
      blocking: { select: { id: true, title: true } },
      blocked: { select: { id: true, title: true } },
    },
  },
  section: { select: { id: true, name: true, color: true } },
  project: { select: { id: true, name: true, color: true } },
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  const where: Record<string, unknown> = {
    parentId: null,
    isArchived: false,
    OR: [
      { creatorId: session.user.id },
      { assigneeId: session.user.id },
    ],
  };

  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const tasks = await prisma.task.findMany({
    where,
    include: taskInclude,
    orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, status, priority, dueDate, startDate, projectId, sectionId, assigneeId, parentId } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description || null,
      status: status || "TODO",
      priority: priority || "P3",
      dueDate: dueDate ? new Date(dueDate) : null,
      startDate: startDate ? new Date(startDate) : null,
      projectId: projectId || null,
      sectionId: sectionId || null,
      assigneeId: assigneeId || null,
      parentId: parentId || null,
      creatorId: session.user.id,
    },
    include: taskInclude,
  });

  return NextResponse.json({ task }, { status: 201 });
}
