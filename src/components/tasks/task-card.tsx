"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  AlertTriangle,
  Repeat,
} from "lucide-react";
import type { Task } from "../../../stores/task-store";

const priorityConfig: Record<string, { label: string; className: string }> = {
  P1: { label: "Urgent", className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  P2: { label: "High", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" },
  P3: { label: "Medium", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
  P4: { label: "Low", className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" },
};

const statusIcons: Record<string, React.ReactNode> = {
  TODO: <Circle className="h-4 w-4 text-muted-foreground" />,
  IN_PROGRESS: <Clock className="h-4 w-4 text-blue-500" />,
  IN_REVIEW: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  DONE: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

interface TaskCardProps {
  task: Task;
  onSelect?: (task: Task) => void;
  onStatusChange?: (taskId: string, status: string) => void;
}

export function TaskCard({ task, onSelect, onStatusChange }: TaskCardProps) {
  const priority = priorityConfig[task.priority] || priorityConfig.P3;
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE" &&
    task.status !== "CANCELLED";

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => onSelect?.(task)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange?.(
                  task.id,
                  task.status === "DONE" ? "TODO" : "DONE"
                );
              }}
              className="mt-0.5 shrink-0"
            >
              {statusIcons[task.status] || statusIcons.TODO}
            </button>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium leading-tight ${
                  task.status === "DONE"
                    ? "line-through text-muted-foreground"
                    : ""
                }`}
              >
                {task.title}
              </p>
              {task.description && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={priority.className}>
            {priority.label}
          </Badge>

          {task.labels?.map((tl) => (
            <Badge
              key={tl.labelId}
              variant="outline"
              style={{
                borderColor: tl.label.color,
                color: tl.label.color,
              }}
            >
              {tl.label.name}
            </Badge>
          ))}

          {task.recurrence && (
            <Badge variant="secondary" className="gap-1">
              <Repeat className="h-3 w-3" />
              Recurring
            </Badge>
          )}
        </div>

        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 ${isOverdue ? "text-red-500 font-medium" : ""}`}
            >
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task._count && task._count.subtasks > 0 && (
            <span>
              {task.subtasks?.filter((s) => s.status === "DONE").length || 0}/
              {task._count.subtasks} subtasks
            </span>
          )}
          {task._count && task._count.comments > 0 && (
            <span>{task._count.comments} comments</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
