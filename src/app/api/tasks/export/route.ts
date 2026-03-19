import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") || "json";
  const projectId = searchParams.get("projectId");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {
    creatorId: session.user.id,
  };
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;

  const tasks = await prisma.task.findMany({
    where,
    include: {
      labels: { include: { label: true } },
      assignee: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
      section: { select: { id: true, name: true } },
      _count: { select: { subtasks: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const headers = [
      "ID",
      "Title",
      "Description",
      "Status",
      "Priority",
      "Due Date",
      "Start Date",
      "Completed At",
      "Project",
      "Section",
      "Assignee",
      "Labels",
      "Subtask Count",
      "Comment Count",
      "Created At",
      "Updated At",
    ];

    const escapeCSV = (val: string | null | undefined) => {
      if (val == null) return "";
      const s = String(val);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = tasks.map((t) =>
      [
        t.id,
        escapeCSV(t.title),
        escapeCSV(t.description),
        t.status,
        t.priority,
        t.dueDate?.toISOString() || "",
        t.startDate?.toISOString() || "",
        t.completedAt?.toISOString() || "",
        t.project?.name || "",
        t.section?.name || "",
        t.assignee?.name || "",
        escapeCSV(t.labels.map((l) => l.label.name).join("; ")),
        t._count.subtasks,
        t._count.comments,
        t.createdAt.toISOString(),
        t.updatedAt.toISOString(),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tasks-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  // JSON format
  const exportData = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate,
    startDate: t.startDate,
    completedAt: t.completedAt,
    project: t.project?.name || null,
    section: t.section?.name || null,
    assignee: t.assignee?.name || null,
    labels: t.labels.map((l) => l.label.name),
    subtaskCount: t._count.subtasks,
    commentCount: t._count.comments,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }));

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="tasks-export-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
