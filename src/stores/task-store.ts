"use client";

import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  position: number;
  dueDate?: string | null;
  startDate?: string | null;
  completedAt?: string | null;
  recurrence?: RecurrenceData | null;
  projectId?: string | null;
  sectionId?: string | null;
  assigneeId?: string | null;
  creatorId: string;
  parentId?: string | null;
  isArchived: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  subtasks?: Task[];
  labels?: { label: { id: string; name: string; color: string } }[];
  project?: { id: string; name: string; color: string } | null;
  assignee?: { id: string; name: string | null; email?: string | null; image: string | null } | null;
  creator?: { id: string; name: string | null; email?: string | null; image: string | null } | null;
  section?: { id: string; name: string } | null;
  _count?: { subtasks?: number; comments?: number };
  blockedBy?: Task[];
  blocks?: Task[];
  comments?: { id: string; content: string; userId: string; isEdited?: boolean; createdAt: string; user?: { id: string; name: string | null; image: string | null } }[];
}

interface RecurrenceData {
  type: string;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: string;
  skipDates?: string[];
}

interface TaskFilters {
  status?: string[];
  priority?: string[];
  projectId?: string;
  assigneeId?: string;
  labelId?: string;
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  hasRecurrence?: boolean;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TaskStore {
  tasks: Task[];
  selectedTask: Task | null;
  filters: TaskFilters;
  pagination: Pagination;
  isLoading: boolean;
  error: string | null;

  setTasks: (tasks: Task[], pagination: Pagination) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  selectedTaskId: string | null;
  setSelectedTask: (task: Task | null) => void;
  setSelectedTaskId: (id: string | null) => void;
  setFilters: (filters: TaskFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  myDayTaskIds: string[];
  toggleMyDayTask: (taskId: string) => void;

  fetchTasks: (projectId?: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task | null>;
  updateTaskApi: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedTask: null,
  selectedTaskId: null,
  filters: {},
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  isLoading: false,
  error: null,

  setTasks: (tasks, pagination) => set({ tasks, pagination }),
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
  setSelectedTask: (task) => set({ selectedTask: task, selectedTaskId: task?.id ?? null }),
  setSelectedTaskId: (id) => {
    const task = id ? get().tasks.find((t) => t.id === id) ?? null : null;
    set({ selectedTaskId: id, selectedTask: task });
  },
  setFilters: (filters) => set({ filters }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  myDayTaskIds: [],
  toggleMyDayTask: (taskId) =>
    set((s) => ({
      myDayTaskIds: s.myDayTaskIds.includes(taskId)
        ? s.myDayTaskIds.filter((id) => id !== taskId)
        : [...s.myDayTaskIds, taskId],
    })),

  fetchTasks: async (projectId?: string) => {
    const { filters, pagination } = get();
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      params.set("page", String(pagination.page));
      params.set("limit", String(pagination.limit));
      if (projectId) params.set("projectId", projectId);
      if (filters.status?.length) params.set("status", filters.status.join(","));
      if (filters.priority?.length) params.set("priority", filters.priority.join(","));
      if (filters.projectId) params.set("projectId", filters.projectId);
      if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
      if (filters.labelId) params.set("labelId", filters.labelId);
      if (filters.search) params.set("search", filters.search);
      if (filters.dueDateFrom) params.set("dueDateFrom", filters.dueDateFrom);
      if (filters.dueDateTo) params.set("dueDateTo", filters.dueDateTo);

      const res = await fetch(`/api/tasks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const json = await res.json();
      set({ tasks: json.data, pagination: json.pagination });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
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
      set((s) => ({ tasks: [task, ...s.tasks] }));
      return task;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTaskApi: async (id, updates) => {
    get().updateTask(id, updates);
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update task");
      const json = await res.json();
      get().updateTask(id, json.task ?? json);
    } catch (e) {
      set({ error: (e as Error).message });
      get().fetchTasks();
    }
  },

  deleteTask: async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      get().removeTask(id);
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
