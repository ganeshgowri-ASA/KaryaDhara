"use client";

import { useEffect } from "react";
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
  TrendingUp,
  BarChart3,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { useDashboardStore } from "@/stores/dashboard-store";

const priorityLabels: Record<string, string> = {
  P1: "Urgent",
  P2: "High",
  P3: "Medium",
  P4: "Low",
};

const priorityColors: Record<string, string> = {
  P1: "bg-red-500",
  P2: "bg-orange-500",
  P3: "bg-blue-500",
  P4: "bg-gray-400",
};

const statusLabels: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

export function AnalyticsDashboard() {
  const { stats, isLoading, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) return null;

  const maxTrend = Math.max(
    ...stats.completionTrend.map((d) => Math.max(d.completed, d.created)),
    1
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
          </CardContent>
        </Card>

        <Card className={stats.overdueTasks > 0 ? "border-red-200 dark:border-red-800" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.overdueTasks}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingTasks}</div>
            <p className="text-xs text-muted-foreground">Due within 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Completion Trend Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              30-Day Completion Trend
            </CardTitle>
            <CardDescription>
              Tasks created vs completed over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-[2px]">
              {stats.completionTrend.map((day) => (
                <div key={day.date} className="group relative flex flex-1 flex-col items-center gap-[1px]">
                  <div className="absolute -top-8 hidden rounded bg-popover px-2 py-1 text-[10px] shadow-md group-hover:block">
                    {day.date.slice(5)}: {day.completed}c / {day.created}n
                  </div>
                  <div
                    className="w-full rounded-t bg-green-500/80 transition-all"
                    style={{
                      height: `${(day.completed / maxTrend) * 100}%`,
                      minHeight: day.completed > 0 ? "2px" : "0",
                    }}
                  />
                  <div
                    className="w-full rounded-t bg-blue-500/60"
                    style={{
                      height: `${(day.created / maxTrend) * 100}%`,
                      minHeight: day.created > 0 ? "2px" : "0",
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Created
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Priority</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(priorityLabels).map(([key, label]) => {
              const count = stats.tasksByPriority[key] || 0;
              const pct =
                stats.totalTasks > 0
                  ? Math.round((count / stats.totalTasks) * 100)
                  : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {key} - {label}
                    </span>
                    <span className="text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = stats.tasksByStatus[key] || 0;
              const pct =
                stats.totalTasks > 0
                  ? Math.round((count / stats.totalTasks) * 100)
                  : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[300px]">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {stats.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 border-b pb-3 last:border-0"
                  >
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {activity.type.replace(/_/g, " ")}
                    </Badge>
                    <div className="flex-1">
                      {activity.task && (
                        <p className="text-sm">{activity.task.title}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// Suppress unused import warnings
void priorityColors;
