"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Loader2,
  BarChart3,
  Calendar,
} from "lucide-react";

interface Analytics {
  summary: {
    totalTasks: number;
    completedTasks: number;
    activeTasks: number;
    overdueTasks: number;
    productivityScore: number;
  };
  completionTrend: { date: string; completed: number }[];
  statusDistribution: { status: string; count: number }[];
  priorityDistribution: { priority: string; count: number }[];
  upcomingTasks: {
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    status: string;
  }[];
}

const statusColors: Record<string, string> = {
  TODO: "bg-gray-200 dark:bg-gray-700",
  IN_PROGRESS: "bg-blue-200 dark:bg-blue-800",
  IN_REVIEW: "bg-yellow-200 dark:bg-yellow-800",
  DONE: "bg-green-200 dark:bg-green-800",
  CANCELLED: "bg-red-200 dark:bg-red-800",
  ARCHIVED: "bg-gray-300 dark:bg-gray-600",
};

const priorityLabels: Record<string, string> = {
  P1: "Urgent",
  P2: "High",
  P3: "Medium",
  P4: "Low",
};

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/analytics?days=${days}`);
      if (res.ok) {
        setAnalytics(await res.json());
      }
    } catch {
      // Silently fail
    }
    setLoading(false);
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Failed to load analytics.
      </p>
    );
  }

  const { summary, completionTrend, statusDistribution, priorityDistribution, upcomingTasks } = analytics;
  const maxCompleted = Math.max(...completionTrend.map((d) => d.completed), 1);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Analytics</h3>
        <Select value={days} onValueChange={setDays}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.totalTasks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.completedTasks}</p>
            <CardDescription>in {days} days</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">
              {summary.overdueTasks}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.productivityScore}%</p>
            <Progress value={summary.productivityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Completion Trend Chart (CSS bar chart) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Completion Trend
            </CardTitle>
            <CardDescription>Tasks completed per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-[2px] h-32">
              {completionTrend.slice(-Math.min(completionTrend.length, 30)).map((d) => (
                <div
                  key={d.date}
                  className="flex-1 bg-primary/70 rounded-t-sm hover:bg-primary transition-colors min-w-[3px]"
                  style={{
                    height: `${Math.max((d.completed / maxCompleted) * 100, 2)}%`,
                  }}
                  title={`${d.date}: ${d.completed} completed`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusDistribution.map((s) => {
              const pct =
                summary.totalTasks > 0
                  ? Math.round((s.count / summary.totalTasks) * 100)
                  : 0;
              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{s.status.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground">
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusColors[s.status] || "bg-gray-300"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Priority Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {priorityDistribution.map((p) => (
                <div
                  key={p.priority}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <Badge variant="outline">
                    {priorityLabels[p.priority] || p.priority}
                  </Badge>
                  <span className="text-lg font-semibold">{p.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming (7 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upcoming deadlines
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between text-sm border rounded-md p-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{task.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
