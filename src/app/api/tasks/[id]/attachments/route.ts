import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const attachments = await prisma.attachment.findMany({
      where: { taskId: params.id },
      include: { uploadedBy: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(attachments);
  } catch (error) {
    console.error('Attachments GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name, url, size, mimeType } = await req.json();
    if (!name || !url) {
      return NextResponse.json({ error: 'name and url are required' }, { status: 400 });
    }
    const attachment = await prisma.attachment.create({
      data: {
        name,
        url,
        size: size || 0,
        mimeType: mimeType || 'application/octet-stream',
        taskId: params.id,
        uploadedById: session.user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true, image: true } } },
    });
    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error('Attachments POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { attachmentId } = await req.json();
    await prisma.attachment.delete({ where: { id: attachmentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Attachments DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
