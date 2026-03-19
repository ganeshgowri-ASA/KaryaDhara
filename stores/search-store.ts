import { create } from "zustand";
import type { Task } from "./task-store";
import type { Label } from "./label-store";

interface Project {
  id: string;
  name: string;
  description?: string | null;
  color: string;
  status: string;
  _count?: { tasks: number };
}

interface SearchResults {
  tasks: Task[];
  projects: Project[];
  labels: Label[];
  counts: { tasks: number; projects: number; labels: number };
}

interface SearchFilters {
  status?: string;
  priority?: string;
  projectId?: string;
  labelId?: string;
  dueBefore?: string;
  dueAfter?: string;
  assigneeId?: string;
}

interface SearchStore {
  query: string;
  results: SearchResults | null;
  filters: SearchFilters;
  loading: boolean;
  error: string | null;

  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  clearFilters: () => void;
  clearSearch: () => void;

  search: (q?: string) => Promise<void>;
}

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: "",
  results: null,
  filters: {},
  loading: false,
  error: null,

  setQuery: (query) => set({ query }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  clearSearch: () => set({ query: "", results: null, filters: {} }),

  search: async (q) => {
    const query = q || get().query;
    if (!query.trim()) {
      set({ results: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams({ q: query });
      Object.entries(filters).forEach(([k, v]) => {
        if (v) params.set(k, v);
      });

      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const results = await res.json();
      set({ results, query });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
