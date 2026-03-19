"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskItem } from "./task-item";
import { TaskQuickAdd } from "./task-quick-add";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";

type SortField = "position" | "priority" | "dueDate" | "title" | "status" | "createdAt";

export function TaskList() {
  const { tasks, fetchTasks, isLoading, updateTaskApi, sortBy, sortOrder, setSortBy, setSortOrder } =
    useTaskStore();
  const { activeProjectId } = useProjectStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [activeProjectId, fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedTasks = useMemo(() => {
    const sorted = [...tasks];
    sorted.sort((a, b) => {
      let cmp = 0;
      const field = sortBy as SortField;
      switch (field) {
        case "priority": {
          const pOrder: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
          cmp = (pOrder[a.priority] ?? 5) - (pOrder[b.priority] ?? 5);
          break;
        }
        case "dueDate": {
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          cmp = aDate - bDate;
          break;
        }
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "status": {
          const sOrder: Record<string, number> = {
            TODO: 1,
            IN_PROGRESS: 2,
            IN_REVIEW: 3,
            DONE: 4,
            CANCELLED: 5,
            ARCHIVED: 6,
          };
          cmp = (sOrder[a.status] ?? 7) - (sOrder[b.status] ?? 7);
          break;
        }
        case "createdAt":
          cmp =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          cmp = a.position - b.position;
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });
    return sorted;
  }, [tasks, sortBy, sortOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
    const newIndex = sortedTasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Calculate new position
    const target = sortedTasks[newIndex];
    const prev = newIndex > 0 ? sortedTasks[newIndex - 1] : null;
    const next =
      newIndex < sortedTasks.length - 1 ? sortedTasks[newIndex + 1] : null;

    let newPosition: number;
    if (oldIndex < newIndex) {
      newPosition = next ? (target.position + next.position) / 2 : target.position + 1;
    } else {
      newPosition = prev ? (prev.position + target.position) / 2 : target.position / 2;
    }

    updateTaskApi(active.id as string, { position: newPosition });
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const SortButton = ({
    field,
    label,
  }: {
    field: SortField;
    label: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 text-xs"
      onClick={() => handleSort(field)}
    >
      {label}
      {sortBy === field ? (
        sortOrder === "asc" ? (
          <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  );

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Sort header */}
      <div className="flex items-center gap-1 px-2 py-1 border-b">
        <span className="text-xs text-muted-foreground mr-2">Sort by:</span>
        <SortButton field="position" label="Order" />
        <SortButton field="priority" label="Priority" />
        <SortButton field="dueDate" label="Due Date" />
        <SortButton field="title" label="Title" />
        <SortButton field="status" label="Status" />
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto py-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg font-medium">No tasks yet</p>
            <p className="text-sm">Add your first task below</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sortedTasks.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Quick add */}
      <div className="border-t px-2">
        <TaskQuickAdd />
      </div>
    </div>
  );
}
