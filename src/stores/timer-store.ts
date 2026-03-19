import { create } from "zustand";

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

interface TimerStore {
  isRunning: boolean;
  mode: TimerMode;
  timeLeft: number;
  taskId: string | null;
  pomodoroCount: number;
  totalFocusTime: number;

  setIsRunning: (running: boolean) => void;
  setMode: (mode: TimerMode) => void;
  setTimeLeft: (time: number) => void;
  setTaskId: (id: string | null) => void;
  tick: () => void;
  reset: () => void;
  startPomodoro: (taskId: string) => void;
  startBreak: (isLong: boolean) => void;
  incrementPomodoroCount: () => void;
}

const DURATIONS: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const useTimerStore = create<TimerStore>((set) => ({
  isRunning: false,
  mode: "pomodoro",
  timeLeft: DURATIONS.pomodoro,
  taskId: null,
  pomodoroCount: 0,
  totalFocusTime: 0,

  setIsRunning: (running) => set({ isRunning: running }),
  setMode: (mode) => set({ mode, timeLeft: DURATIONS[mode], isRunning: false }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setTaskId: (id) => set({ taskId: id }),
  tick: () =>
    set((s) => {
      if (s.timeLeft <= 0) return { isRunning: false };
      return {
        timeLeft: s.timeLeft - 1,
        totalFocusTime:
          s.mode === "pomodoro" ? s.totalFocusTime + 1 : s.totalFocusTime,
      };
    }),
  reset: () =>
    set((s) => ({ timeLeft: DURATIONS[s.mode], isRunning: false })),
  startPomodoro: (taskId) =>
    set({
      mode: "pomodoro",
      timeLeft: DURATIONS.pomodoro,
      taskId,
      isRunning: true,
    }),
  startBreak: (isLong) =>
    set({
      mode: isLong ? "longBreak" : "shortBreak",
      timeLeft: isLong ? DURATIONS.longBreak : DURATIONS.shortBreak,
      isRunning: true,
    }),
  incrementPomodoroCount: () =>
    set((s) => ({ pomodoroCount: s.pomodoroCount + 1 })),
}));
