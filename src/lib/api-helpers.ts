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

// S2.3 helper aliases
export async function getAuthSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session;
}

export function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(url: URL): PaginationParams {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10))
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  pagination: PaginationParams
) {
  return NextResponse.json({
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  });
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
