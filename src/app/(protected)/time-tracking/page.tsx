"use client";
import { useState, useEffect, useCallback } from "react";
import { Play, Pause, Square, Clock, Plus, Trash2, BarChart3 } from "lucide-react";

interface TimeEntry {
  id: string;
  taskName: string;
  project: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  isRunning: boolean;
}

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [taskName, setTaskName] = useState("");
  const [project, setProject] = useState("");
  const [view, setView] = useState<"timer" | "log" | "reports">("timer");

  useEffect(() => {
    const saved = localStorage.getItem("kd-time-entries");
    if (saved) setEntries(JSON.parse(saved));
    const active = localStorage.getItem("kd-active-timer");
    if (active) {
      const a = JSON.parse(active);
      setActiveEntry(a);
      setTaskName(a.taskName);
      setProject(a.project);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("kd-time-entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    if (!activeEntry) return;
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(activeEntry.startTime).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [activeEntry]);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const startTimer = () => {
    if (!taskName.trim()) return;
    const entry: TimeEntry = {
      id: crypto.randomUUID(),
      taskName: taskName.trim(),
      project: project.trim() || "General",
      startTime: new Date().toISOString(),
      endTime: null,
      duration: 0,
      isRunning: true,
    };
    setActiveEntry(entry);
    setElapsed(0);
    localStorage.setItem("kd-active-timer", JSON.stringify(entry));
  };

  const stopTimer = () => {
    if (!activeEntry) return;
    const now = new Date();
    const dur = Math.floor((now.getTime() - new Date(activeEntry.startTime).getTime()) / 1000);
    const finished = { ...activeEntry, endTime: now.toISOString(), duration: dur, isRunning: false };
    setEntries((prev) => [finished, ...prev]);
    setActiveEntry(null);
    setElapsed(0);
    localStorage.removeItem("kd-active-timer");
  };

  const deleteEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const totalToday = entries
    .filter((e) => new Date(e.startTime).toDateString() === new Date().toDateString())
    .reduce((sum, e) => sum + e.duration, 0);

  const totalWeek = entries
    .filter((e) => {
      const d = new Date(e.startTime);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 86400000);
      return d >= weekAgo;
    })
    .reduce((sum, e) => sum + e.duration, 0);

  const projectTotals = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.project] = (acc[e.project] || 0) + e.duration;
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" /> Time Tracking
        </h1>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(["timer", "log", "reports"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                view === v ? "bg-white dark:bg-gray-700 shadow-sm" : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-2xl font-bold text-blue-600">{fmt(totalToday)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-sm text-gray-500">This Week</p>
          <p className="text-2xl font-bold text-green-600">{fmt(totalWeek)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-sm text-gray-500">Total Entries</p>
          <p className="text-2xl font-bold text-purple-600">{entries.length}</p>
        </div>
      </div>

      {view === "timer" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-4">
          <div className="text-center">
            <p className="text-6xl font-mono font-bold text-gray-800 dark:text-gray-100">{fmt(elapsed)}</p>
            {activeEntry && <p className="text-sm text-gray-500 mt-2">{activeEntry.taskName} - {activeEntry.project}</p>}
          </div>
          {!activeEntry ? (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="What are you working on?"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-transparent"
              />
              <input
                type="text"
                placeholder="Project (optional)"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-transparent"
              />
              <button onClick={startTimer} className="w-full py-3 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700">
                <Play className="w-5 h-5" /> Start Timer
              </button>
            </div>
          ) : (
            <button onClick={stopTimer} className="w-full py-3 bg-red-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-700">
              <Square className="w-5 h-5" /> Stop Timer
            </button>
          )}
        </div>
      )}

      {view === "log" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border divide-y">
          {entries.length === 0 ? (
            <p className="p-8 text-center text-gray-500">No time entries yet. Start tracking!</p>
          ) : (
            entries.map((e) => (
              <div key={e.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{e.taskName}</p>
                  <p className="text-sm text-gray-500">{e.project} • {new Date(e.startTime).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm">{fmt(e.duration)}</span>
                  <button onClick={() => deleteEntry(e.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {view === "reports" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Time by Project</h3>
            {Object.keys(projectTotals).length === 0 ? (
              <p className="text-gray-500">No data yet</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(projectTotals)
                  .sort((a, b) => b[1] - a[1])
                  .map(([proj, dur]) => {
                    const max = Math.max(...Object.values(projectTotals));
                    return (
                      <div key={proj}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{proj}</span>
                          <span className="font-mono">{fmt(dur)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(dur / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
