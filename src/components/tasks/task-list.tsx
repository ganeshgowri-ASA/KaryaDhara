"use client";

import { useEffect } from "react";
import { useTaskStore, type Task, type TaskStatus } from "@/stores/task-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Repeat,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; icon: React.ReactNode; color: string }
> = {
  TODO: { label: "To Do", icon: <Circle className="h-3.5 w-3.5" />, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  IN_PROGRESS: { label: "In Progress", icon: <Clock className="h-3.5 w-3.5" />, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  IN_REVIEW: { label: "In Review", icon: <Clock className="h-3.5 w-3.5" />, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" },
  DONE: { label: "Done", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  CANCELLED: { label: "Cancelled", icon: <Circle className="h-3.5 w-3.5" />, color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  ARCHIVED: { label: "Archived", icon: <Circle className="h-3.5 w-3.5" />, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  P1: { label: "Urgent", color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" },
  P2: { label: "High", color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  P3: { label: "Medium", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  P4: { label: "Low", color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

function TaskItem({ task }: { task: Task }) {
  const { editTask, deleteTask, generateSubtasks, suggestPriority } =
    useTaskStore();

  const statusConfig = STATUS_CONFIG[task.status];
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE" &&
    task.status !== "CANCELLED";

  const handleStatusChange = (newStatus: string) => {
    editTask(task.id, { status: newStatus as TaskStatus });
  };

  const handleGenerateSubtasks = async () => {
    const subtasks = await generateSubtasks(task.id);
    if (subtasks.length > 0) {
      for (const st of subtasks) {
        await useTaskStore.getState().createTask({
          title: st.title,
          parentId: task.id,
          priority: task.priority,
        });
      }
    }
  };

  const handleSuggestPriority = async () => {
    const priority = await suggestPriority(task.id);
    if (priority && priority !== task.priority) {
      editTask(task.id, { priority });
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{task.title}</span>
          {task.recurrence && (
            <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {isOverdue && (
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
          )}
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={priorityConfig.color}>
            {priorityConfig.label}
          </Badge>
          <Badge variant="outline" className={statusConfig.color}>
            <span className="mr-1">{statusConfig.icon}</span>
            {statusConfig.label}
          </Badge>
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {task.labels?.map((label) => (
            <Badge
              key={label.id}
              variant="outline"
              className="text-xs"
              style={{
                borderColor: label.color,
                color: label.color,
              }}
            >
              {label.name}
            </Badge>
          ))}
          {task._count && task._count.subtasks > 0 && (
            <span className="text-xs text-muted-foreground">
              {task._count.subtasks} subtask(s)
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Select value={task.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-7 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleSuggestPriority}
          title="AI: Suggest priority"
        >
          <Sparkles className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleGenerateSubtasks}
          title="AI: Generate subtasks"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={() => deleteTask(task.id)}
          title="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TaskList() {
  const { tasks, isLoading, error, pagination, fetchTasks, setPagination } =
    useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Error: {error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchTasks}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && tasks.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            No tasks found. Create your first task!
          </p>
        ) : (
          <>
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={pagination.page <= 1}
                    onClick={() => {
                      setPagination({ page: pagination.page - 1 });
                      fetchTasks();
                    }}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => {
                      setPagination({ page: pagination.page + 1 });
                      fetchTasks();
                    }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
