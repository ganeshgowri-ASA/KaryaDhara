import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await prisma.timeEntry.findMany({
      where: { taskId: params.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Get time entries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description, startTime, endTime, duration } = await req.json();

    const entry = await prisma.timeEntry.create({
      data: {
        taskId: params.id,
        userId: session.user.id,
        description: description || '',
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        duration: duration || 0,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Create time entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entryId } = await req.json();
    if (!entryId) {
      return NextResponse.json({ error: 'entryId is required' }, { status: 400 });
    }

    await prisma.timeEntry.delete({
      where: { id: entryId, taskId: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete time entry error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
