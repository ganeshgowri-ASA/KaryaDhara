'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isToday } from 'date-fns';

interface CalendarTask {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
  projectColor?: string;
}

interface CalendarViewProps {
  tasks: CalendarTask[];
  onTaskClick?: (taskId: string) => void;
  onDateClick?: (date: Date) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  P1: 'bg-red-500', P2: 'bg-orange-500', P3: 'bg-blue-500', P4: 'bg-gray-400',
};

export function CalendarView({ tasks, onTaskClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);

  const days = useMemo(() => {
    const result: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [calStart, calEnd]);

  const tasksByDate = useMemo(() => {
    const map: Record<string, CalendarTask[]> = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const key = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(task);
      }
    });
    return map;
  }, [tasks]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold dark:text-white">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronLeft className="w-5 h-5 dark:text-gray-300" />
            </button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded dark:text-gray-300">
              Today
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <ChevronRight className="w-5 h-5 dark:text-gray-300" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('month')} className={`px-3 py-1 text-sm rounded ${view === 'month' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}>
            Month
          </button>
          <button onClick={() => setView('week')} className={`px-3 py-1 text-sm rounded ${view === 'week' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300'}`}>
            Week
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-b dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="px-2 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto">
        {days.map((day, i) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          return (
            <div
              key={i}
              className={`border-b border-r dark:border-gray-700 p-1 min-h-[100px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/30' : ''
              }`}
              onClick={() => onDateClick?.(day)}
            >
              <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                isCurrentDay ? 'bg-blue-500 text-white' : isCurrentMonth ? 'dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'
              }`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 ${
                      task.status === 'DONE'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 line-through'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}
                    onClick={(e) => { e.stopPropagation(); onTaskClick?.(task.id); }}
                  >
                    <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${PRIORITY_COLORS[task.priority] || 'bg-gray-400'}`} />
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500 px-1.5">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
