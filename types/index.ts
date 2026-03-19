export type { Task, TaskStatus, TaskPriority } from "../src/stores/task-store";

export type ViewMode = "list" | "kanban" | "calendar" | "timeline";
export type CalendarMode = "month" | "week" | "day";

export type DateRangeFilter = "all" | "today" | "this_week" | "this_month" | "overdue" | string;

export const KANBAN_COLUMNS = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;

export const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-gray-400",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-yellow-500",
  DONE: "bg-green-500",
  CANCELLED: "bg-red-400",
};

export const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const PRIORITY_COLORS: Record<string, string> = {
  P1: "bg-red-500",
  P2: "bg-orange-500",
  P3: "bg-blue-500",
  P4: "bg-gray-400",
  URGENT: "bg-red-500",
  HIGH: "bg-orange-500",
  MEDIUM: "bg-blue-500",
  LOW: "bg-gray-400",
  NONE: "bg-gray-300",
};

export const PRIORITY_LABELS: Record<string, string> = {
  P1: "P1 Urgent",
  P2: "P2 High",
  P3: "P3 Medium",
  P4: "P4 Low",
  URGENT: "Urgent",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  NONE: "None",
};
