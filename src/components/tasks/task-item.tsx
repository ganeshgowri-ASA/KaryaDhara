"use client";

import { useState, useCallback } from "react";
import { format, isPast, isToday } from "date-fns";
import {
  GripVertical,
  Calendar,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Trash2,
  Pencil,
  Sun,
  ListTree,
  Link2,
  Timer,
  Repeat,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PriorityDot } from "./priority-badge";
import { StatusIcon } from "./status-badge";
import { TaskQuickAdd } from "./task-quick-add";
import { useTaskStore, type Task } from "@/stores/task-store";
import type { TaskStatus } from "@prisma/client";
import { useUIStore } from "@/stores/ui-store";
import { useTimerStore } from "@/stores/timer-store";
import { Progress } from "@/components/ui/progress";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TaskItemProps {
  task: Task;
  depth?: number;
}

export function TaskItem({ task, depth = 0 }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const { updateTaskApi, deleteTask, setSelectedTaskId } = useTaskStore();
  const { toggleMyDayTask, myDayTaskIds } = useTaskStore();
  const { setTaskDetailOpen } = useUIStore();
  const { startPomodoro } = useTimerStore();

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

  const handleStatusToggle = useCallback(() => {
    const newStatus: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    updateTaskApi(task.id, { status: newStatus });
  }, [task.id, task.status, updateTaskApi]);

  const handleSaveTitle = useCallback(() => {
    if (editTitle.trim() && editTitle !== task.title) {
      updateTaskApi(task.id, { title: editTitle.trim() });
    }
    setIsEditing(false);
  }, [editTitle, task.id, task.title, updateTaskApi]);

  const handleDelete = useCallback(() => {
    deleteTask(task.id);
  }, [task.id, deleteTask]);

  const handleOpenDetail = useCallback(() => {
    setSelectedTaskId(task.id);
    setTaskDetailOpen(true);
  }, [task.id, setSelectedTaskId, setTaskDetailOpen]);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const subtaskCount = task._count?.subtasks || task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((s) => s.status === "DONE").length || 0;
  const subtaskProgress =
    subtaskCount > 0 ? (completedSubtasks / subtaskCount) * 100 : 0;

  const isOverdue =
    task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "DONE";
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const isInMyDay = myDayTaskIds.includes(task.id);

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-accent/50",
          isDragging && "opacity-50",
          task.status === "DONE" && "opacity-60"
        )}
        style={{ paddingLeft: `${depth * 24 + 8}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Expand/collapse subtasks */}
        {hasSubtasks ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Checkbox */}
        <Checkbox
          checked={task.status === "DONE"}
          onCheckedChange={handleStatusToggle}
          className="shrink-0"
        />

        {/* Priority dot */}
        <PriorityDot priority={task.priority} />

        {/* Title */}
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
              if (e.key === "Escape") {
                setEditTitle(task.title);
                setIsEditing(false);
              }
            }}
            className="h-6 text-sm border-none shadow-none focus-visible:ring-1 px-1"
            autoFocus
          />
        ) : (
          <button
            className={cn(
              "flex-1 text-left text-sm truncate",
              task.status === "DONE" && "line-through text-muted-foreground"
            )}
            onClick={handleOpenDetail}
            onDoubleClick={() => setIsEditing(true)}
          >
            {task.title}
          </button>
        )}

        {/* Labels */}
        {task.labels?.map((tl) => (
          <Badge
            key={tl.label.id}
            variant="outline"
            className="h-5 text-[10px] px-1.5"
            style={{
              borderColor: tl.label.color,
              color: tl.label.color,
            }}
          >
            {tl.label.name}
          </Badge>
        ))}

        {/* Subtask progress */}
        {subtaskCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ListTree className="h-3 w-3" />
            <span>
              {completedSubtasks}/{subtaskCount}
            </span>
            <Progress value={subtaskProgress} className="h-1 w-12" />
          </div>
        )}

        {/* Recurrence indicator */}
        {task.recurrence && (
          <Repeat className="h-3 w-3 text-muted-foreground" />
        )}

        {/* Dependencies indicator */}
        {((task.blockedBy && task.blockedBy.length > 0) ||
          (task.blocks && task.blocks.length > 0)) && (
          <Link2 className="h-3 w-3 text-muted-foreground" />
        )}

        {/* Comments count */}
        {(task._count?.comments || 0) > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            {task._count?.comments}
          </span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs whitespace-nowrap",
              isOverdue
                ? "text-red-500"
                : isDueToday
                  ? "text-orange-500"
                  : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}

        {/* Status */}
        <StatusIcon status={task.status} className="h-3.5 w-3.5 shrink-0" />

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
              title="Edit (e)"
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toggleMyDayTask(task.id)}
              title="Add to My Day"
            >
              <Sun
                className={cn(
                  "h-3 w-3",
                  isInMyDay && "text-yellow-500 fill-yellow-500"
                )}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => startPomodoro(task.id)}
              title="Start Pomodoro"
            >
              <Timer className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={handleDelete}
              title="Delete (d)"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Subtasks */}
      {expanded && hasSubtasks && (
        <div>
          {task.subtasks!.map((subtask) => (
            <TaskItem key={subtask.id} task={subtask} depth={depth + 1} />
          ))}
          <TaskQuickAdd parentId={task.id} />
        </div>
      )}
    </div>
  );
}
