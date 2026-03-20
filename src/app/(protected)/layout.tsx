"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { TaskDetail } from "@/components/tasks/task-detail";
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { SearchDialog } from "@/components/search/search-dialog";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-hidden">{children}</div>
        <TaskDetail />
      </main>
      <PomodoroTimer />
      <KeyboardShortcuts />
      <SearchDialog />
      <NotificationCenter />
    </div>
  );
}
