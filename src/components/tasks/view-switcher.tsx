"use client";

import React from "react";
import { Calendar, List, LayoutGrid, GanttChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useViewStore } from "../../../stores";
import type { ViewMode } from "../../../types";

const views: { mode: ViewMode; label: string; icon: React.ReactNode }[] = [
  { mode: "list", label: "List", icon: <List className="h-4 w-4" /> },
  { mode: "kanban", label: "Kanban", icon: <LayoutGrid className="h-4 w-4" /> },
  { mode: "calendar", label: "Calendar", icon: <Calendar className="h-4 w-4" /> },
  { mode: "timeline", label: "Timeline", icon: <GanttChart className="h-4 w-4" /> },
];

export function ViewSwitcher() {
  const { viewMode, setViewMode } = useViewStore();

  return (
    <div className="inline-flex items-center rounded-lg border bg-muted p-1">
      {views.map((v) => (
        <Button
          key={v.mode}
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 px-3 gap-1.5 text-xs",
            viewMode === v.mode &&
              "bg-background text-foreground shadow-sm hover:bg-background"
          )}
          onClick={() => setViewMode(v.mode)}
        >
          {v.icon}
          <span className="hidden sm:inline">{v.label}</span>
        </Button>
      ))}
    </div>
  );
}
