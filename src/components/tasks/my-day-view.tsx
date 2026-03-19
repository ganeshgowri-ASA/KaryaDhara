"use client";

import { useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Sun, Sparkles, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskItem } from "./task-item";
import { TaskQuickAdd } from "./task-quick-add";
import { useTaskStore } from "@/stores/task-store";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

export function MyDayView() {
  const { tasks, fetchTasks, myDayTaskIds, toggleMyDayTask, isLoading } =
    useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const myDayTasks = useMemo(
    () => tasks.filter((t) => myDayTaskIds.includes(t.id)),
    [tasks, myDayTaskIds]
  );

  const suggestedTasks = useMemo(() => {
    // AI-like suggestion: prioritize by urgency
    return tasks
      .filter(
        (t) =>
          !myDayTaskIds.includes(t.id) &&
          t.status !== "DONE" &&
          t.status !== "CANCELLED"
      )
      .sort((a, b) => {
        // P1/P2 first
        const pOrder = { P1: 1, P2: 2, P3: 3, P4: 4 };
        const pDiff = pOrder[a.priority] - pOrder[b.priority];
        if (pDiff !== 0) return pDiff;
        // Then by due date
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return aDate - bDate;
      })
      .slice(0, 5);
  }, [tasks, myDayTaskIds]);

  const today = new Date();

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Sun className="h-6 w-6 text-yellow-500" />
          <h2 className="text-2xl font-bold">My Day</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {format(today, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {/* My Day Tasks */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : myDayTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sun className="h-12 w-12 mx-auto mb-3 text-yellow-400/50" />
            <p className="text-lg font-medium">Focus on what matters today</p>
            <p className="text-sm">
              Add tasks from suggestions below or create new ones
            </p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter}>
            <SortableContext
              items={myDayTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {myDayTasks.map((task) => (
                <div key={task.id} className="flex items-center group">
                  <TaskItem task={task} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={() => toggleMyDayTask(task.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </SortableContext>
          </DndContext>
        )}

        <div className="border-t mt-4 pt-2">
          <TaskQuickAdd />
        </div>

        {/* Suggested Tasks */}
        {suggestedTasks.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-muted-foreground">
                Suggested for today
              </h3>
            </div>
            <div className="space-y-1">
              {suggestedTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent/50 transition-colors"
                >
                  <span className="flex-1 text-sm truncate">{task.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {task.priority}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleMyDayTask(task.id)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
