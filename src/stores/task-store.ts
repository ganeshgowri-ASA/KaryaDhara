import { create } from "zustand";

export type TaskPriority = "P1" | "P2" | "P3" | "P4";
export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "DONE"
  | "CANCELLED"
  | "ARCHIVED";

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface RecurrencePattern {
  type: "daily" | "weekly" | "monthly" | "custom";
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  cron?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  position: number;
  dueDate?: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  recurrence?: RecurrencePattern | null;
  projectId?: string | null;
  sectionId?: string | null;
  assigneeId?: string | null;
  creatorId: string;
  parentId?: string | null;
  isArchived: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  labels?: TaskLabel[];
  subtasks?: Task[];
  _count?: { subtasks: number; comments: number };
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: string;
  assigneeId?: string;
  labelIds?: string[];
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  hasRecurrence?: boolean;
}

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setSelectedTask: (task: Task | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Partial<TaskState["pagination"]>) => void;

  fetchTasks: () => Promise<void>;
  createTask: (
    data: Partial<Task> & { title: string }
  ) => Promise<Task | null>;
  editTask: (id: string, data: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  generateSubtasks: (taskId: string) => Promise<Task[]>;
  suggestPriority: (taskId: string) => Promise<TaskPriority | null>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  filters: {},
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      selectedTask:
        s.selectedTask?.id === id
          ? { ...s.selectedTask, ...updates }
          : s.selectedTask,
    })),
  removeTask: (id) =>
    set((s) => ({
      tasks: s.tasks.filter((t) => t.id !== id),
      selectedTask: s.selectedTask?.id === id ? null : s.selectedTask,
    })),
  setSelectedTask: (task) => set({ selectedTask: task }),
  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) =>
    set((s) => ({ pagination: { ...s.pagination, ...pagination } })),

  fetchTasks: async () => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      if (filters.status?.length)
        params.set("status", filters.status.join(","));
      if (filters.priority?.length)
        params.set("priority", filters.priority.join(","));
      if (filters.projectId) params.set("projectId", filters.projectId);
      if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
      if (filters.labelIds?.length)
        params.set("labelIds", filters.labelIds.join(","));
      if (filters.search) params.set("search", filters.search);
      if (filters.dueDateFrom) params.set("dueDateFrom", filters.dueDateFrom);
      if (filters.dueDateTo) params.set("dueDateTo", filters.dueDateTo);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const json = await res.json();
      set({
        tasks: json.data,
        pagination: json.pagination,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  createTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const task = await res.json();
      set((s) => ({ tasks: [task, ...s.tasks], isLoading: false }));
      return task;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      });
      return null;
    }
  },

  editTask: async (id, data) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updated = await res.json();
      get().updateTask(id, updated);
      return updated;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error" });
      return null;
    }
  },

  deleteTask: async (id) => {
    set({ error: null });
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      get().removeTask(id);
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error" });
      return false;
    }
  },

  generateSubtasks: async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subtasks" }),
      });
      if (!res.ok) throw new Error("Failed to generate subtasks");
      const json = await res.json();
      return json.subtasks || [];
    } catch {
      return [];
    }
  },

  suggestPriority: async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "priority" }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.priority || null;
    } catch {
      return null;
    }
  },
}));
