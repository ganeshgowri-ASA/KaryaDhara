"use client";

import { useTaskStore, type TaskPriority, type TaskStatus } from "@/stores/task-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, Filter } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "IN_REVIEW", label: "In Review" },
  { value: "DONE", label: "Done" },
  { value: "CANCELLED", label: "Cancelled" },
];

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: "P1", label: "P1 Urgent" },
  { value: "P2", label: "P2 High" },
  { value: "P3", label: "P3 Medium" },
  { value: "P4", label: "P4 Low" },
];

export function TaskFilters() {
  const { filters, setFilters, clearFilters, fetchTasks } = useTaskStore();

  const activeFilterCount =
    (filters.status?.length || 0) +
    (filters.priority?.length || 0) +
    (filters.search ? 1 : 0) +
    (filters.dueDateFrom ? 1 : 0) +
    (filters.dueDateTo ? 1 : 0);

  const toggleStatus = (status: TaskStatus) => {
    const current = filters.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    setFilters({ status: updated.length ? updated : undefined });
    fetchTasks();
  };

  const togglePriority = (priority: TaskPriority) => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    setFilters({ priority: updated.length ? updated : undefined });
    fetchTasks();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-8 h-9"
          value={filters.search || ""}
          onChange={(e) => {
            setFilters({ search: e.target.value || undefined });
            fetchTasks();
          }}
        />
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-1.5 h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium">Status</p>
              <div className="flex flex-wrap gap-1.5">
                {STATUSES.map((s) => (
                  <Badge
                    key={s.value}
                    variant={filters.status?.includes(s.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleStatus(s.value)}
                  >
                    {s.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Priority</p>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((p) => (
                  <Badge
                    key={p.value}
                    variant={filters.priority?.includes(p.value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => togglePriority(p.value)}
                  >
                    {p.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="mb-1 text-xs font-medium">Due From</p>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={filters.dueDateFrom || ""}
                  onChange={(e) => {
                    setFilters({ dueDateFrom: e.target.value || undefined });
                    fetchTasks();
                  }}
                />
              </div>
              <div>
                <p className="mb-1 text-xs font-medium">Due To</p>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={filters.dueDateTo || ""}
                  onChange={(e) => {
                    setFilters({ dueDateTo: e.target.value || undefined });
                    fetchTasks();
                  }}
                />
              </div>
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => {
                  clearFilters();
                  fetchTasks();
                }}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Clear all filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
