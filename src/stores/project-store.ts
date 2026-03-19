import { create } from "zustand";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  status: "ACTIVE" | "ARCHIVED" | "COMPLETED";
  position: number;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface Label {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface ProjectStore {
  projects: Project[];
  labels: Label[];
  workspaces: Workspace[];
  activeProjectId: string | null;
  activeWorkspaceId: string | null;
  isLoading: boolean;

  setProjects: (projects: Project[]) => void;
  setLabels: (labels: Label[]) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveProjectId: (id: string | null) => void;
  setActiveWorkspaceId: (id: string | null) => void;

  fetchProjects: () => Promise<void>;
  fetchLabels: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project | null>;
  createLabel: (data: Partial<Label>) => Promise<Label | null>;
  deleteLabel: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  labels: [],
  workspaces: [],
  activeProjectId: null,
  activeWorkspaceId: null,
  isLoading: false,

  setProjects: (projects) => set({ projects }),
  setLabels: (labels) => set({ labels }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveProjectId: (id) => set({ activeProjectId: id }),
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        set({ projects: data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLabels: async () => {
    try {
      const res = await fetch("/api/labels");
      if (res.ok) {
        const data = await res.json();
        set({ labels: data });
      }
    } catch {
      /* ignore */
    }
  },

  createProject: async (data) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const project = await res.json();
        set((s) => ({ projects: [...s.projects, project] }));
        return project;
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  createLabel: async (data) => {
    try {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const label = await res.json();
        set((s) => ({ labels: [...s.labels, label] }));
        return label;
      }
    } catch {
      /* ignore */
    }
    return null;
  },

  deleteLabel: async (id) => {
    try {
      const res = await fetch(`/api/labels/${id}`, { method: "DELETE" });
      if (res.ok) {
        set((s) => ({ labels: s.labels.filter((l) => l.id !== id) }));
      }
    } catch {
      /* ignore */
    }
  },
}));
