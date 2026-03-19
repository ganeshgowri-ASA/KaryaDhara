"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_LABELS,
  type Task,
} from "../../../types";
import { TaskQuickActions } from "./task-quick-actions";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
  onStatusChange?: (taskId: string, status: Task["status"]) => void;
  onPriorityChange?: (taskId: string, priority: Task["priority"]) => void;
  onTitleChange?: (taskId: string, title: string) => void;
  className?: string;
}

export function TaskCard({
  task,
  compact = false,
  onStatusChange,
  onPriorityChange,
  onTitleChange,
  className,
}: TaskCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(task.title);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleTitleSubmit = () => {
    if (editTitle.trim() && editTitle.trim() !== task.title) {
      onTitleChange?.(task.id, editTitle.trim());
    } else {
      setEditTitle(task.title);
    }
    setIsEditing(false);
  };

  React.useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSubmit();
                if (e.key === "Escape") {
                  setEditTitle(task.title);
                  setIsEditing(false);
                }
              }}
              className="w-full bg-transparent text-sm font-medium outline-none ring-1 ring-ring rounded px-1"
            />
          ) : (
            <p
              className={cn(
                "text-sm font-medium truncate cursor-pointer hover:text-primary",
                task.status === "DONE" && "line-through text-muted-foreground"
              )}
              onDoubleClick={() => setIsEditing(true)}
            >
              {task.title}
            </p>
          )}

          {!compact && task.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        <TaskQuickActions
          task={task}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
          onEdit={() => setIsEditing(true)}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            "inline-block h-2 w-2 rounded-full",
            PRIORITY_COLORS[task.priority]
          )}
          title={PRIORITY_LABELS[task.priority]}
        />
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {PRIORITY_LABELS[task.priority]}
        </Badge>

        {!compact && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {STATUS_LABELS[task.status]}
          </Badge>
        )}

        {task.dueDate && (
          <span className="text-[10px] text-muted-foreground">
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}

        {task.labels?.map((tl) => (
          <Badge
            key={tl.label.id}
            className="text-[10px] px-1.5 py-0"
            style={{ backgroundColor: tl.label.color, color: "#fff" }}
          >
            {tl.label.name}
          </Badge>
        ))}
      </div>

      {!compact && task.assignee && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium">
            {task.assignee.name?.[0]?.toUpperCase() || "?"}
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {task.assignee.name || "Unassigned"}
          </span>
        </div>
      )}

      {!compact && task.subtasks && task.subtasks.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          {task.subtasks.filter((s) => s.status === "DONE").length}/
          {task.subtasks.length} subtasks done
        </div>
      )}
    </div>
  );
}
