import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Task,
  ViewMode,
  CalendarMode,
  DateRangeFilter,
  TaskStatus,
  TaskPriority,
} from "../types";

// ─── Task Store ────────────────────────────────────────

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  moveTask: (taskId: string, status: TaskStatus, position: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
  moveTask: (taskId, status, position) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId ? { ...t, status, position } : t
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

// ─── View Store (persisted) ────────────────────────────

interface ViewState {
  viewMode: ViewMode;
  calendarMode: CalendarMode;
  dateFilter: DateRangeFilter;
  selectedDate: string;
  searchQuery: string;
  priorityFilter: TaskPriority | "all";
  statusFilter: TaskStatus | "all";
  setViewMode: (mode: ViewMode) => void;
  setCalendarMode: (mode: CalendarMode) => void;
  setDateFilter: (filter: DateRangeFilter) => void;
  setSelectedDate: (date: string) => void;
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: TaskPriority | "all") => void;
  setStatusFilter: (status: TaskStatus | "all") => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      viewMode: "kanban",
      calendarMode: "month",
      dateFilter: "all",
      selectedDate: new Date().toISOString(),
      searchQuery: "",
      priorityFilter: "all",
      statusFilter: "all",
      setViewMode: (viewMode) => set({ viewMode }),
      setCalendarMode: (calendarMode) => set({ calendarMode }),
      setDateFilter: (dateFilter) => set({ dateFilter }),
      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
      setStatusFilter: (statusFilter) => set({ statusFilter }),
    }),
    { name: "karyadhara-view-settings" }
  )
);
