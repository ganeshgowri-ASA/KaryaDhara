"use client";

import { create } from "zustand";

export type ViewMode = "list" | "kanban" | "calendar" | "timeline";
export type CalendarMode = "month" | "week" | "day";
export type DateFilter = "all" | "today" | "this_week" | "this_month" | "overdue" | "no_date";

interface ViewStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
  dateFilter: DateFilter;
  setDateFilter: (filter: DateFilter) => void;
}

export const useViewStore = create<ViewStore>((set) => ({
  viewMode: "list",
  setViewMode: (viewMode) => set({ viewMode }),
  calendarMode: "month",
  setCalendarMode: (calendarMode) => set({ calendarMode }),
  selectedDate: new Date().toISOString(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  statusFilter: "all",
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  priorityFilter: "all",
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
  dateFilter: "all" as DateFilter,
  setDateFilter: (dateFilter) => set({ dateFilter }),
}));
