"use client";

import { create } from "zustand";

export interface SearchFilters {
  status?: string;
  priority?: string;
  dueAfter?: string;
  dueBefore?: string;
}

export interface SearchResults {
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    project?: { name: string } | null;
  }>;
  projects: Array<{
    id: string;
    name: string;
    color: string;
    _count?: { tasks: number };
  }>;
  labels: Array<{
    id: string;
    name: string;
    color: string;
    _count?: { tasks: number };
  }>;
  counts: { tasks: number; projects: number; labels: number };
}

interface SearchStore {
  query: string;
  results: SearchResults | null;
  filters: SearchFilters;
  loading: boolean;
  isSearching: boolean;
  isOpen: boolean;

  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  clearSearch: () => void;
  setOpen: (open: boolean) => void;
  search: (query?: string) => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: "",
  results: null,
  filters: {},
  loading: false,
  isSearching: false,
  isOpen: false,

  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  clearSearch: () => set({ query: "", results: null, filters: {} }),
  setOpen: (isOpen) => set({ isOpen }),
  clearResults: () => set({ results: null, query: "" }),

  search: async (queryArg?: string) => {
    const { filters } = get();
    const query = queryArg !== undefined ? queryArg : get().query;
    if (queryArg !== undefined) set({ query: queryArg });
    if (!query.trim()) {
      set({ results: null, loading: false });
      return;
    }
    set({ loading: true, isSearching: true });
    try {
      const params = new URLSearchParams({ q: query });
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.dueAfter) params.set("dueAfter", filters.dueAfter);
      if (filters.dueBefore) params.set("dueBefore", filters.dueBefore);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      set({
        results: json.data
          ? {
              tasks: json.data.filter((r: { type: string }) => r.type === "task"),
              projects: json.data.filter((r: { type: string }) => r.type === "project"),
              labels: json.data.filter((r: { type: string }) => r.type === "label"),
              counts: {
                tasks: json.data.filter((r: { type: string }) => r.type === "task").length,
                projects: json.data.filter((r: { type: string }) => r.type === "project").length,
                labels: json.data.filter((r: { type: string }) => r.type === "label").length,
              },
            }
          : json,
      });
    } catch {
      set({ results: null });
    } finally {
      set({ loading: false, isSearching: false });
    }
  },
}));
