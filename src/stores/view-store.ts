import { create } from "zustand";
import type { ViewMode, CalendarMode, DateRangeFilter } from "@/types";

interface ViewStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  dateFilter: DateRangeFilter;
  setDateFilter: (filter: DateRangeFilter) => void;
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const useViewStore = create<ViewStore>((set) => ({
  viewMode: "list",
  setViewMode: (mode) => set({ viewMode: mode }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  statusFilter: "all",
  setStatusFilter: (status) => set({ statusFilter: status }),
  priorityFilter: "all",
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  dateFilter: "all",
  setDateFilter: (filter) => set({ dateFilter: filter }),
  calendarMode: "month",
  setCalendarMode: (mode) => set({ calendarMode: mode }),
  selectedDate: new Date().toISOString(),
  setSelectedDate: (date) => set({ selectedDate: date }),
}));
