"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "@/types";
import { TaskQuickActions } from "./task-quick-actions";

interface ListViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
  onTitleChange: (taskId: string, title: string) => void;
}

export function ListView({
  tasks,
  onStatusChange,
  onPriorityChange,
  onTitleChange,
}: ListViewProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState("");

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const submitEdit = (taskId: string) => {
    if (editTitle.trim() && editTitle.trim() !== tasks.find((t) => t.id === taskId)?.title) {
      onTitleChange(taskId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="grid grid-cols-[1fr_100px_100px_120px_120px] gap-2 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
        <span>Title</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Due Date</span>
        <span>Assignee</span>
      </div>

      {/* Rows */}
      {tasks.map((task) => (
        <div
          key={task.id}
          className="group grid grid-cols-[1fr_100px_100px_120px_120px] gap-2 px-4 py-2.5 items-center border-b last:border-b-0 hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() =>
                onStatusChange(task.id, task.status === "DONE" ? "TODO" : "DONE")
              }
              className={cn(
                "h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors",
                task.status === "DONE"
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-muted-foreground/40 hover:border-green-500"
              )}
            >
              {task.status === "DONE" && (
                <svg className="h-2.5 w-2.5" viewBox="0 0 12 12">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              )}
            </button>

            {editingId === task.id ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => submitEdit(task.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitEdit(task.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="flex-1 bg-transparent text-sm outline-none ring-1 ring-ring rounded px-1"
              />
            ) : (
              <span
                className={cn(
                  "text-sm truncate cursor-pointer",
                  task.status === "DONE" && "line-through text-muted-foreground"
                )}
                onDoubleClick={() => startEditing(task)}
              >
                {task.title}
              </span>
            )}

            {task.labels?.slice(0, 2).map((tl) => (
              <Badge
                key={tl.labelId}
                className="text-[10px] px-1 py-0 flex-shrink-0"
                style={{ backgroundColor: tl.label.color, color: "#fff" }}
              >
                {tl.label.name}
              </Badge>
            ))}

            <TaskQuickActions
              task={task}
              onStatusChange={onStatusChange}
              onPriorityChange={onPriorityChange}
              onEdit={() => startEditing(task)}
            />
          </div>

          <div>
            <Badge
              variant="secondary"
              className={cn("text-[10px] px-1.5 py-0")}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full mr-1",
                  STATUS_COLORS[task.status]
                )}
              />
              {STATUS_LABELS[task.status]}
            </Badge>
          </div>

          <div>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full mr-1",
                  PRIORITY_COLORS[task.priority]
                )}
              />
              {PRIORITY_LABELS[task.priority]}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground">
            {task.dueDate
              ? format(parseISO(task.dueDate), "MMM d, yyyy")
              : "-"}
          </div>

          <div className="flex items-center gap-1.5">
            {task.assignee ? (
              <>
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium flex-shrink-0">
                  {task.assignee.name?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {task.assignee.name || task.assignee.email}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No tasks match the current filters.
        </div>
      )}
    </div>
  );
}
