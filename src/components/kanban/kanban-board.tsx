"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useTaskStore, type Task, type TaskStatus } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";

const DEFAULT_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "To Do", color: "border-gray-400" },
  { id: "IN_PROGRESS", label: "In Progress", color: "border-blue-400" },
  { id: "IN_REVIEW", label: "Review", color: "border-yellow-400" },
  { id: "DONE", label: "Done", color: "border-green-400" },
];

export function KanbanBoard() {
  const { tasks, fetchTasks, updateTaskApi, isLoading } = useTaskStore();
  const { activeProjectId } = useProjectStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [activeProjectId, fetchTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const columnTasks = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const col of DEFAULT_COLUMNS) {
      map[col.id] = tasks
        .filter((t) => t.status === col.id)
        .sort((a, b) => a.position - b.position);
    }
    return map;
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = DEFAULT_COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      updateTaskApi(taskId, { status: targetColumn.id });
      return;
    }

    // Dropped on another task - find which column it's in
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask && targetTask.status) {
      updateTaskApi(taskId, {
        status: targetTask.status,
        position: targetTask.position,
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex gap-4 p-4 h-full overflow-x-auto">
      {isLoading ? (
        <div className="flex items-center justify-center w-full py-12">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {DEFAULT_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.label}
              color={col.color}
              count={columnTasks[col.id]?.length || 0}
            >
              <SortableContext
                items={(columnTasks[col.id] || []).map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                {(columnTasks[col.id] || []).map((task) => (
                  <KanbanCard key={task.id} task={task} />
                ))}
              </SortableContext>
            </KanbanColumn>
          ))}

          <DragOverlay>
            {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}
