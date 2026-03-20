"use client";

import React from "react";
import {
  format,
  parseISO,
  differenceInDays,
  startOfDay,
  addDays,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  type Task,
  type TaskStatus,
  type TaskPriority,
} from "../../../types";

interface TimelineViewProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onPriorityChange: (taskId: string, priority: TaskPriority) => void;
}

const DAY_WIDTH = 40;
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 60;

export function TimelineView({
  tasks,
  onStatusChange,
}: TimelineViewProps) {
  const [timelineStart, setTimelineStart] = React.useState(() => {
    const today = startOfDay(new Date());
    return addDays(today, -7);
  });

  const timelineDays = 60;
  const timelineEnd = addDays(timelineStart, timelineDays);

  const days = React.useMemo(
    () => eachDayOfInterval({ start: timelineStart, end: timelineEnd }),
    [timelineStart, timelineEnd]
  );

  const navigate = (dir: "prev" | "next") => {
    setTimelineStart((s) => addDays(s, dir === "next" ? 14 : -14));
  };

  const goToday = () => {
    setTimelineStart(addDays(startOfDay(new Date()), -7));
  };

  const timelineTasks = React.useMemo(() => {
    return tasks
      .filter((t) => t.startDate || t.dueDate)
      .sort((a, b) => {
        const aDate = a.startDate || a.dueDate || a.createdAt;
        const bDate = b.startDate || b.dueDate || b.createdAt;
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });
  }, [tasks]);

  const getBarStyle = (task: Task) => {
    const start = task.startDate ? parseISO(task.startDate) : task.dueDate ? parseISO(task.dueDate) : null;
    const end = task.dueDate ? parseISO(task.dueDate) : start;
    if (!start || !end) return null;

    const startOffset = differenceInDays(startOfDay(start), timelineStart);
    const duration = Math.max(1, differenceInDays(startOfDay(end), startOfDay(start)) + 1);

    return {
      left: startOffset * DAY_WIDTH,
      width: duration * DAY_WIDTH - 4,
    };
  };

  const todayOffset = React.useMemo(
    () => differenceInDays(startOfDay(new Date()), timelineStart) * DAY_WIDTH,
    [timelineStart]
  );

  // Find dependency lines between tasks
  const dependencies = React.useMemo(() => {
    const lines: { from: Task; to: Task; fromIdx: number; toIdx: number }[] = [];
    timelineTasks.forEach((task, idx) => {
      task.blocks?.forEach((dep) => {
        const blockedIdx = timelineTasks.findIndex((t) => t.id === dep.blockedId);
        if (blockedIdx >= 0) {
          lines.push({
            from: task,
            to: timelineTasks[blockedIdx],
            fromIdx: idx,
            toIdx: blockedIdx,
          });
        }
      });
    });
    return lines;
  }, [timelineTasks]);

  const totalWidth = days.length * DAY_WIDTH;
  const totalHeight = HEADER_HEIGHT + timelineTasks.length * ROW_HEIGHT + 40;

  // Group days by month for header
  const months = React.useMemo(() => {
    const groups: { label: string; days: number; start: number }[] = [];
    let current = "";
    days.forEach((day, i) => {
      const label = format(day, "MMM yyyy");
      if (label !== current) {
        groups.push({ label, days: 1, start: i });
        current = label;
      } else {
        groups[groups.length - 1].days++;
      }
    });
    return groups;
  }, [days]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate("prev")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={goToday}>
          Today
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate("next")}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          {format(timelineStart, "MMM d")} - {format(timelineEnd, "MMM d, yyyy")}
        </span>
      </div>

      <div className="flex rounded-lg border overflow-hidden">
        {/* Task labels sidebar */}
        <div className="flex-shrink-0 w-[240px] border-r bg-muted/30">
          <div
            className="border-b px-3 flex items-center text-xs font-medium text-muted-foreground"
            style={{ height: HEADER_HEIGHT }}
          >
            Tasks
          </div>
          {timelineTasks.map((task) => (
            <div
              key={task.id}
              className="border-b px-3 flex items-center gap-2 hover:bg-muted/50 group"
              style={{ height: ROW_HEIGHT }}
            >
              <span className={cn("h-2 w-2 rounded-full flex-shrink-0", PRIORITY_COLORS[task.priority])} />
              <span className={cn(
                "text-xs truncate flex-1",
                task.status === "DONE" && "line-through text-muted-foreground"
              )}>
                {task.title}
              </span>
              {task.status !== "DONE" && (
                <button
                  onClick={() => onStatusChange(task.id, "DONE")}
                  className="text-[10px] text-muted-foreground hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                >
                  Done
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Timeline area */}
        <ScrollArea className="flex-1">
          <div style={{ width: totalWidth, minHeight: totalHeight }} className="relative">
            {/* Month headers */}
            <div className="sticky top-0 z-10 flex" style={{ height: HEADER_HEIGHT / 2 }}>
              {months.map((m) => (
                <div
                  key={m.label + m.start}
                  className="border-b border-r bg-muted/80 flex items-center justify-center text-xs font-medium"
                  style={{ width: m.days * DAY_WIDTH }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Day headers */}
            <div className="sticky top-0 z-10 flex" style={{ height: HEADER_HEIGHT / 2, marginTop: 0 }}>
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "border-b border-r flex flex-col items-center justify-center text-[10px]",
                    isToday(day) ? "bg-primary/10 font-bold" : "bg-muted/50",
                    [0, 6].includes(day.getDay()) && "bg-muted/70"
                  )}
                  style={{ width: DAY_WIDTH }}
                >
                  <span>{format(day, "d")}</span>
                </div>
              ))}
            </div>

            {/* Today line */}
            {todayOffset >= 0 && todayOffset <= totalWidth && (
              <div
                className="absolute z-20 w-0.5 bg-red-500"
                style={{
                  left: todayOffset + DAY_WIDTH / 2,
                  top: HEADER_HEIGHT,
                  height: totalHeight - HEADER_HEIGHT,
                }}
              />
            )}

            {/* Grid lines */}
            {days.map((day) => (
              <div
                key={`grid-${day.toISOString()}`}
                className={cn(
                  "absolute border-r",
                  [0, 6].includes(day.getDay()) && "bg-muted/20"
                )}
                style={{
                  left: differenceInDays(day, timelineStart) * DAY_WIDTH,
                  top: HEADER_HEIGHT,
                  width: DAY_WIDTH,
                  height: totalHeight - HEADER_HEIGHT,
                }}
              />
            ))}

            {/* Task bars */}
            {timelineTasks.map((task, idx) => {
              const barStyle = getBarStyle(task);
              if (!barStyle) return null;

              const isMilestone = barStyle.width <= DAY_WIDTH;

              return (
                <div
                  key={task.id}
                  className="absolute group"
                  style={{
                    left: barStyle.left + 2,
                    top: HEADER_HEIGHT + idx * ROW_HEIGHT + 8,
                    width: barStyle.width,
                    height: ROW_HEIGHT - 16,
                  }}
                >
                  {isMilestone ? (
                    <div
                      className={cn(
                        "h-full w-6 mx-auto transform rotate-45 rounded-sm border-2",
                        STATUS_COLORS[task.status].replace("bg-", "border-"),
                        "bg-card"
                      )}
                      title={`${task.title} (${STATUS_LABELS[task.status]})`}
                    />
                  ) : (
                    <div
                      className={cn(
                        "h-full rounded-md flex items-center px-2 text-[10px] text-white font-medium truncate cursor-default transition-opacity",
                        task.status === "DONE" ? "opacity-60" : "opacity-90 hover:opacity-100",
                        STATUS_COLORS[task.status]
                      )}
                      title={`${task.title} - ${PRIORITY_LABELS[task.priority]} - ${STATUS_LABELS[task.status]}`}
                    >
                      {barStyle.width > 60 && task.title}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Dependency arrows */}
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ width: totalWidth, height: totalHeight }}
            >
              {dependencies.map((dep, i) => {
                const fromBar = getBarStyle(dep.from);
                const toBar = getBarStyle(dep.to);
                if (!fromBar || !toBar) return null;

                const x1 = fromBar.left + fromBar.width + 2;
                const y1 = HEADER_HEIGHT + dep.fromIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
                const x2 = toBar.left + 2;
                const y2 = HEADER_HEIGHT + dep.toIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

                const midX = (x1 + x2) / 2;

                return (
                  <g key={`dep-${i}`}>
                    <path
                      d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="text-muted-foreground/50"
                      markerEnd="url(#arrowhead)"
                    />
                  </g>
                );
              })}
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 8 3, 0 6"
                    className="fill-muted-foreground/50"
                  />
                </marker>
              </defs>
            </svg>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium">Legend:</span>
        {(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as TaskStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className={cn("h-2.5 w-6 rounded-sm", STATUS_COLORS[s])} />
            {STATUS_LABELS[s]}
          </span>
        ))}
        <span className="flex items-center gap-1 ml-2">
          <span className="h-3 w-3 rotate-45 rounded-sm border-2 border-muted-foreground" />
          Milestone
        </span>
        <span className="flex items-center gap-1">
          <span className="w-4 h-0.5 bg-red-500" />
          Today
        </span>
      </div>

      {timelineTasks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No tasks with dates to display on the timeline.</p>
          <p className="text-sm mt-1">Set start dates and due dates on tasks to see them here.</p>
        </div>
      )}
    </div>
  );
}
