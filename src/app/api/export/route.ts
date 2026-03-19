import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const url = new URL(request.url);
  const format = url.searchParams.get("format") || "json";
  const projectId = url.searchParams.get("projectId");

  try {
    const where = {
      creatorId: session.user.id,
      isArchived: false,
      ...(projectId && { projectId }),
    };

    const tasks = await prisma.task.findMany({
      where,
      include: {
        labels: { include: { label: { select: { name: true, color: true } } } },
        project: { select: { name: true } },
        assignee: { select: { name: true, email: true } },
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
        "Assignee",
        "Labels",
        "Created At",
        "Updated At",
      ];

      const rows = tasks.map((t) => [
        t.id,
        `"${(t.title || "").replace(/"/g, '""')}"`,
        `"${(t.description || "").replace(/"/g, '""')}"`,
        t.status,
        t.priority,
        t.dueDate?.toISOString() || "",
        t.startDate?.toISOString() || "",
        t.completedAt?.toISOString() || "",
        t.project?.name || "",
        t.assignee?.name || "",
        t.labels.map((l) => l.label.name).join("; "),
        t.createdAt.toISOString(),
        t.updatedAt.toISOString(),
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n"
      );

      return new NextResponse(csv, {
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
      assignee: t.assignee?.name || null,
      labels: t.labels.map((l) => ({
        name: l.label.name,
        color: l.label.color,
      })),
      recurrence: t.recurrence,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="tasks-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch {
    return errorResponse("Failed to export tasks", 500);
  }
}
