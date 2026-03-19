"use client";

import { create } from "zustand";
import type { ViewMode, CalendarMode } from "../types";

interface ViewStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  calendarMode: CalendarMode;
  setCalendarMode: (mode: CalendarMode) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
  groupBy: string;
  setGroupBy: (group: string) => void;
  dateFilter: string;
  setDateFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  priorityFilter: string;
  setPriorityFilter: (priority: string) => void;
}

export const useViewStore = create<ViewStore>((set) => ({
  viewMode: "list",
  setViewMode: (viewMode) => set({ viewMode }),
  calendarMode: "month",
  setCalendarMode: (calendarMode) => set({ calendarMode }),
  selectedDate: new Date().toISOString(),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  sortBy: "createdAt",
  setSortBy: (sortBy) => set({ sortBy }),
  sortOrder: "desc",
  setSortOrder: (sortOrder) => set({ sortOrder }),
  groupBy: "none",
  setGroupBy: (groupBy) => set({ groupBy }),
  dateFilter: "all",
  setDateFilter: (dateFilter) => set({ dateFilter }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  statusFilter: "all",
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  priorityFilter: "all",
  setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
}));
