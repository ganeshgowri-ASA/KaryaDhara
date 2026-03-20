"use client";

import { create } from "zustand";

export interface SearchResult {
  id: string;
  type: "task" | "project" | "label";
  title: string;
  description?: string | null;
  status?: string;
  priority?: string;
  color?: string;
  projectName?: string | null;
}

interface SearchStore {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  isOpen: boolean;

  setQuery: (query: string) => void;
  setOpen: (open: boolean) => void;
  search: (query: string) => Promise<void>;
  clearResults: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  query: "",
  results: [],
  isSearching: false,
  isOpen: false,

  setQuery: (query) => set({ query }),
  setOpen: (isOpen) => set({ isOpen }),
  clearResults: () => set({ results: [], query: "" }),

  search: async (query) => {
    if (!query.trim()) {
      set({ results: [], isSearching: false });
      return;
    }
    set({ isSearching: true, query });
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      set({ results: json.data });
    } catch {
      set({ results: [] });
    } finally {
      set({ isSearching: false });
    }
  },
}));
