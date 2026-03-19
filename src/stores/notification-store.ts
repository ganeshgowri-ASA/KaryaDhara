import { create } from "zustand";

export type NotificationType =
  | "due_reminder"
  | "overdue_alert"
  | "task_assigned"
  | "task_completed"
  | "comment_added"
  | "status_changed";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;

  fetchNotifications: () => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),
  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications],
      unreadCount: s.unreadCount + (notification.isRead ? 0 : 1),
    })),
  markAsRead: (id) =>
    set((s) => {
      const n = s.notifications.find((n) => n.id === id);
      const wasUnread = n && !n.isRead;
      return {
        notifications: s.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: wasUnread ? s.unreadCount - 1 : s.unreadCount,
      };
    }),
  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),
  removeNotification: (id) =>
    set((s) => {
      const n = s.notifications.find((n) => n.id === id);
      return {
        notifications: s.notifications.filter((n) => n.id !== id),
        unreadCount:
          n && !n.isRead ? s.unreadCount - 1 : s.unreadCount,
      };
    }),
  setLoading: (isLoading) => set({ isLoading }),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = await res.json();
      const notifications = json.data || json;
      set({
        notifications,
        unreadCount: notifications.filter(
          (n: Notification) => !n.isRead
        ).length,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  dismissNotification: async (id) => {
    get().markAsRead(id);
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    } catch {
      // silent fail for notification dismiss
    }
  },
}));
