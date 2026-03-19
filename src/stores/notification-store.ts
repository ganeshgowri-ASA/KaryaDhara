"use client";

import { create } from "zustand";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  taskId?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;

  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;

  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) =>
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    }),

  markAsRead: (id) =>
    set((s) => {
      const updated = s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),

  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const json = await res.json();
      const notifications = json.data;
      set({
        notifications,
        unreadCount: notifications.filter(
          (n: Notification) => !n.isRead
        ).length,
      });
    } catch {
      // silently fail
    } finally {
      set({ isLoading: false });
    }
  },

  markRead: async (id) => {
    get().markAsRead(id);
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
  },

  markAllRead: async () => {
    get().markAllAsRead();
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
  },
}));
