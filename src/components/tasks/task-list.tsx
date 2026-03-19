"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useTaskStore, Task } from "@/stores/task-store";
import { cn } from "@/lib/utils";

const priorityColors: Record<string, string> = {
  P1: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  P2: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  P3: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  P4: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

const statusColors: Record<string, string> = {
  TODO: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  IN_PROGRESS:
    "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  IN_REVIEW:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  DONE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function TaskCard({ task }: { task: Task }) {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE" &&
    task.status !== "CANCELLED";

  return (
    <Card className={cn("transition-shadow hover:shadow-md", isOverdue && "border-red-300 dark:border-red-800")}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className={cn("text-sm font-medium", task.status === "DONE" && "line-through text-muted-foreground")}>
                {task.title}
              </h3>
              {task.recurrence && (
                <RefreshCw className="h-3 w-3 text-muted-foreground" />
              )}
            </div>

            {task.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="secondary"
                className={cn("text-[10px]", priorityColors[task.priority])}
              >
                {task.priority}
              </Badge>
              <Badge
                variant="secondary"
                className={cn("text-[10px]", statusColors[task.status])}
              >
                {task.status.replace("_", " ")}
              </Badge>

              {task.labels?.map(({ label }) => (
                <Badge
                  key={label.id}
                  variant="outline"
                  className="text-[10px]"
                  style={{
                    borderColor: label.color,
                    color: label.color,
                  }}
                >
                  {label.name}
                </Badge>
              ))}

              {task.dueDate && (
                <span
                  className={cn(
                    "flex items-center gap-1 text-[10px] text-muted-foreground",
                    isOverdue && "font-medium text-red-600"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}

              {task.project && (
                <span className="text-[10px] text-muted-foreground">
                  <span
                    className="mr-1 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: task.project.color }}
                  />
                  {task.project.name}
                </span>
              )}
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="text-[10px] text-muted-foreground">
                {task.subtasks.filter((s) => s.status === "DONE").length}/
                {task.subtasks.length} subtasks done
              </div>
            )}
          </div>

          {task.assignee && (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
              {task.assignee.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function TaskList() {
  const { tasks, isLoading, fetchTasks } =
    useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (isLoading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        No tasks found. Create your first task to get started.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
