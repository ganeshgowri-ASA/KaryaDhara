"use client";

import { useState, useEffect } from "react";
import { CalendarView } from "@/components/calendar/CalendarView";
import { useWorkspace } from "@/hooks/useWorkspace";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CalendarTask = any;

export default function CalendarPage() {
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<CalendarTask[]>([]);

  useEffect(() => {
    if (!currentWorkspace?.id) return;
    fetch(`/api/tasks?workspaceId=${currentWorkspace.id}`)
      .then(res => res.json())
      .then(data => setTasks(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [currentWorkspace?.id]);

  return (
    <div className="h-full">
      <CalendarView
        tasks={tasks}
        onTaskClick={() => {}}
        onDateClick={() => {}}
      />
    </div>
  );
}
