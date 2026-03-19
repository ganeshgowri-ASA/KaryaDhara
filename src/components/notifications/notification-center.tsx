"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/stores/notification-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  UserPlus,
  MessageSquare,
  ArrowRight,
  CheckCheck,
} from "lucide-react";

const NOTIFICATION_ICONS: Record<string, React.ReactNode> = {
  due_reminder: <Clock className="h-4 w-4 text-yellow-500" />,
  overdue_alert: <AlertTriangle className="h-4 w-4 text-red-500" />,
  task_assigned: <UserPlus className="h-4 w-4 text-blue-500" />,
  task_completed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  comment_added: <MessageSquare className="h-4 w-4 text-purple-500" />,
  status_changed: <ArrowRight className="h-4 w-4 text-orange-500" />,
};

export function NotificationCenter() {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    dismissNotification,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-[16px] px-1 text-[10px]">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          {isLoading && notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 transition-colors hover:bg-muted/50 cursor-pointer ${
                    !notification.isRead ? "bg-muted/30" : ""
                  }`}
                  onClick={() => dismissNotification(notification.id)}
                >
                  <div className="mt-0.5">
                    {NOTIFICATION_ICONS[notification.type] || (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
