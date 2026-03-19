"use client";

import { format, isPast, isToday } from "date-fns";
import { Calendar, MessageSquare, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriorityDot } from "@/components/tasks/priority-badge";
import type { Task } from "@/stores/task-store";
import { useTaskStore } from "@/stores/task-store";
import { useUIStore } from "@/stores/ui-store";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanCardProps {
  task: Task;
  isOverlay?: boolean;
}

export function KanbanCard({ task, isOverlay }: KanbanCardProps) {
  const { setSelectedTaskId } = useTaskStore();
  const { setTaskDetailOpen } = useUIStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    setSelectedTaskId(task.id);
    setTaskDetailOpen(true);
  };

  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "DONE";
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const subtaskCount = task._count?.subtasks || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        "rounded-md border bg-card p-3 shadow-sm cursor-grab hover:shadow-md transition-shadow",
        isDragging && "opacity-50",
        isOverlay && "shadow-lg rotate-2"
      )}
    >
      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {task.labels.map((tl) => (
            <span
              key={tl.label.id}
              className="inline-block h-1.5 w-8 rounded-full"
              style={{ backgroundColor: tl.label.color }}
            />
          ))}
        </div>
      )}

      {/* Title */}
      <div className="flex items-start gap-2 mb-2">
        <PriorityDot priority={task.priority} />
        <p
          className={cn(
            "text-sm font-medium leading-tight flex-1",
            task.status === "DONE" && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {task.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1",
              isOverdue ? "text-red-500" : isDueToday ? "text-orange-500" : ""
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
        {subtaskCount > 0 && (
          <span className="flex items-center gap-1">
            <ListTree className="h-3 w-3" />
            {subtaskCount}
          </span>
        )}
        {(task._count?.comments || 0) > 0 && (
          <span className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {task._count?.comments}
          </span>
        )}
        {task.assignee && (
          <span className="ml-auto text-xs">
            {task.assignee.name?.split(" ")[0]}
          </span>
        )}
      </div>
    </div>
  );
}
