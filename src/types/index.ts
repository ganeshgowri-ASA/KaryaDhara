// Re-export types from stores
export type { TaskPriority, TaskStatus, Task, TaskLabel, Comment } from "@/stores/task-store";
export type { ViewMode, CalendarMode, DateRangeFilter } from "@/stores/view-store";

// Shared constants
import type { TaskStatus, TaskPriority } from "@/stores/task-store";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  CANCELLED: "Cancelled",
  ARCHIVED: "Archived",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  P1: "Urgent",
  P2: "High",
  P3: "Medium",
  P4: "Low",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  P1: "bg-red-500",
  P2: "bg-orange-500",
  P3: "bg-yellow-500",
  P4: "bg-blue-400",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-slate-400",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-purple-500",
  DONE: "bg-green-500",
  CANCELLED: "bg-gray-400",
  ARCHIVED: "bg-gray-300",
};

export const KANBAN_COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
