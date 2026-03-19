import { create } from "zustand";

export interface SearchResult {
  id: string;
  type: "task" | "project" | "label" | "comment";
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  projectName?: string;
  labels?: { name: string; color: string }[];
  matchedField: string;
  score: number;
}

export interface AdvancedFilters {
  dateRange?: { from: string; to: string };
  priority?: string[];
  status?: string[];
  assigneeId?: string;
  projectId?: string;
  labelIds?: string[];
  hasRecurrence?: boolean;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  advancedFilters: AdvancedFilters;
  isSearching: boolean;
  recentSearches: string[];

  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setAdvancedFilters: (filters: Partial<AdvancedFilters>) => void;
  clearSearch: () => void;
  setSearching: (searching: boolean) => void;

  performSearch: (query: string) => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: "",
  results: [],
  advancedFilters: {},
  isSearching: false,
  recentSearches: [],

  setQuery: (query) => set({ query }),
  setResults: (results) => set({ results }),
  setAdvancedFilters: (filters) =>
    set((s) => ({
      advancedFilters: { ...s.advancedFilters, ...filters },
    })),
  clearSearch: () =>
    set({ query: "", results: [], advancedFilters: {} }),
  setSearching: (isSearching) => set({ isSearching }),

  performSearch: async (query) => {
    if (!query.trim()) {
      set({ results: [], isSearching: false });
      return;
    }

    set({ isSearching: true, query });
    try {
      const { advancedFilters } = get();
      const params = new URLSearchParams({ q: query });
      if (advancedFilters.priority?.length)
        params.set("priority", advancedFilters.priority.join(","));
      if (advancedFilters.status?.length)
        params.set("status", advancedFilters.status.join(","));
      if (advancedFilters.projectId)
        params.set("projectId", advancedFilters.projectId);
      if (advancedFilters.assigneeId)
        params.set("assigneeId", advancedFilters.assigneeId);
      if (advancedFilters.labelIds?.length)
        params.set("labelIds", advancedFilters.labelIds.join(","));
      if (advancedFilters.dateRange) {
        params.set("dateFrom", advancedFilters.dateRange.from);
        params.set("dateTo", advancedFilters.dateRange.to);
      }

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();

      set((s) => ({
        results: json.data || [],
        isSearching: false,
        recentSearches: [
          query,
          ...s.recentSearches.filter((q) => q !== query),
        ].slice(0, 10),
      }));
    } catch {
      set({ isSearching: false });
    }
  },
}));
