import { create } from "zustand";
import type { Task, TaskLabelEntry as TaskLabel } from "../types";

export type { Task };
export type { TaskLabel };

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface TaskFilters {
  status?: string;
  priority?: string;
  projectId?: string;
  labelId?: string;
  dueBefore?: string;
  dueAfter?: string;
  assigneeId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface TaskStore {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination | null;
  filters: TaskFilters;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setSelectedTask: (task: Task | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (pagination: Pagination) => void;
  setFilters: (filters: TaskFilters) => void;
  clearFilters: () => void;

  fetchTasks: (page?: number) => Promise<void>;
  createTask: (data: Partial<Task> & { labelIds?: string[] }) => Promise<Task | null>;
  patchTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  pagination: null,
  filters: {},

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
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPagination: (pagination) => set({ pagination }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),

  fetchTasks: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams({ page: String(page) });
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });

      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const json = await res.json();
      set({ tasks: json.data, pagination: json.pagination });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      const task = await res.json();
      set((s) => ({ tasks: [task, ...s.tasks] }));
      return task;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  patchTask: async (id, data) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const task = await res.json();
      get().updateTask(id, task);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteTask: async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      get().removeTask(id);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
