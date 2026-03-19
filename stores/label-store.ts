import { create } from "zustand";

export interface Label {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
  createdAt: string;
  _count?: { tasks: number };
}

interface LabelStore {
  labels: Label[];
  loading: boolean;
  error: string | null;

  setLabels: (labels: Label[]) => void;
  addLabel: (label: Label) => void;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  removeLabel: (id: string) => void;

  fetchLabels: (workspaceId?: string) => Promise<void>;
  createLabel: (data: { name: string; color: string; workspaceId: string }) => Promise<Label | null>;
  patchLabel: (id: string, data: { name?: string; color?: string }) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
}

export const useLabelStore = create<LabelStore>((set, get) => ({
  labels: [],
  loading: false,
  error: null,

  setLabels: (labels) => set({ labels }),
  addLabel: (label) => set((s) => ({ labels: [...s.labels, label] })),
  updateLabel: (id, updates) =>
    set((s) => ({
      labels: s.labels.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),
  removeLabel: (id) =>
    set((s) => ({ labels: s.labels.filter((l) => l.id !== id) })),

  fetchLabels: async (workspaceId) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (workspaceId) params.set("workspaceId", workspaceId);
      const res = await fetch(`/api/labels?${params}`);
      if (!res.ok) throw new Error("Failed to fetch labels");
      const json = await res.json();
      set({ labels: json.data });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  createLabel: async (data) => {
    try {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create label");
      const label = await res.json();
      get().addLabel(label);
      return label;
    } catch (err) {
      set({ error: (err as Error).message });
      return null;
    }
  },

  patchLabel: async (id, data) => {
    try {
      const res = await fetch(`/api/labels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update label");
      const label = await res.json();
      get().updateLabel(id, label);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteLabel: async (id) => {
    try {
      const res = await fetch(`/api/labels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete label");
      get().removeLabel(id);
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },
}));
