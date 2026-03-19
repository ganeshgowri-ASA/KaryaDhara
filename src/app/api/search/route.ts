import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  try {
    const [tasks, projects, labels] = await Promise.all([
      prisma.task.findMany({
        where: {
          creatorId: session.user.id,
          isArchived: false,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          project: { select: { name: true } },
        },
        take: 10,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.project.findMany({
        where: {
          workspace: { members: { some: { userId: session.user.id } } },
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, description: true, color: true },
        take: 5,
      }),
      prisma.label.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        select: { id: true, name: true, color: true },
        take: 5,
      }),
    ]);

    const results = [
      ...tasks.map((t) => ({
        id: t.id,
        type: "task" as const,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        projectName: t.project?.name,
      })),
      ...projects.map((p) => ({
        id: p.id,
        type: "project" as const,
        title: p.name,
        description: p.description,
        color: p.color,
      })),
      ...labels.map((l) => ({
        id: l.id,
        type: "label" as const,
        title: l.name,
        color: l.color,
      })),
    ];

    return NextResponse.json({ data: results });
  } catch {
    return errorResponse("Search failed", 500);
  }
}
