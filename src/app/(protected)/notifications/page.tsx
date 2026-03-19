"use client";

import { useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

const typeStyles: Record<string, { bg: string; text: string }> = {
  DUE_REMINDER: { bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-600" },
  OVERDUE_ALERT: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600" },
  TASK_ASSIGNED: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600" },
  TASK_COMPLETED: { bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-600" },
  COMMENT_ADDED: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-600" },
  STATUS_CHANGED: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600" },
  SYSTEM: { bg: "bg-gray-50 dark:bg-gray-900/20", text: "text-gray-600" },
};

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markRead,
    markAllRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <CardTitle className="mb-1 text-lg">No notifications</CardTitle>
            <CardDescription>
              You&apos;ll be notified about due dates, assignments, and updates
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const style = typeStyles[notification.type] || typeStyles.SYSTEM;
            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-colors",
                  !notification.isRead && style.bg
                )}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-[10px]", style.text)}
                      >
                        {notification.type.replace(/_/g, " ")}
                      </Badge>
                      {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-1 font-medium text-sm">
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markRead(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Suppress unused import warnings
void Trash2;
