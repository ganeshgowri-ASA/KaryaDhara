"use client";

import { useEffect, useMemo, useState } from "react";
import {
  format,
  addDays,
  startOfWeek,
  differenceInDays,
  isBefore,
  isAfter,
  max as dateMax,
  min as dateMin,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PriorityDot } from "@/components/tasks/priority-badge";
import { useTaskStore, type Task } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { useUIStore } from "@/stores/ui-store";

const DAYS_TO_SHOW = 28; // 4 weeks
const DAY_WIDTH = 40; // px per day column

interface TimelineTask extends Task {
  barStart: number;
  barWidth: number;
}

export function TimelineView() {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { setSelectedTaskId } = useTaskStore();
  const { setTaskDetailOpen } = useUIStore();
  const { activeProjectId } = useProjectStore();
  const [startDate, setStartDate] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  useEffect(() => {
    fetchTasks(activeProjectId || undefined);
  }, [activeProjectId, fetchTasks]);

  const endDate = useMemo(() => addDays(startDate, DAYS_TO_SHOW - 1), [startDate]);

  const days = useMemo(() => {
    const result: Date[] = [];
    for (let i = 0; i < DAYS_TO_SHOW; i++) {
      result.push(addDays(startDate, i));
    }
    return result;
  }, [startDate]);

  const timelineTasks: TimelineTask[] = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate || t.startDate)
      .map((task) => {
        const taskStart = task.startDate
          ? new Date(task.startDate)
          : task.dueDate
            ? new Date(task.dueDate)
            : new Date();
        const taskEnd = task.dueDate
          ? new Date(task.dueDate)
          : addDays(taskStart, 1);

        // Clamp to visible range
        const visibleStart = dateMax([taskStart, startDate]);
        const visibleEnd = dateMin([taskEnd, endDate]);

        if (isAfter(visibleStart, endDate) || isBefore(visibleEnd, startDate)) {
          return null;
        }

        const barStart = Math.max(0, differenceInDays(visibleStart, startDate));
        const barDays = Math.max(1, differenceInDays(visibleEnd, visibleStart) + 1);

        return {
          ...task,
          barStart,
          barWidth: barDays,
        };
      })
      .filter(Boolean) as TimelineTask[];
  }, [tasks, startDate, endDate]);

  const handlePrev = () => setStartDate(addDays(startDate, -7));
  const handleNext = () => setStartDate(addDays(startDate, 7));
  const handleToday = () =>
    setStartDate(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
    setTaskDetailOpen(true);
  };

  const priorityColors: Record<string, string> = {
    P1: "bg-red-500/80",
    P2: "bg-orange-500/80",
    P3: "bg-blue-500/80",
    P4: "bg-gray-400/80",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-sm font-semibold">
          {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: `${240 + DAYS_TO_SHOW * DAY_WIDTH}px` }}>
          {/* Day headers */}
          <div className="flex border-b sticky top-0 bg-background z-10">
            <div className="w-[240px] shrink-0 border-r px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground">Task</span>
            </div>
            <div className="flex">
              {days.map((day, i) => {
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isToday =
                  format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col items-center justify-center border-r py-1",
                      isWeekend && "bg-muted/30",
                      isToday && "bg-primary/10"
                    )}
                    style={{ width: `${DAY_WIDTH}px` }}
                  >
                    <span className="text-[9px] text-muted-foreground">
                      {format(day, "EEE")}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isToday && "text-primary font-bold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Task rows */}
          {timelineTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">No tasks with dates in this range</p>
            </div>
          ) : (
            timelineTasks.map((task) => (
              <div key={task.id} className="flex border-b hover:bg-accent/30 group">
                {/* Task name */}
                <div className="w-[240px] shrink-0 border-r px-3 py-2 flex items-center gap-2">
                  <PriorityDot priority={task.priority} />
                  <button
                    onClick={() => handleTaskClick(task)}
                    className={cn(
                      "text-xs truncate text-left",
                      task.status === "DONE" && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </button>
                </div>

                {/* Gantt bar */}
                <div className="relative flex-1" style={{ height: "36px" }}>
                  {/* Day grid lines */}
                  <div className="absolute inset-0 flex">
                    {days.map((day, i) => {
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      return (
                        <div
                          key={i}
                          className={cn(
                            "border-r h-full",
                            isWeekend && "bg-muted/30"
                          )}
                          style={{ width: `${DAY_WIDTH}px` }}
                        />
                      );
                    })}
                  </div>

                  {/* Bar */}
                  <div
                    className={cn(
                      "absolute top-1.5 h-5 rounded-sm cursor-pointer transition-opacity hover:opacity-90",
                      priorityColors[task.priority] || "bg-blue-500/80",
                      task.status === "DONE" && "opacity-50"
                    )}
                    style={{
                      left: `${task.barStart * DAY_WIDTH + 2}px`,
                      width: `${Math.max(task.barWidth * DAY_WIDTH - 4, 8)}px`,
                    }}
                    onClick={() => handleTaskClick(task)}
                    title={`${task.title} (${task.startDate ? format(new Date(task.startDate), "MMM d") : ""} - ${task.dueDate ? format(new Date(task.dueDate), "MMM d") : ""})`}
                  >
                    <span className="text-[10px] text-white font-medium px-1 truncate block leading-5">
                      {task.title}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
