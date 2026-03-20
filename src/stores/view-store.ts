import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TaskStatus, TaskPriority } from "./task-store";

export type ViewMode = "list" | "calendar" | "timeline" | "kanban";
export type CalendarMode = "month" | "week" | "day";
export type DateRangeFilter = "all" | "today" | "this_week" | "this_month" | "overdue";

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
