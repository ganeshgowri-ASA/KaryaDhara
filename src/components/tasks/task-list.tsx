"use client";

import { useEffect } from "react";
import { useTaskStore } from "../../../stores/task-store";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export function TaskList() {
  const {
    tasks,
    loading,
    pagination,
    filters,
    setFilters,
    fetchTasks,
    patchTask,
    setSelectedTask,
  } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, filters]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.status || "all"}
          onValueChange={(v) =>
            setFilters({ ...filters, status: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="IN_REVIEW">In Review</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority || "all"}
          onValueChange={(v) =>
            setFilters({ ...filters, priority: v === "all" ? undefined : v })
          }
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="P1">P1 - Urgent</SelectItem>
            <SelectItem value="P2">P2 - High</SelectItem>
            <SelectItem value="P3">P3 - Medium</SelectItem>
            <SelectItem value="P4">P4 - Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy || "createdAt"}
          onValueChange={(v) => setFilters({ ...filters, sortBy: v })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created</SelectItem>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="updatedAt">Updated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      {loading && tasks.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tasks found. Create your first task!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onSelect={setSelectedTask}
              onStatusChange={(id, status) => patchTask(id, { status })}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            tasks)
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => fetchTasks(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasMore}
              onClick={() => fetchTasks(pagination.page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
