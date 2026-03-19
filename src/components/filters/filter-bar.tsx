"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTaskStore, type TaskPriority, type TaskStatus } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function FilterBar() {
  const { filters, setFilters } = useTaskStore();
  const { labels } = useProjectStore();
  const [open, setOpen] = useState(false);

  const hasFilters =
    (filters.status?.length || 0) > 0 ||
    (filters.priority?.length || 0) > 0 ||
    filters.labelId;

  const toggleStatus = (status: TaskStatus) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    setFilters({ ...filters, status: updated.length ? updated : undefined });
  };

  const togglePriority = (priority: TaskPriority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    setFilters({
      ...filters,
      priority: updated.length ? updated : undefined,
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const statuses: { id: TaskStatus; label: string }[] = [
    { id: "TODO", label: "To Do" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "IN_REVIEW", label: "Review" },
    { id: "DONE", label: "Done" },
  ];

  const priorities: { id: TaskPriority; label: string; color: string }[] = [
    { id: "P1", label: "P1 Urgent", color: "bg-red-500" },
    { id: "P2", label: "P2 High", color: "bg-orange-500" },
    { id: "P3", label: "P3 Medium", color: "bg-blue-500" },
    { id: "P4", label: "P4 Low", color: "bg-gray-400" },
  ];

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={hasFilters ? "secondary" : "ghost"}
            size="sm"
            className="h-7 text-xs"
          >
            <Filter className="mr-1 h-3 w-3" />
            Filter
            {hasFilters && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {(filters.status?.length || 0) +
                  (filters.priority?.length || 0) +
                  (filters.labelId ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            {/* Status */}
            <div>
              <p className="text-xs font-semibold mb-1">Status</p>
              <div className="flex flex-wrap gap-1">
                {statuses.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleStatus(s.id)}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs transition-colors",
                      filters.status?.includes(s.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <p className="text-xs font-semibold mb-1">Priority</p>
              <div className="flex flex-wrap gap-1">
                {priorities.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePriority(p.id)}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs transition-colors flex items-center gap-1",
                      filters.priority?.includes(p.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent"
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", p.color)} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Labels */}
            {labels.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-1">Labels</p>
                <div className="flex flex-wrap gap-1">
                  {labels.map((l) => (
                    <button
                      key={l.id}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          labelId: filters.labelId === l.id ? undefined : l.id,
                        })
                      }
                      className={cn(
                        "rounded-md px-2 py-1 text-xs transition-colors",
                        filters.labelId === l.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      )}
                    >
                      {l.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-7 text-xs"
                onClick={clearFilters}
              >
                <X className="mr-1 h-3 w-3" />
                Clear all filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active filter badges */}
      {filters.status?.map((s) => (
        <Badge key={s} variant="secondary" className="h-5 text-[10px]">
          {s.replace("_", " ")}
          <button onClick={() => toggleStatus(s)} className="ml-1">
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      {filters.priority?.map((p) => (
        <Badge key={p} variant="secondary" className="h-5 text-[10px]">
          {p}
          <button onClick={() => togglePriority(p)} className="ml-1">
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
    </div>
  );
}
