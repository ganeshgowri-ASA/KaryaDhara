import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, errorResponse, jsonResponse } from "@/lib/api-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const existing = await prisma.label.findUnique({
    where: { id: params.id },
  });
  if (!existing) return errorResponse("Label not found", 404);

  try {
    const { name, color } = await req.json();
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (color !== undefined) data.color = color;

    const label = await prisma.label.update({
      where: { id: params.id },
      data,
      include: { _count: { select: { tasks: true } } },
    });

    return jsonResponse(label);
  } catch {
    return errorResponse("Label name conflict", 409);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth();
  if (!session) return errorResponse("Unauthorized", 401);

  const existing = await prisma.label.findUnique({
    where: { id: params.id },
  });
  if (!existing) return errorResponse("Label not found", 404);

  await prisma.label.delete({ where: { id: params.id } });
  return jsonResponse({ success: true });
}
