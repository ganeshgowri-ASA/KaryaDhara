"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/stores/task-store";
import { useUIStore } from "@/stores/ui-store";

export function KeyboardShortcuts() {
  const { tasks, selectedTaskId, setSelectedTaskId, updateTaskApi, deleteTask } =
    useTaskStore();
  const { setTaskDetailOpen, setCommandPaletteOpen, taskDetailOpen } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl+K is handled by command palette
      if (e.ctrlKey || e.metaKey) return;

      const currentIndex = selectedTaskId
        ? tasks.findIndex((t) => t.id === selectedTaskId)
        : -1;

      switch (e.key) {
        case "j": {
          // Navigate down
          e.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, tasks.length - 1);
          if (tasks[nextIndex]) {
            setSelectedTaskId(tasks[nextIndex].id);
          }
          break;
        }
        case "k": {
          // Navigate up
          e.preventDefault();
          const prevIndex = Math.max(currentIndex - 1, 0);
          if (tasks[prevIndex]) {
            setSelectedTaskId(tasks[prevIndex].id);
          }
          break;
        }
        case "x": {
          // Toggle complete
          if (selectedTaskId) {
            e.preventDefault();
            const task = tasks.find((t) => t.id === selectedTaskId);
            if (task) {
              updateTaskApi(selectedTaskId, {
                status: task.status === "DONE" ? "TODO" : "DONE",
              });
            }
          }
          break;
        }
        case "e": {
          // Edit - open detail panel
          if (selectedTaskId) {
            e.preventDefault();
            setTaskDetailOpen(true);
          }
          break;
        }
        case "d": {
          // Delete
          if (selectedTaskId) {
            e.preventDefault();
            deleteTask(selectedTaskId);
            setSelectedTaskId(null);
            setTaskDetailOpen(false);
          }
          break;
        }
        case "n": {
          // New task - focus quick add input
          e.preventDefault();
          const input = document.querySelector<HTMLInputElement>(
            'input[placeholder*="Add task"]'
          );
          if (input) input.focus();
          break;
        }
        case "Escape": {
          if (taskDetailOpen) {
            setTaskDetailOpen(false);
          } else {
            setSelectedTaskId(null);
          }
          break;
        }
        case "Enter": {
          if (selectedTaskId && !taskDetailOpen) {
            e.preventDefault();
            setTaskDetailOpen(true);
          }
          break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTaskApi,
    deleteTask,
    setTaskDetailOpen,
    setCommandPaletteOpen,
    taskDetailOpen,
  ]);

  return null;
}
