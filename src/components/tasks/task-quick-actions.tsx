"use client";

import React from "react";
import { MoreHorizontal, Check, Circle, Clock, Eye, Ban, Zap, ArrowUp, ArrowDown, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus, TaskPriority } from "@/types";

interface TaskQuickActionsProps {
  task: Task;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onPriorityChange?: (taskId: string, priority: TaskPriority) => void;
  onEdit?: () => void;
}

const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode }[] = [
  { value: "TODO", label: "To Do", icon: <Circle className="h-3.5 w-3.5" /> },
  { value: "IN_PROGRESS", label: "In Progress", icon: <Clock className="h-3.5 w-3.5 text-blue-500" /> },
  { value: "IN_REVIEW", label: "In Review", icon: <Eye className="h-3.5 w-3.5 text-purple-500" /> },
  { value: "DONE", label: "Done", icon: <Check className="h-3.5 w-3.5 text-green-500" /> },
  { value: "CANCELLED", label: "Cancelled", icon: <Ban className="h-3.5 w-3.5 text-gray-400" /> },
];

const priorityOptions: { value: TaskPriority; label: string; icon: React.ReactNode }[] = [
  { value: "P1", label: "Urgent", icon: <Zap className="h-3.5 w-3.5 text-red-500" /> },
  { value: "P2", label: "High", icon: <ArrowUp className="h-3.5 w-3.5 text-orange-500" /> },
  { value: "P3", label: "Medium", icon: <ArrowDown className="h-3.5 w-3.5 text-yellow-500" /> },
  { value: "P4", label: "Low", icon: <ArrowDown className="h-3.5 w-3.5 text-blue-400" /> },
];

export function TaskQuickActions({
  task,
  onStatusChange,
  onPriorityChange,
  onEdit,
}: TaskQuickActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-3.5 w-3.5 mr-2" />
            Edit Title
          </DropdownMenuItem>
        )}

        {task.status !== "DONE" && onStatusChange && (
          <DropdownMenuItem onClick={() => onStatusChange(task.id, "DONE")}>
            <Check className="h-3.5 w-3.5 mr-2 text-green-500" />
            Mark Done
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Circle className="h-3.5 w-3.5 mr-2" />
            Status
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {statusOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                disabled={task.status === opt.value}
                onClick={() => onStatusChange?.(task.id, opt.value)}
              >
                {opt.icon}
                <span className="ml-2">{opt.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Zap className="h-3.5 w-3.5 mr-2" />
            Priority
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {priorityOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                disabled={task.priority === opt.value}
                onClick={() => onPriorityChange?.(task.id, opt.value)}
              >
                {opt.icon}
                <span className="ml-2">{opt.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
