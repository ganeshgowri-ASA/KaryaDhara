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

    const items = await prisma.checklistItem.findMany({
      where: { taskId: params.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Get checklist error:', error);
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

    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const item = await prisma.checklistItem.create({
      data: {
        text,
        taskId: params.id,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Create checklist item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, completed, text } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (typeof completed === 'boolean') updateData.completed = completed;
    if (text) updateData.text = text;

    const item = await prisma.checklistItem.update({
      where: { id: itemId, taskId: params.id },
      data: updateData,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Update checklist item error:', error);
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

    const { itemId } = await req.json();
    if (!itemId) {
      return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    }

    await prisma.checklistItem.delete({
      where: { id: itemId, taskId: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete checklist item error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
