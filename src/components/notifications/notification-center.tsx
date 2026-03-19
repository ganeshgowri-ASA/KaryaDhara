"use client";

import { useEffect } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/stores/notification-store";
import { cn } from "@/lib/utils";

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markRead,
    markAllRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const typeStyles: Record<string, string> = {
    DUE_REMINDER: "text-yellow-600",
    OVERDUE_ALERT: "text-red-600",
    TASK_ASSIGNED: "text-blue-600",
    TASK_COMPLETED: "text-green-600",
    COMMENT_ADDED: "text-purple-600",
    STATUS_CHANGED: "text-orange-600",
    SYSTEM: "text-gray-600",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center p-0 text-[10px]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={(e) => {
                e.preventDefault();
                markAllRead();
              }}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            notifications.slice(0, 20).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3",
                  !notification.isRead && "bg-muted/50"
                )}
                onClick={() => {
                  if (!notification.isRead) markRead(notification.id);
                }}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <span
                    className={cn(
                      "text-xs font-medium",
                      typeStyles[notification.type] || "text-gray-600"
                    )}
                  >
                    {notification.title}
                  </span>
                  {!notification.isRead && (
                    <Check className="h-3 w-3 shrink-0 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {notification.message}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
