import { create } from "zustand";

export interface Label {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  createdAt: string;
  _count?: { tasks: number };
}

interface LabelState {
  labels: Label[];
  isLoading: boolean;
  error: string | null;

  setLabels: (labels: Label[]) => void;
  addLabel: (label: Label) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  removeLabel: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchLabels: (workspaceId?: string) => Promise<void>;
  createLabel: (data: {
    name: string;
    color: string;
    workspaceId: string;
  }) => Promise<Label | null>;
  editLabel: (
    id: string,
    data: Partial<{ name: string; color: string }>
  ) => Promise<Label | null>;
  deleteLabel: (id: string) => Promise<boolean>;
}

export const useLabelStore = create<LabelState>((set, get) => ({
  labels: [],
  isLoading: false,
  error: null,

  setLabels: (labels) => set({ labels }),
  addLabel: (label) => set((s) => ({ labels: [...s.labels, label] })),
  updateLabel: (id, updates) =>
    set((s) => ({
      labels: s.labels.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
  removeLabel: (id) =>
    set((s) => ({ labels: s.labels.filter((l) => l.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchLabels: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const params = workspaceId ? `?workspaceId=${workspaceId}` : "";
      const res = await fetch(`/api/labels${params}`);
      if (!res.ok) throw new Error("Failed to fetch labels");
      const json = await res.json();
      set({ labels: json.data || json, isLoading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      });
    }
  },

  createLabel: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create label");
      const label = await res.json();
      get().addLabel(label);
      set({ isLoading: false });
      return label;
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Unknown error",
        isLoading: false,
      });
      return null;
    }
  },

  editLabel: async (id, data) => {
    try {
      const res = await fetch(`/api/labels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update label");
      const updated = await res.json();
      get().updateLabel(id, updated);
      return updated;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error" });
      return null;
    }
  },

  deleteLabel: async (id) => {
    try {
      const res = await fetch(`/api/labels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete label");
      get().removeLabel(id);
      return true;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unknown error" });
      return false;
    }
  },
}));
