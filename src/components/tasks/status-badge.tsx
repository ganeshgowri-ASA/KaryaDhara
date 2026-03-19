"use client";

import { cn } from "@/lib/utils";
import { Circle, Clock, Eye, CheckCircle2, XCircle, Archive } from "lucide-react";
import type { TaskStatus } from "@prisma/client";

const statusConfig: Record<
  TaskStatus,
  { label: string; icon: React.ElementType; color: string }
> = {
  TODO: { label: "To Do", icon: Circle, color: "text-gray-500" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-blue-500" },
  IN_REVIEW: { label: "Review", icon: Eye, color: "text-yellow-500" },
  DONE: { label: "Done", icon: CheckCircle2, color: "text-green-500" },
  CANCELLED: { label: "Cancelled", icon: XCircle, color: "text-red-500" },
  ARCHIVED: { label: "Archived", icon: Archive, color: "text-gray-400" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = statusConfig[status as TaskStatus] ?? statusConfig.TODO;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        config.color,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

export function StatusIcon({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const config = statusConfig[status as TaskStatus] ?? statusConfig.TODO;
  const Icon = config.icon;
  return <Icon className={cn("h-4 w-4", config.color, className)} />;
}
