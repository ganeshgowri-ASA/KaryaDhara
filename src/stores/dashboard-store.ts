import { create } from "zustand";

export interface CompletionTrend {
  date: string;
  completed: number;
  created: number;
}

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  upcomingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  avgCompletionTimeHours: number;
  tasksCompletedThisWeek: number;
  tasksCreatedThisWeek: number;
}

export interface OverdueTask {
  id: string;
  title: string;
  priority: string;
  dueDate: string;
  daysOverdue: number;
}

export interface UpcomingTask {
  id: string;
  title: string;
  priority: string;
  dueDate: string;
  daysUntilDue: number;
}

interface DashboardState {
  metrics: DashboardMetrics | null;
  completionTrends: CompletionTrend[];
  overdueTasks: OverdueTask[];
  upcomingTasks: UpcomingTask[];
  isLoading: boolean;

  setMetrics: (metrics: DashboardMetrics) => void;
  setCompletionTrends: (trends: CompletionTrend[]) => void;
  setOverdueTasks: (tasks: OverdueTask[]) => void;
  setUpcomingTasks: (tasks: UpcomingTask[]) => void;
  setLoading: (loading: boolean) => void;

  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: null,
  completionTrends: [],
  overdueTasks: [],
  upcomingTasks: [],
  isLoading: false,

  setMetrics: (metrics) => set({ metrics }),
  setCompletionTrends: (completionTrends) => set({ completionTrends }),
  setOverdueTasks: (overdueTasks) => set({ overdueTasks }),
  setUpcomingTasks: (upcomingTasks) => set({ upcomingTasks }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      const data = await res.json();
      set({
        metrics: data.metrics,
        completionTrends: data.completionTrends || [],
        overdueTasks: data.overdueTasks || [],
        upcomingTasks: data.upcomingTasks || [],
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },
}));
