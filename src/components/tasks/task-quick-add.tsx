"use client";

import { useState, useCallback } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTaskStore } from "@/stores/task-store";
import type { TaskPriority } from "@prisma/client";
import { useProjectStore } from "@/stores/project-store";
import { extractDateAndTitle } from "@/lib/date-parser";

export function TaskQuickAdd({ parentId }: { parentId?: string }) {
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("P3");
  const { createTask } = useTaskStore();
  const { activeProjectId } = useProjectStore();

  const handleSubmit = useCallback(async () => {
    if (!value.trim()) return;

    const { title, dueDate } = extractDateAndTitle(value);

    await createTask({
      title,
      priority,
      dueDate: dueDate?.toISOString() || null,
      projectId: activeProjectId,
      parentId: parentId || null,
    });

    setValue("");
    setPriority("P3");
    if (parentId) setIsAdding(false);
  }, [value, priority, activeProjectId, parentId, createTask]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setValue("");
      setIsAdding(false);
    }
  };

  if (parentId && !isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex items-center gap-1 pl-8 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Plus className="h-3 w-3" />
        Add subtask
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 py-2">
      <div className="flex items-center gap-1 flex-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            parentId
              ? "Add subtask..."
              : 'Add task... (try "Call client tomorrow 3pm")'
          }
          className="h-8 border-none shadow-none focus-visible:ring-0 text-sm"
          autoFocus={isAdding || !!parentId}
        />
      </div>
      <div className="flex items-center gap-1">
        {(["P1", "P2", "P3", "P4"] as TaskPriority[]).map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`h-5 w-5 rounded text-[10px] font-bold transition-colors ${
              priority === p
                ? p === "P1"
                  ? "bg-red-500 text-white"
                  : p === "P2"
                    ? "bg-orange-500 text-white"
                    : p === "P3"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-400 text-white"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      {value.trim() && (
        <Button size="sm" className="h-7 text-xs" onClick={handleSubmit}>
          Add
        </Button>
      )}
    </div>
  );
}
