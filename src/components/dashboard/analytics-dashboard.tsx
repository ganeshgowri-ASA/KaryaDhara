"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/stores/dashboard-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  TrendingUp,
  BarChart3,
  Target,
  Zap,
} from "lucide-react";

function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-1">
          <CardDescription>{description}</CardDescription>
          {trend && (
            <span className="text-xs font-medium text-green-600">{trend}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function CompletionChart({ data }: { data: { date: string; completed: number; created: number }[] }) {
  if (!data.length) return null;

  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.completed, d.created)),
    1
  );

  const recentData = data.slice(-14);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4" />
          Task Completion Trends
        </CardTitle>
        <CardDescription>Last 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1" style={{ height: 120 }}>
          {recentData.map((d) => (
            <div
              key={d.date}
              className="flex flex-1 flex-col items-center gap-0.5"
            >
              <div className="flex w-full gap-0.5" style={{ height: 100 }}>
                <div
                  className="flex-1 rounded-t bg-primary/60"
                  style={{
                    height: `${(d.created / maxVal) * 100}%`,
                    marginTop: "auto",
                  }}
                  title={`Created: ${d.created}`}
                />
                <div
                  className="flex-1 rounded-t bg-green-500"
                  style={{
                    height: `${(d.completed / maxVal) * 100}%`,
                    marginTop: "auto",
                  }}
                  title={`Completed: ${d.completed}`}
                />
              </div>
              <span className="text-[8px] text-muted-foreground">
                {new Date(d.date).getDate()}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-primary/60" />
            <span>Created</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded bg-green-500" />
            <span>Completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverdueWidget({
  tasks,
}: {
  tasks: { id: string; title: string; priority: string; dueDate: string; daysOverdue: number }[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Overdue Tasks
        </CardTitle>
        <CardDescription>{tasks.length} task(s) overdue</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            No overdue tasks!
          </p>
        ) : (
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-destructive">
                      {task.daysOverdue}d overdue
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingWidget({
  tasks,
}: {
  tasks: { id: string; title: string; priority: string; dueDate: string; daysUntilDue: number }[];
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4 text-blue-500" />
          Upcoming Tasks
        </CardTitle>
        <CardDescription>Due this week</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            No upcoming deadlines
          </p>
        ) : (
          <ScrollArea className="max-h-[200px]">
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due in {task.daysUntilDue}d
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard() {
  const {
    metrics,
    completionTrends,
    overdueTasks,
    upcomingTasks,
    isLoading,
    fetchDashboard,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoading && !metrics) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  const m = metrics || {
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    upcomingTasks: 0,
    inProgressTasks: 0,
    completionRate: 0,
    avgCompletionTimeHours: 0,
    tasksCompletedThisWeek: 0,
    tasksCreatedThisWeek: 0,
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Tasks"
          value={m.totalTasks}
          description="All active tasks"
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Completed"
          value={m.completedTasks}
          description={`${m.completionRate}% completion rate`}
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
        />
        <MetricCard
          title="In Progress"
          value={m.inProgressTasks}
          description="Currently active"
          icon={<Clock className="h-4 w-4 text-blue-500" />}
        />
        <MetricCard
          title="Overdue"
          value={m.overdueTasks}
          description="Need attention"
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Productivity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm">
                <span>Completion Rate</span>
                <span className="font-medium">{m.completionRate}%</span>
              </div>
              <Progress value={m.completionRate} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-lg font-bold">{m.tasksCompletedThisWeek}</p>
                <p className="text-xs text-muted-foreground">Done this week</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-2.5 text-center">
                <p className="text-lg font-bold">{m.tasksCreatedThisWeek}</p>
                <p className="text-xs text-muted-foreground">
                  Created this week
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2.5">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">
                  {m.avgCompletionTimeHours}h
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg completion time
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <OverdueWidget tasks={overdueTasks} />
        <UpcomingWidget tasks={upcomingTasks} />
      </div>

      <CompletionChart data={completionTrends} />
    </div>
  );
}
