// KaryaDhara — Shared Types

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED" | "ARCHIVED";
export type TaskPriority = "P1" | "P2" | "P3" | "P4";
export type ViewMode = "list" | "calendar" | "timeline" | "kanban";
export type CalendarMode = "month" | "week" | "day";
export type DateRangeFilter = "all" | "today" | "this_week" | "this_month" | "overdue";

export interface TaskUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export interface TaskLabelEntry {
  labelId: string;
  label: {
    id: string;
    name: string;
    color: string;
  };
}

export interface TaskDependency {
  id: string;
  blockingId: string;
  blockedId: string;
  blocking: { id: string; title: string };
  blocked: { id: string; title: string };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  startDate: string | null;
  completedAt: string | null;
  projectId: string | null;
  sectionId: string | null;
  assigneeId: string | null;
  creatorId: string;
  parentId: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  assignee: TaskUser | null;
  creator: TaskUser;
  labels: TaskLabelEntry[];
  subtasks: Task[];
  blockedBy: TaskDependency[];
  blocks: TaskDependency[];
  section: { id: string; name: string; color: string | null } | null;
  project: { id: string; name: string; color: string } | null;
}

export interface Section {
  id: string;
  name: string;
  position: number;
  color: string | null;
  projectId: string;
}

export interface KanbanColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

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

// ─── S2.3 Auth Type Augmentation ──────────────────────
import { Role } from "@prisma/client";
import "next-auth";

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
