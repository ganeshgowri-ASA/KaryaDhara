"use client";

import { cn } from "@/lib/utils";
import type { TaskPriority } from "@prisma/client";

const priorityConfig: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  P1: { label: "P1 Urgent", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  P2: { label: "P2 High", color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  P3: { label: "P3 Medium", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  P4: { label: "P4 Low", color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-900/30" },
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: string;
  className?: string;
}) {
  const config = priorityConfig[priority as TaskPriority] ?? priorityConfig.P4;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        config.color,
        config.bg,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    P1: "bg-red-500",
    P2: "bg-orange-500",
    P3: "bg-blue-500",
    P4: "bg-gray-400",
  };
  return <span className={cn("inline-block h-2 w-2 rounded-full", colors[priority] ?? "bg-gray-400")} />;
}
