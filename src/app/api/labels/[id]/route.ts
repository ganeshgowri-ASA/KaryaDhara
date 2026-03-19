import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthSession, errorResponse } from "@/lib/api-helpers";

const updateLabelSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateLabelSchema.parse(body);

    const label = await prisma.label.update({
      where: { id },
      data,
      include: { _count: { select: { tasks: true } } },
    });

    return NextResponse.json(label);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(error.issues[0].message, 400);
    }
    return errorResponse("Failed to update label", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session) return errorResponse("Unauthorized", 401);

  const { id } = await params;

  try {
    await prisma.label.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return errorResponse("Failed to delete label", 500);
  }
}
