"use client";
import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, Edit2, Check, X, Clock } from "lucide-react";

interface RecurringTask {
  id: string;
  title: string;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  customDays?: number;
  nextDue: string;
  lastCompleted: string | null;
  completedCount: number;
  active: boolean;
  priority: "P1" | "P2" | "P3" | "P4";
}

const FREQ_LABELS = { daily: "Every day", weekly: "Every week", monthly: "Every month", custom: "Custom" };
const PRIORITY_COLORS = { P1: "bg-red-100 text-red-700", P2: "bg-orange-100 text-orange-700", P3: "bg-blue-100 text-blue-700", P4: "bg-gray-100 text-gray-700" };

export default function RecurringTasksPage() {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<RecurringTask["frequency"]>("daily");
  const [priority, setPriority] = useState<RecurringTask["priority"]>("P3");
  const [customDays, setCustomDays] = useState(3);

  useEffect(() => {
    const saved = localStorage.getItem("kd-recurring");
    if (saved) setTasks(JSON.parse(saved));
    else {
      const defaults: RecurringTask[] = [
        { id: "1", title: "Daily standup notes", frequency: "daily", nextDue: new Date().toISOString(), lastCompleted: null, completedCount: 0, active: true, priority: "P2" },
        { id: "2", title: "Weekly review", frequency: "weekly", nextDue: new Date().toISOString(), lastCompleted: null, completedCount: 0, active: true, priority: "P1" },
        { id: "3", title: "Monthly report", frequency: "monthly", nextDue: new Date().toISOString(), lastCompleted: null, completedCount: 0, active: true, priority: "P2" },
      ];
      setTasks(defaults);
    }
  }, []);

  useEffect(() => {
    if (tasks.length > 0) localStorage.setItem("kd-recurring", JSON.stringify(tasks));
  }, [tasks]);

  const getNextDue = (freq: RecurringTask["frequency"], days?: number) => {
    const d = new Date();
    if (freq === "daily") d.setDate(d.getDate() + 1);
    else if (freq === "weekly") d.setDate(d.getDate() + 7);
    else if (freq === "monthly") d.setMonth(d.getMonth() + 1);
    else if (freq === "custom" && days) d.setDate(d.getDate() + days);
    return d.toISOString();
  };

  const addTask = () => {
    if (!title.trim()) return;
    const task: RecurringTask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      frequency,
      customDays: frequency === "custom" ? customDays : undefined,
      nextDue: getNextDue(frequency, customDays),
      lastCompleted: null,
      completedCount: 0,
      active: true,
      priority,
    };
    setTasks((prev) => [...prev, task]);
    setTitle("");
    setShowAdd(false);
  };

  const completeTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, lastCompleted: new Date().toISOString(), completedCount: t.completedCount + 1, nextDue: getNextDue(t.frequency, t.customDays) }
          : t
      )
    );
  };

  const toggleActive = (id: string) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
  const deleteTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const isDue = (task: RecurringTask) => new Date(task.nextDue) <= new Date();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RefreshCw className="w-6 h-6 text-green-600" /> Recurring Tasks
        </h1>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 hover:bg-green-700">
          <Plus className="w-4 h-4" /> Add Recurring
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">{tasks.filter((t) => t.active).length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-sm text-gray-500">Due Today</p>
          <p className="text-2xl font-bold text-red-600">{tasks.filter((t) => t.active && isDue(t)).length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4">
          <p className="text-sm text-gray-500">Total Completions</p>
          <p className="text-2xl font-bold text-blue-600">{tasks.reduce((s, t) => s + t.completedCount, 0)}</p>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 space-y-3">
          <h3 className="font-semibold">New Recurring Task</h3>
          <input type="text" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg bg-transparent" />
          <div className="flex gap-3">
            <select value={frequency} onChange={(e) => setFrequency(e.target.value as RecurringTask["frequency"])} className="px-3 py-2 border rounded-lg bg-transparent">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom</option>
            </select>
            {frequency === "custom" && (
              <input type="number" min={1} value={customDays} onChange={(e) => setCustomDays(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg bg-transparent" placeholder="Days" />
            )}
            <select value={priority} onChange={(e) => setPriority(e.target.value as RecurringTask["priority"])} className="px-3 py-2 border rounded-lg bg-transparent">
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addTask} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add</button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border divide-y">
        {tasks.length === 0 ? (
          <p className="p-8 text-center text-gray-500">No recurring tasks yet</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className={`p-4 flex items-center gap-4 ${!task.active ? "opacity-50" : ""}`}>
              <button
                onClick={() => completeTask(task.id)}
                disabled={!task.active}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isDue(task) && task.active ? "border-green-500 text-green-500 hover:bg-green-50" : "border-gray-300 text-gray-300"
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{task.title}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}>{task.priority}</span>
                  {isDue(task) && task.active && <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-600">Due</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> {FREQ_LABELS[task.frequency]}{task.frequency === "custom" ? ` (${task.customDays}d)` : ""}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Next: {new Date(task.nextDue).toLocaleDateString()}</span>
                  <span>Completed: {task.completedCount}x</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleActive(task.id)} className={`p-1.5 rounded ${task.active ? "text-green-500" : "text-gray-400"} hover:bg-gray-100`}>
                  {task.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
                <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
