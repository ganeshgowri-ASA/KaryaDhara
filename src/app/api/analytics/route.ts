import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId');
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });
    }

    // Get all tasks for the workspace
    const tasks = await prisma.task.findMany({
      where: { project: { workspaceId } },
      include: { assignee: true, project: true },
    });

    // Get all projects
    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: { tasks: true, sections: true },
    });

    // Task status distribution
    const statusDistribution = tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    // Task priority distribution
    const priorityDistribution = tasks.reduce((acc: Record<string, number>, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    // Tasks by assignee
    const tasksByAssignee = tasks.reduce((acc: Record<string, { name: string; count: number; completed: number }>, task) => {
      const name = task.assignee?.name || 'Unassigned';
      if (!acc[name]) acc[name] = { name, count: 0, completed: 0 };
      acc[name].count++;
      if (task.status === 'DONE') acc[name].completed++;
      return acc;
    }, {});

    // Overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE').length;

    // Project progress
    const projectProgress = projects.map(p => {
      const total = p.tasks.length;
      const done = p.tasks.filter((t: { status: string }) => t.status === 'DONE').length;
      return {
        id: p.id,
        name: p.name,
        color: p.color,
        total,
        done,
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
      };
    });

    // Weekly completion trend (last 8 weeks)
    const weeklyTrend = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      const completed = tasks.filter(t =>
        t.completedAt && new Date(t.completedAt) >= weekStart && new Date(t.completedAt) < weekEnd
      ).length;
      weeklyTrend.push({
        week: `W${8 - i}`,
        completed,
        created: tasks.filter(t =>
          new Date(t.createdAt) >= weekStart && new Date(t.createdAt) < weekEnd
        ).length,
      });
    }

    return NextResponse.json({
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'DONE').length,
      overdueTasks,
      totalProjects: projects.length,
      statusDistribution,
      priorityDistribution,
      tasksByAssignee: Object.values(tasksByAssignee),
      projectProgress,
      weeklyTrend,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
