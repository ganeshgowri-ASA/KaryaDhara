// Global type definitions for KaryaDhara
import { Role } from "@prisma/client";
import "next-auth";

export type { Task, TaskStatus, TaskPriority } from "@/stores/task-store";
export type { ViewMode, CalendarMode, DateFilter } from "@/stores/view-store";
export type { DateFilter as DateRangeFilter } from "@/stores/view-store";

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

export const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-gray-500",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-yellow-500",
  DONE: "bg-green-500",
  CANCELLED: "bg-red-500",
  ARCHIVED: "bg-gray-400",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  P1: "bg-red-500",
  P2: "bg-orange-500",
  P3: "bg-blue-500",
  P4: "bg-gray-400",
};

export const KANBAN_COLUMNS: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

declare module "next-auth" {
  interface User {
    id: string;
    role: Role;
    timezone: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    timezone: string;
  }
}
