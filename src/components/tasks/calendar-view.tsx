"use client";

import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  parseISO,
} from "date-fns";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useViewStore } from "../../../stores";
import {
  PRIORITY_COLORS,
  STATUS_COLORS,
  type Task,
  type CalendarMode,
} from "../../../types";

interface CalendarViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
  onPriorityChange: (taskId: string, priority: string) => void;
  onDateChange: (taskId: string, dates: { dueDate?: string }) => void;
}

export function CalendarView({
  tasks,
  onDateChange,
}: CalendarViewProps) {
  const { calendarMode, setCalendarMode, selectedDate, setSelectedDate } = useViewStore();
  const currentDate = parseISO(selectedDate);

  const navigate = (dir: "prev" | "next") => {
    const fn = dir === "prev"
      ? calendarMode === "month" ? subMonths : calendarMode === "week" ? subWeeks : subDays
      : calendarMode === "month" ? addMonths : calendarMode === "week" ? addWeeks : addDays;
    setSelectedDate(fn(currentDate, 1).toISOString());
  };

  const goToday = () => setSelectedDate(new Date().toISOString());

  const days = React.useMemo(() => {
    if (calendarMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return eachDayOfInterval({
        start: startOfWeek(monthStart, { weekStartsOn: 1 }),
        end: endOfWeek(monthEnd, { weekStartsOn: 1 }),
      });
    }
    if (calendarMode === "week") {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
    return [startOfDay(currentDate)];
  }, [currentDate, calendarMode]);

  const getTasksForDay = React.useCallback(
    (day: Date) =>
      tasks.filter((t) => {
        if (t.dueDate && isSameDay(parseISO(t.dueDate), day)) return true;
        if (
          t.startDate &&
          t.dueDate &&
          parseISO(t.startDate) <= endOfDay(day) &&
          parseISO(t.dueDate) >= startOfDay(day)
        )
          return true;
        if (!t.dueDate && t.startDate && isSameDay(parseISO(t.startDate), day))
          return true;
        return false;
      }),
    [tasks]
  );

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;
    const newDate = destination.droppableId;
    onDateChange(draggableId, { dueDate: newDate });
  };

  const headerLabel =
    calendarMode === "month"
      ? format(currentDate, "MMMM yyyy")
      : calendarMode === "week"
      ? `${format(days[0], "MMM d")} - ${format(days[days.length - 1], "MMM d, yyyy")}`
      : format(currentDate, "EEEE, MMMM d, yyyy");

  const modeButtons: { mode: CalendarMode; label: string }[] = [
    { mode: "month", label: "Month" },
    { mode: "week", label: "Week" },
    { mode: "day", label: "Day" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">{headerLabel}</h2>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>
            Today
          </Button>
        </div>

        <div className="inline-flex items-center rounded-lg border bg-muted p-1">
          {modeButtons.map((m) => (
            <Button
              key={m.mode}
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2.5 text-xs",
                calendarMode === m.mode && "bg-background shadow-sm"
              )}
              onClick={() => setCalendarMode(m.mode)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Weekday headers */}
      {calendarMode !== "day" && (
        <div
          className={cn(
            "grid gap-px",
            calendarMode === "month" ? "grid-cols-7" : "grid-cols-7"
          )}
        >
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div
              key={d}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {d}
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div
          className={cn(
            "grid gap-px bg-border rounded-lg overflow-hidden",
            calendarMode === "day" ? "grid-cols-1" : "grid-cols-7"
          )}
        >
          {days.map((day) => {
            const dayTasks = getTasksForDay(day);
            const dateKey = format(day, "yyyy-MM-dd");

            return (
              <Droppable key={dateKey} droppableId={dateKey}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "bg-card p-1.5 transition-colors",
                      calendarMode === "month"
                        ? "min-h-[100px]"
                        : calendarMode === "week"
                        ? "min-h-[200px]"
                        : "min-h-[400px]",
                      !isSameMonth(day, currentDate) &&
                        calendarMode === "month" &&
                        "bg-muted/30",
                      snapshot.isDraggingOver && "bg-accent/50"
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs font-medium mb-1 h-6 w-6 flex items-center justify-center rounded-full",
                        isToday(day) && "bg-primary text-primary-foreground",
                        !isToday(day) &&
                          !isSameMonth(day, currentDate) &&
                          calendarMode === "month" &&
                          "text-muted-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </div>

                    <div className="space-y-1">
                      {dayTasks.slice(0, calendarMode === "month" ? 3 : undefined).map((task, idx) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={idx}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "group relative flex items-center gap-1 rounded px-1.5 py-0.5 text-xs cursor-pointer hover:ring-1 hover:ring-ring transition-all",
                                snapshot.isDragging && "shadow-lg ring-1 ring-ring",
                                task.status === "DONE"
                                  ? "bg-green-50 dark:bg-green-950/30"
                                  : "bg-muted/60"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                                  PRIORITY_COLORS[task.priority]
                                )}
                              />
                              <span
                                className={cn(
                                  "truncate flex-1",
                                  task.status === "DONE" && "line-through text-muted-foreground"
                                )}
                              >
                                {task.title}
                              </span>
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                                  STATUS_COLORS[task.status]
                                )}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {calendarMode === "month" && dayTasks.length > 3 && (
                        <div className="text-[10px] text-muted-foreground px-1">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
