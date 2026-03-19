"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { TaskList } from "@/components/tasks/task-list";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { CalendarView } from "@/components/calendar/calendar-view";
import { TimelineView } from "@/components/timeline/timeline-view";
import { MyDayView } from "@/components/tasks/my-day-view";
import { FilterBar } from "@/components/filters/filter-bar";
import { useUIStore } from "@/stores/ui-store";
import { useProjectStore } from "@/stores/project-store";
import { useTaskStore } from "@/stores/task-store";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function DashboardPage() {
  useSession();
  const { viewMode, selectedView } = useUIStore();
  const { projects, activeProjectId } = useProjectStore();
  const { filters, setFilters, fetchTasks } = useTaskStore();

  const activeProject = activeProjectId
    ? projects.find((p) => p.id === activeProjectId)
    : null;

  // Re-fetch when filters change
  useEffect(() => {
    fetchTasks(activeProjectId || undefined);
  }, [filters, activeProjectId, fetchTasks]);

  const getTitle = () => {
    if (viewMode === "my-day") return "";
    if (activeProject) return activeProject.name;
    if (selectedView === "filters") return "Filters";
    return "Inbox";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      {viewMode !== "my-day" && (
        <div className="flex items-center gap-4 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">{getTitle()}</h2>
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={filters.search || ""}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value || undefined })
                }
                className="h-7 pl-7 text-xs"
              />
            </div>
          </div>
          <FilterBar />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "my-day" ? (
          <MyDayView />
        ) : viewMode === "kanban" ? (
          <KanbanBoard />
        ) : viewMode === "calendar" ? (
          <CalendarView />
        ) : viewMode === "timeline" ? (
          <TimelineView />
        ) : (
          <TaskList />
        )}
      </div>
    </div>
  );
}
