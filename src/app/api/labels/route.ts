import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";

const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  workspaceId: z.string(),
});

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const url = new URL(request.url);
  const workspaceId = url.searchParams.get("workspaceId");

  try {
    const labels = await prisma.label.findMany({
      where: workspaceId ? { workspaceId } : undefined,
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: labels });
  } catch {
    return errorResponse("Failed to fetch labels", 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  try {
    const body = await request.json();
    const data = createLabelSchema.parse(body);

    const label = await prisma.label.create({
      data: {
        name: data.name,
        color: data.color,
        workspaceId: data.workspaceId,
      },
      include: { _count: { select: { tasks: true } } },
    });

    return NextResponse.json(label, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    return errorResponse("Failed to create label", 500);
  }
}
