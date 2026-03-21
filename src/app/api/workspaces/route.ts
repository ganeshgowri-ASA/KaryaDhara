import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { members: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        _count: { select: { projects: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // If user has no workspace, auto-create one
    if (workspaces.length === 0) {
      const newWorkspace = await prisma.workspace.create({
        data: {
          name: 'My Workspace',
          slug: `ws-${session.user.id.slice(0, 8)}`,
          ownerId: session.user.id,
          members: {
            create: { userId: session.user.id, role: 'OWNER' },
          },
        },
        include: {
          members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
          _count: { select: { projects: true } },
        },
      });
      return NextResponse.json([newWorkspace]);
    }

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Workspaces GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: `${slug}-${Date.now().toString(36)}`,
        description,
        ownerId: session.user.id,
        members: {
          create: { userId: session.user.id, role: 'OWNER' },
        },
      },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        _count: { select: { projects: true } },
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error('Workspaces POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
