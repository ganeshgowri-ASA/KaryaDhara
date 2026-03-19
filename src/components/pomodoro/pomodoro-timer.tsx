"use client";

import { useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTimerStore, type TimerMode } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";

export function PomodoroTimer() {
  const {
    isRunning,
    mode,
    timeLeft,
    taskId,
    pomodoroCount,
    totalFocusTime,
    setIsRunning,
    setMode,
    tick,
    reset,
    startBreak,
    incrementPomodoroCount,
  } = useTimerStore();

  const { tasks } = useTaskStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTask = taskId ? tasks.find((t) => t.id === taskId) : null;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (mode === "pomodoro") {
        incrementPomodoroCount();
        // Auto-suggest break
      }
    }
  }, [timeLeft, isRunning, mode, setIsRunning, incrementPomodoroCount]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime =
    mode === "pomodoro" ? 25 * 60 : mode === "shortBreak" ? 5 * 60 : 15 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (t: number) => String(t).padStart(2, "0");
  const focusMinutes = Math.floor(totalFocusTime / 60);

  const modeConfig: Record<TimerMode, { label: string; color: string }> = {
    pomodoro: { label: "Focus", color: "text-red-500" },
    shortBreak: { label: "Short Break", color: "text-green-500" },
    longBreak: { label: "Long Break", color: "text-blue-500" },
  };

  if (!taskId) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-72 rounded-lg border bg-card p-4 shadow-lg">
      {/* Mode tabs */}
      <div className="flex gap-1 mb-3">
        {(["pomodoro", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-accent"
            )}
          >
            {modeConfig[m].label}
          </button>
        ))}
      </div>

      {/* Timer display */}
      <div className="text-center mb-3">
        <div className={cn("text-4xl font-mono font-bold", modeConfig[mode].color)}>
          {formatTime(minutes)}:{formatTime(seconds)}
        </div>
        {currentTask && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {currentTask.title}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-muted mb-3 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000",
            mode === "pomodoro"
              ? "bg-red-500"
              : mode === "shortBreak"
                ? "bg-green-500"
                : "bg-blue-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={reset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          className="h-10 w-10"
          onClick={() => setIsRunning(!isRunning)}
        >
          {isRunning ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => startBreak(pomodoroCount % 4 === 3)}
        >
          <Coffee className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Timer className="h-3 w-3" />
          {pomodoroCount} pomodoros
        </span>
        <span>{focusMinutes}m focused</span>
      </div>
    </div>
  );
}
