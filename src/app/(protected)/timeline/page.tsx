"use client";
import { useState, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, GanttChart } from "lucide-react";

interface Task { id: string; title: string; status: string; priority: string; dueDate: string | null; startDate: string | null; project?: { name: string; color: string } | null; }

const PRIORITY_COLORS: Record<string, string> = { P1: "bg-red-500", P2: "bg-orange-400", P3: "bg-blue-500", P4: "bg-gray-400" };
const STATUS_COLORS: Record<string, string> = { TODO: "bg-gray-300", IN_PROGRESS: "bg-blue-400", IN_REVIEW: "bg-yellow-400", DONE: "bg-green-500" };

export default function TimelinePage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<"week" | "month">("week");

  useEffect(() => {
    fetch("/api/tasks").then(r => r.json()).then(d => setTasks(d.tasks || d || []));
  }, []);

  const { startDate, days } = useMemo(() => {
    const now = new Date();
    const s = new Date(now);
    if (view === "week") {
      s.setDate(now.getDate() - now.getDay() + weekOffset * 7);
      return { startDate: s, days: 7 };
    }
    s.setDate(1); s.setMonth(now.getMonth() + weekOffset);
    return { startDate: s, days: new Date(s.getFullYear(), s.getMonth() + 1, 0).getDate() };
  }, [weekOffset, view]);

  const dateHeaders = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate); d.setDate(startDate.getDate() + i); return d;
  });

  const isToday = (d: Date) => { const t = new Date(); return d.toDateString() === t.toDateString(); };

  const getBarStyle = (task: Task) => {
    const start = task.startDate ? new Date(task.startDate) : task.dueDate ? new Date(new Date(task.dueDate).getTime() - 86400000 * 2) : null;
    const end = task.dueDate ? new Date(task.dueDate) : start ? new Date(start.getTime() + 86400000 * 3) : null;
    if (!start || !end) return null;
    const rangeStart = startDate.getTime();
    const rangeEnd = dateHeaders[dateHeaders.length - 1]?.getTime() + 86400000;
    if (end.getTime() < rangeStart || start.getTime() > rangeEnd) return null;
    const left = Math.max(0, (start.getTime() - rangeStart) / (rangeEnd - rangeStart) * 100);
    const right = Math.min(100, (end.getTime() - rangeStart) / (rangeEnd - rangeStart) * 100);
    return { left: `${left}%`, width: `${right - left}%` };
  };

  const tasksWithDates = tasks.filter(t => t.dueDate || t.startDate);

  return (
    <div className="p-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GanttChart className="h-7 w-7 text-indigo-600" />
          <div><h1 className="text-2xl font-bold">Timeline</h1><p className="text-sm text-muted-foreground">Gantt chart view of your tasks</p></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {(["week", "month"] as const).map(v => (<button key={v} onClick={() => { setView(v); setWeekOffset(0); }} className={`px-3 py-1 rounded text-sm font-medium transition ${view === v ? "bg-white shadow text-indigo-600" : "text-muted-foreground hover:text-foreground"}`}>{v === "week" ? "Week" : "Month"}</button>))}
          </div>
          <button onClick={() => setWeekOffset(o => o - 1)} className="p-2 rounded-lg hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setWeekOffset(0)} className="px-3 py-1 text-sm font-medium rounded-lg hover:bg-muted">Today</button>
          <button onClick={() => setWeekOffset(o => o + 1)} className="p-2 rounded-lg hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="border rounded-xl overflow-x-auto bg-white dark:bg-gray-900 shadow-sm">
        {/* Header row */}
        <div className="flex border-b sticky top-0 bg-gray-50 dark:bg-gray-800 z-10">
          <div className="w-64 min-w-[256px] px-4 py-3 font-semibold text-sm border-r">Task</div>
          <div className="flex-1 flex">
            {dateHeaders.map((d, i) => (<div key={i} className={`flex-1 min-w-[40px] px-1 py-3 text-center text-xs font-medium border-r ${isToday(d) ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600" : "text-muted-foreground"}`}><div>{d.toLocaleDateString("en", { weekday: "short" })}</div><div className={`text-base font-bold ${isToday(d) ? "text-indigo-600" : ""}`}>{d.getDate()}</div></div>))}
          </div>
        </div>

        {/* Task rows */}
        {tasksWithDates.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground"><Calendar className="h-12 w-12 mx-auto mb-3 opacity-40" /><p className="font-medium">No tasks with dates</p><p className="text-sm">Add start/due dates to your tasks to see them on the timeline</p></div>
        ) : tasksWithDates.map(task => {
          const bar = getBarStyle(task);
          return (
            <div key={task.id} className="flex border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
              <div className="w-64 min-w-[256px] px-4 py-3 border-r flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${PRIORITY_COLORS[task.priority] || "bg-gray-400"}`} />
                <span className="text-sm font-medium truncate">{task.title}</span>
              </div>
              <div className="flex-1 relative h-12">
                {dateHeaders.map((d, i) => (<div key={i} className={`absolute top-0 bottom-0 border-r ${isToday(d) ? "bg-indigo-50/50 dark:bg-indigo-900/10" : ""}`} style={{ left: `${(i / days) * 100}%`, width: `${100 / days}%` }} />))}
                {bar && (<div className={`absolute top-3 h-6 rounded-full ${STATUS_COLORS[task.status] || "bg-blue-400"} opacity-80 hover:opacity-100 transition cursor-pointer shadow-sm`} style={bar}><span className="px-2 text-xs text-white font-medium leading-6 truncate block">{task.title}</span></div>)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-300" />Todo</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" />In Progress</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-400" />In Review</span>
        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />Done</span>
      </div>
    </div>
  );
}
