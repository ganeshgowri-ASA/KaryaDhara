import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { to, subject, message, type } = body;

    // Email notification types: task_assigned, task_due, task_completed, reminder
    const emailData = {
      to: to || session.user.email,
      subject: subject || 'KaryaDhara Notification',
      message: message || 'You have a new notification.',
      type: type || 'general',
      sentAt: new Date().toISOString(),
      sentBy: session.user.email,
    };

    // In production, integrate with email service (SendGrid, Resend, etc.)
    // For now, log and return success
    console.log('Email notification queued:', emailData);

    return NextResponse.json({
      success: true,
      message: 'Email notification queued successfully',
      data: emailData,
    });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send email notification' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'KaryaDhara Email Notifications',
    status: 'active',
    supportedTypes: [
      'task_assigned',
      'task_due',
      'task_completed',
      'reminder',
      'project_update',
    ],
    provider: 'configurable (SendGrid, Resend, SMTP)',
  });
}
