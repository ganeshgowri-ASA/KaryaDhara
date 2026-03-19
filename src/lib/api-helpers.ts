import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export async function getOrCreateWorkspace(userId: string) {
  // Find user's first workspace or create a personal one
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
  });
  if (membership) return membership.workspace;

  // Create personal workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: "Personal",
      slug: `personal-${userId.slice(0, 8)}`,
      ownerId: userId,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
  });
  return workspace;
}
