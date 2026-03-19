import { create } from "zustand";
import type { Task, TaskStatus, TaskPriority } from "@/types";

export type { Task, TaskStatus, TaskPriority };

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string | null; image: string | null };
}

interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: string;
  labelId?: string;
  assigneeId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

interface TaskStore {
  tasks: Task[];
  selectedTaskId: string | null;
  filters: TaskFilters;
  sortBy: string;
  sortOrder: "asc" | "desc";
  isLoading: boolean;
  myDayTaskIds: string[];

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setSelectedTaskId: (id: string | null) => void;
  setFilters: (filters: TaskFilters) => void;
  setSortBy: (sortBy: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;
  setIsLoading: (loading: boolean) => void;
  toggleMyDayTask: (taskId: string) => void;
  setMyDayTaskIds: (ids: string[]) => void;

  fetchTasks: (projectId?: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTaskApi: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  filters: {},
  sortBy: "position",
  sortOrder: "asc",
  isLoading: false,
  myDayTaskIds: [],

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  setFilters: (filters) => set({ filters }),
  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (order) => set({ sortOrder: order }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  toggleMyDayTask: (taskId) =>
    set((s) => ({
      myDayTaskIds: s.myDayTaskIds.includes(taskId)
        ? s.myDayTaskIds.filter((id) => id !== taskId)
        : [...s.myDayTaskIds, taskId],
    })),
  setMyDayTaskIds: (ids) => set({ myDayTaskIds: ids }),

  fetchTasks: async (projectId?: string) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams();
      if (projectId) params.set("projectId", projectId);
      const { filters } = get();
      if (filters.status?.length)
        params.set("status", Array.isArray(filters.status) ? filters.status.join(",") : filters.status);
      if (filters.priority?.length)
        params.set("priority", Array.isArray(filters.priority) ? filters.priority.join(",") : filters.priority);
      if (filters.search) params.set("search", filters.search);
      if (filters.labelId) params.set("labelId", filters.labelId);

      const res = await fetch(`/api/tasks?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        set({ tasks: data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  createTask: async (data) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const task = await res.json();
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return task;
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  updateTaskApi: async (id, data) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const task = await res.json();
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...task } : t)),
        }));
      }
    } catch {
      /* ignore */
    }
  },

  deleteTask: async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
      }
    } catch {
      /* ignore */
    }
  },
}));
