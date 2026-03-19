"use client";

import React from "react";
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isBefore,
  startOfDay,
  parseISO,
} from "date-fns";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTaskStore } from "../../../../stores";
import { useViewStore } from "../../../../stores";
import { useTasks } from "../../../../hooks";
import type { TaskPriority } from "../../../../types";

import { ViewSwitcher } from "@/components/tasks/view-switcher";
import { FilterBar } from "@/components/tasks/filter-bar";
import { KanbanView } from "@/components/tasks/kanban-view";
import { CalendarView } from "@/components/tasks/calendar-view";
import { TimelineView } from "@/components/tasks/timeline-view";
import { ListView } from "@/components/tasks/list-view";

export default function TasksPage() {
  const { isLoading } = useTaskStore();
  const { viewMode, searchQuery, statusFilter, priorityFilter, dateFilter } =
    useViewStore();
  const {
    tasks,
    fetchTasks,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskDates,
    updateTaskTitle,
  } = useTasks();

  const [showNewTask, setShowNewTask] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<TaskPriority>("P3");
  const [newDueDate, setNewDueDate] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter tasks
  const filteredTasks = React.useMemo(() => {
    let result = tasks;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }

    // Status
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Priority
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }

    // Date range
    if (dateFilter !== "all") {
      const now = startOfDay(new Date());
      result = result.filter((t) => {
        if (!t.dueDate) return false;
        const due = parseISO(t.dueDate);
        switch (dateFilter) {
          case "today":
            return isToday(due);
          case "this_week":
            return isThisWeek(due, { weekStartsOn: 1 });
          case "this_month":
            return isThisMonth(due);
          case "overdue":
            return isBefore(due, now) && t.status !== "DONE" && t.status !== "CANCELLED";
          default:
            return true;
        }
      });
    }

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, dateFilter]);

  const handleCreateTask = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          priority: newPriority,
          dueDate: newDueDate || null,
        }),
      });
      if (res.ok) {
        setShowNewTask(false);
        setNewTitle("");
        setNewPriority("P3");
        setNewDueDate("");
        fetchTasks();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDateChange = (taskId: string, dates: { dueDate?: string }) => {
    updateTaskDates(taskId, dates);
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-sm text-muted-foreground">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
            {tasks.length !== filteredTasks.length &&
              ` (${tasks.length} total)`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ViewSwitcher />
          <Button size="sm" className="h-8 gap-1" onClick={() => setShowNewTask(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Views */}
      {!isLoading && (
        <>
          {viewMode === "kanban" && (
            <KanbanView
              tasks={filteredTasks}
              onStatusChange={updateTaskStatus}
              onPriorityChange={updateTaskPriority}
              onTitleChange={updateTaskTitle}
            />
          )}
          {viewMode === "calendar" && (
            <CalendarView
              tasks={filteredTasks}
              onStatusChange={updateTaskStatus}
              onPriorityChange={updateTaskPriority}
              onDateChange={handleDateChange}
            />
          )}
          {viewMode === "timeline" && (
            <TimelineView
              tasks={filteredTasks}
              onStatusChange={updateTaskStatus}
              onPriorityChange={updateTaskPriority}
            />
          )}
          {viewMode === "list" && (
            <ListView
              tasks={filteredTasks}
              onStatusChange={updateTaskStatus}
              onPriorityChange={updateTaskPriority}
              onTitleChange={updateTaskTitle}
            />
          )}
        </>
      )}

      {/* Create task dialog */}
      <Dialog open={showNewTask} onOpenChange={setShowNewTask}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>Create a new task to track your work.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Task title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !creating) handleCreateTask();
                }}
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newPriority}
                  onValueChange={(v) => setNewPriority(v as TaskPriority)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="P1">Urgent</SelectItem>
                    <SelectItem value="P2">High</SelectItem>
                    <SelectItem value="P3">Medium</SelectItem>
                    <SelectItem value="P4">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewTask(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTask} disabled={creating || !newTitle.trim()}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
