import { useCallback } from "react";
import { useTaskStore } from "@/stores";

export function useTasks() {
  const { tasks, fetchTasks: storeFetchTasks, updateTaskApi } = useTaskStore();

  const fetchTasks = useCallback(() => {
    storeFetchTasks();
  }, [storeFetchTasks]);

  const updateTaskStatus = useCallback(
    (taskId: string, status: string) => {
      updateTaskApi(taskId, { status } as Record<string, unknown>);
    },
    [updateTaskApi]
  );

  const updateTaskPriority = useCallback(
    (taskId: string, priority: string) => {
      updateTaskApi(taskId, { priority } as Record<string, unknown>);
    },
    [updateTaskApi]
  );

  const updateTaskDates = useCallback(
    (taskId: string, dates: { dueDate?: string; startDate?: string }) => {
      updateTaskApi(taskId, dates as Record<string, unknown>);
    },
    [updateTaskApi]
  );

  const updateTaskTitle = useCallback(
    (taskId: string, title: string) => {
      updateTaskApi(taskId, { title } as Record<string, unknown>);
    },
    [updateTaskApi]
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
