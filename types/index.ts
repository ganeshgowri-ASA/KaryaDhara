export type { User, Workspace, WorkspaceMember, Project, Section, Task, Label, TaskLabel, Comment, ApiKey, Webhook, Timer } from "@prisma/client";
export { Role, TaskStatus, Priority } from "@prisma/client";

export interface CreateTaskInput {
  title: string;
  description?: string;
  projectId?: string;
  sectionId?: string;
  assigneeId?: string;
  priority?: "P1" | "P2" | "P3" | "P4";
  dueDate?: Date;
  labelIds?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";
  isArchived?: boolean;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
}
