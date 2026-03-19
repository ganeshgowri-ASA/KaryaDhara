import { create } from "zustand";

export type ViewMode = "list" | "kanban" | "calendar" | "timeline" | "my-day";

interface UIStore {
  sidebarOpen: boolean;
  viewMode: ViewMode;
  commandPaletteOpen: boolean;
  taskDetailOpen: boolean;
  selectedView: string;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setTaskDetailOpen: (open: boolean) => void;
  setSelectedView: (view: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  viewMode: "list",
  commandPaletteOpen: false,
  taskDetailOpen: false,
  selectedView: "inbox",

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setTaskDetailOpen: (open) => set({ taskDetailOpen: open }),
  setSelectedView: (view) => set({ selectedView: view }),
}));
