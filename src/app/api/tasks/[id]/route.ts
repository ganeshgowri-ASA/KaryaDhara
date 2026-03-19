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

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const task = await prisma.task.findUnique({
    where: { id: params.id },
    include: taskInclude,
  });

  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ task });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const allowedFields = [
    "title",
    "description",
    "status",
    "priority",
    "position",
    "dueDate",
    "startDate",
    "sectionId",
    "assigneeId",
    "projectId",
    "isArchived",
  ];

  const data: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      if ((field === "dueDate" || field === "startDate") && body[field]) {
        data[field] = new Date(body[field]);
      } else {
        data[field] = body[field];
      }
    }
  }

  if (body.status === "DONE" && !("completedAt" in body)) {
    data.completedAt = new Date();
  } else if (body.status && body.status !== "DONE") {
    data.completedAt = null;
  }

  const task = await prisma.task.update({
    where: { id: params.id },
    data,
    include: taskInclude,
  });

  return NextResponse.json({ task });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.task.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
