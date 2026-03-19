import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, unauthorized, notFound } from "@/lib/api-helpers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const existing = await prisma.label.findFirst({ where: { id: params.id } });
  if (!existing) return notFound("Label not found");

  const body = await req.json();
  const { name, color } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (color !== undefined) data.color = color;

  const label = await prisma.label.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(label);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const existing = await prisma.label.findFirst({ where: { id: params.id } });
  if (!existing) return notFound("Label not found");

  await prisma.label.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
