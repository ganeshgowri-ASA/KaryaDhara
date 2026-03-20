"use client";

import { useCallback } from "react";
import { useTaskStore, type Task } from "@/stores/task-store";
import type { TaskStatus, TaskPriority } from "@/types";

export function useTasks() {
  const { tasks, setTasks, updateTask, setIsLoading: setLoading } = useTaskStore();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : data.tasks ?? []);
    } finally {
      setLoading(false);
    }
  }, [setTasks, setLoading]);

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
        updateTask(taskId, Array.isArray(data) ? data : data);
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
        updateTask(taskId, data);
      } catch {
        fetchTasks();
      }
    },
    [updateTask, fetchTasks]
  );

  const updateTaskDates = useCallback(
    async (taskId: string, dates: { startDate?: string; dueDate?: string }) => {
      updateTask(taskId, dates as Partial<Task>);
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dates),
        });
        if (!res.ok) throw new Error("Failed to update task");
        const data = await res.json();
        updateTask(taskId, data);
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
        updateTask(taskId, data);
      } catch {
        fetchTasks();
      }
    },
    [updateTask, fetchTasks]
  );

  return {
    tasks,
    fetchTasks,
    updateTaskStatus,
    updateTaskPriority,
    updateTaskDates,
    updateTaskTitle,
  };
}
