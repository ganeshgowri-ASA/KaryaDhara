"use client";

import { create } from "zustand";

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  tasksByPriority: Record<string, number>;
  tasksByStatus: Record<string, number>;
  completionTrend: { date: string; completed: number; created: number }[];
  recentActivity: {
    id: string;
    type: string;
    meta: Record<string, unknown>;
    createdAt: string;
    task?: { id: string; title: string } | null;
  }[];
}

interface DashboardStore {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;

  fetchStats: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  totalTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  upcomingTasks: 0,
  inProgressTasks: 0,
  completionRate: 0,
  tasksByPriority: {},
  tasksByStatus: {},
  completionTrend: [],
  recentActivity: [],
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  stats: null,
  isLoading: false,
  error: null,

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const stats = await res.json();
      set({ stats });
    } catch (e) {
      set({ stats: defaultStats, error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
