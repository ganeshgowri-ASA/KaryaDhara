// Global type definitions for KaryaDhara
import { Role, TaskStatus as PrismaTaskStatus, TaskPriority as PrismaTaskPriority } from "@prisma/client";
import "next-auth";

export type TaskStatus = PrismaTaskStatus;
export type TaskPriority = PrismaTaskPriority;
export type { Task } from "../src/stores/task-store";
export type { ViewMode, CalendarMode, DateFilter } from "../src/stores/view-store";
export type { DateFilter as DateRangeFilter } from "../src/stores/view-store";

export const STATUS_LABELS: Record<string, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  TODO: "bg-gray-400",
  IN_PROGRESS: "bg-blue-500",
  IN_REVIEW: "bg-yellow-500",
  DONE: "bg-green-500",
  CANCELLED: "bg-red-400",
};

export const PRIORITY_LABELS: Record<string, string> = {
  P1: "P1 Urgent",
  P2: "P2 High",
  P3: "P3 Medium",
  P4: "P4 Low",
};

export const KANBAN_COLUMNS: string[] = [
  "TODO",
  "IN_PROGRESS",
  "IN_REVIEW",
  "DONE",
];

export const PRIORITY_COLORS: Record<string, string> = {
  P1: "bg-red-500",
  P2: "bg-orange-500",
  P3: "bg-blue-500",
  P4: "bg-gray-400",
};

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
