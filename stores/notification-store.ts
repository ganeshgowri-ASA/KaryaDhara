import { create } from "zustand";

export interface Notification {
  id: string;
  type: "due_reminder" | "overdue" | "assigned" | "completed" | "comment";
  title: string;
  message: string;
  taskId?: string;
  taskTitle?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;

  fetchNotifications: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
    }),

  markAsRead: (id) =>
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      };
    }),

  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  fetchNotifications: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/notifications?limit=50");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = await res.json();
      const notifications = json.data as Notification[];
      set({
        notifications,
        unreadCount: notifications.filter((n) => !n.read).length,
      });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
