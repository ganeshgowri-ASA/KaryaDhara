"use client";

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
  isLoading: boolean;
  error: string | null;

  setLabels: (labels: Label[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  fetchLabels: (workspaceId: string) => Promise<void>;
  createLabel: (data: {
    name: string;
    color: string;
    workspaceId: string;
  }) => Promise<Label | null>;
  deleteLabel: (id: string) => Promise<void>;
}

export const useLabelStore = create<LabelStore>((set) => ({
  labels: [],
  isLoading: false,
  error: null,

  setLabels: (labels) => set({ labels }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchLabels: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/labels?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error("Failed to fetch labels");
      const json = await res.json();
      set({ labels: json.data });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
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
      set((s) => ({ labels: [...s.labels, label] }));
      return label;
    } catch (e) {
      set({ error: (e as Error).message });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteLabel: async (id) => {
    try {
      const res = await fetch(`/api/labels/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete label");
      set((s) => ({ labels: s.labels.filter((l) => l.id !== id) }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
