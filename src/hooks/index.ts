"use client";

import { useCallback } from "react";
import { useTaskStore } from "@/stores/task-store";
import type { Task, TaskStatus, TaskPriority } from "@/types";

const TASK_INCLUDE = "include=assignee,creator,labels,subtasks,blockedBy,blocks,section,project";

export function useTasks() {
  const { tasks, setTasks, updateTask, setIsLoading } = useTaskStore();

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/tasks?${TASK_INCLUDE}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data.tasks);
    } catch {
      /* fetch error - silent */
    } finally {
      setIsLoading(false);
    }
  }, [setTasks, setIsLoading]);

  const updateTaskStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      updateTask(taskId, { status });
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update task");
        const data = await res.json();
        updateTask(taskId, data.task);
      } catch {
        fetchTasks();
      }
    },
    [updateTask, fetchTasks]
  );

  const updateTaskPriority = useCallback(
    async (taskId: string, priority: TaskPriority) => {
      updateTask(taskId, { priority });
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority }),
        });
        if (!res.ok) throw new Error("Failed to update task");
        const data = await res.json();
        updateTask(taskId, data.task);
      } catch {
        fetchTasks();
      }
    },
    [updateTask, fetchTasks]
  );

  const updateTaskDates = useCallback(
    async (taskId: string, dates: { startDate?: string; dueDate?: string }) => {
      updateTask(taskId, dates as unknown as Parameters<typeof updateTask>[1]);
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dates),
        });
        if (!res.ok) throw new Error("Failed to update task");
        const data = await res.json();
        updateTask(taskId, data.task);
      } catch {
        fetchTasks();
      }
    },
    [updateTask, fetchTasks]
  );

  const updateTaskTitle = useCallback(
    async (taskId: string, title: string) => {
      updateTask(taskId, { title });
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error("Failed to update task");
        const data = await res.json();
        updateTask(taskId, data.task);
      } catch {
        fetchTasks();
      }
    },
    [updateTask, fetchTasks]
  );

  return {
    tasks: tasks as unknown as Task[],
    fetchTasks,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskDates,
    updateTaskTitle,
  };
}
