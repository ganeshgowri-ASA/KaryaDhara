"use client";

import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TaskCard } from "./task-card";
import {
  KANBAN_COLUMNS,
  STATUS_LABELS,
  STATUS_COLORS,
  type Task,
  type TaskStatus,
} from "../../../types";

interface KanbanViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
  onPriorityChange: (taskId: string, priority: string) => void;
  onTitleChange: (taskId: string, title: string) => void;
}

export function KanbanView({
  tasks,
  onStatusChange,
  onPriorityChange,
  onTitleChange,
}: KanbanViewProps) {
  const columns = React.useMemo(() => {
    return KANBAN_COLUMNS.map((status) => ({
      id: status,
      title: STATUS_LABELS[status],
      tasks: tasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.position - b.position),
    }));
  }, [tasks]);

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newStatus = destination.droppableId as TaskStatus;
    onStatusChange(draggableId, newStatus);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex-shrink-0 w-[320px] flex flex-col rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-2 p-3 pb-2">
              <span
                className={cn("h-2.5 w-2.5 rounded-full", STATUS_COLORS[col.id])}
              />
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <span className="ml-auto text-xs text-muted-foreground">
                {col.tasks.length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <ScrollArea className="flex-1">
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "min-h-[200px] p-2 pt-0 space-y-2 transition-colors",
                      snapshot.isDraggingOver && "bg-accent/50 rounded-b-lg"
                    )}
                  >
                    {col.tasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              snapshot.isDragging && "rotate-2 shadow-lg"
                            )}
                          >
                            <TaskCard
                              task={task}
                              onStatusChange={onStatusChange}
                              onPriorityChange={onPriorityChange}
                              onTitleChange={onTitleChange}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </ScrollArea>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
