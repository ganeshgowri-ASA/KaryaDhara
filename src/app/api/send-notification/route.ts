import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// Simple email notification API using fetch to a mail service
// In production, integrate with SendGrid, Resend, or AWS SES
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, message, taskId, type } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'to, subject, and message are required' }, { status: 400 });
    }

    // Store notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: type || 'SYSTEM',
        title: subject,
        message,
        taskId: taskId || null,
      },
    });

    // If RESEND_API_KEY is configured, send actual email
    const resendKey = process.env.RESEND_API_KEY;
    let emailSent = false;

    if (resendKey) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'KaryaDhara <noreply@karya-dhara.vercel.app>',
            to: Array.isArray(to) ? to : [to],
            subject: `[KaryaDhara] ${subject}`,
            html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
              <h2 style="color:#3B82F6">${subject}</h2>
              <p>${message}</p>
              ${taskId ? `<p><a href="${process.env.NEXTAUTH_URL}/dashboard?task=${taskId}" style="color:#3B82F6">View Task</a></p>` : ''}
              <hr/><p style="color:#999;font-size:12px">Sent from KaryaDhara Task Planner</p>
            </div>`,
          }),
        });
        emailSent = emailRes.ok;
      } catch {
        console.error('Email send failed');
      }
    }

    return NextResponse.json({
      success: true,
      notification,
      emailSent,
      message: emailSent ? 'Notification created and email sent' : 'Notification created (email not configured)',
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
