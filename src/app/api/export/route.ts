import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAuthenticatedUser,
  errorResponse,
} from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Unauthorized", 401);

  const format = req.nextUrl.searchParams.get("format") || "json";
  const projectId = req.nextUrl.searchParams.get("projectId");

  try {
    const where: Record<string, unknown> = {
      creatorId: user.id,
      isArchived: false,
    };
    if (projectId) where.projectId = projectId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        labels: { include: { label: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const exportData = tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || "",
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() || "",
      startDate: t.startDate?.toISOString() || "",
      completedAt: t.completedAt?.toISOString() || "",
      project: t.project?.name || "",
      labels: t.labels.map((tl) => tl.label.name).join(", "),
      recurrence: t.recurrence ? JSON.stringify(t.recurrence) : "",
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    if (format === "csv") {
      const headers = [
        "id",
        "title",
        "description",
        "status",
        "priority",
        "dueDate",
        "startDate",
        "completedAt",
        "project",
        "labels",
        "recurrence",
        "createdAt",
        "updatedAt",
      ];

      const csvRows = [
        headers.join(","),
        ...exportData.map((row) =>
          headers
            .map((h) => {
              const val = String(row[h as keyof typeof row] || "");
              return `"${val.replace(/"/g, '""')}"`;
            })
            .join(",")
        ),
      ];

      return new Response(csvRows.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="tasks-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Default: JSON export
    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="tasks-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    return errorResponse(
      "Failed to export tasks",
      500,
      err instanceof Error ? err.message : undefined
    );
  }
}
