"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import {
  X,
  Calendar,
  Tag,
  Link2,
  Repeat,
  MessageSquare,
  Send,
  Trash2,
  ListTree,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";
import {
  useTaskStore,
  type TaskPriority,
  type TaskStatus,
} from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";
import { useUIStore } from "@/stores/ui-store";
import { Progress } from "@/components/ui/progress";

export function TaskDetail() {
  const { tasks, selectedTaskId, updateTaskApi, deleteTask, setSelectedTaskId } =
    useTaskStore();
  const { taskDetailOpen, setTaskDetailOpen } = useUIStore();
  const { labels } = useProjectStore();

  const task = tasks.find((t) => t.id === selectedTaskId) ||
    tasks.flatMap((t) => t.subtasks || []).find((s) => s.id === selectedTaskId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
    }
  }, [task]);

  const handleSaveTitle = useCallback(() => {
    if (task && title.trim() && title !== task.title) {
      updateTaskApi(task.id, { title: title.trim() });
    }
  }, [task, title, updateTaskApi]);

  const handleSaveDescription = useCallback(() => {
    if (task && description !== (task.description || "")) {
      updateTaskApi(task.id, { description });
    }
  }, [task, description, updateTaskApi]);

  const handleStatusChange = (status: TaskStatus) => {
    if (task) updateTaskApi(task.id, { status });
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    if (task) updateTaskApi(task.id, { priority });
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: task.id, content: newComment.trim() }),
    });
    setNewComment("");
    // Refresh task
    const { fetchTasks } = useTaskStore.getState();
    fetchTasks();
  };

  const handleClose = () => {
    setTaskDetailOpen(false);
    setSelectedTaskId(null);
  };

  if (!taskDetailOpen || !task) return null;

  const subtaskCount = task._count?.subtasks || task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((s) => s.status === "DONE").length || 0;
  const subtaskProgress =
    subtaskCount > 0 ? (completedSubtasks / subtaskCount) * 100 : 0;

  const statuses: TaskStatus[] = [
    "TODO",
    "IN_PROGRESS",
    "IN_REVIEW",
    "DONE",
  ];
  const priorities: TaskPriority[] = ["P1", "P2", "P3", "P4"];

  return (
    <div className="w-96 border-l bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-sm font-semibold">Task Details</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => {
              deleteTask(task.id);
              handleClose();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Title */}
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
            className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
          />

          {/* Status */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Status
            </label>
            <div className="flex gap-1 flex-wrap">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs transition-colors",
                    task.status === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-accent"
                  )}
                >
                  <StatusBadge status={s} />
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Priority
            </label>
            <div className="flex gap-1">
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => handlePriorityChange(p)}
                  className={cn(
                    "rounded-md px-2 py-1 transition-colors",
                    task.priority === p
                      ? "ring-2 ring-primary"
                      : "hover:bg-accent"
                  )}
                >
                  <PriorityBadge priority={p} />
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Due Date
            </label>
            <Input
              type="datetime-local"
              value={
                task.dueDate
                  ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm")
                  : ""
              }
              onChange={(e) =>
                updateTaskApi(task.id, {
                  dueDate: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="h-8 text-sm"
            />
          </div>

          {/* Project */}
          {task.project && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Project
              </label>
              <Badge
                variant="outline"
                style={{ borderColor: task.project.color }}
              >
                {task.project.name}
              </Badge>
            </div>
          )}

          {/* Labels */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Labels
            </label>
            <div className="flex gap-1 flex-wrap">
              {task.labels?.map((tl) => (
                <Badge
                  key={tl.label.id}
                  variant="outline"
                  className="text-xs"
                  style={{
                    borderColor: tl.label.color,
                    color: tl.label.color,
                  }}
                >
                  {tl.label.name}
                </Badge>
              ))}
              {labels
                .filter(
                  (l) => !task.labels?.some((tl) => tl.label.id === l.id)
                )
                .slice(0, 5)
                .map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      const currentIds =
                        task.labels?.map((tl) => tl.label.id) || [];
                      updateTaskApi(task.id, {
                        labels: [...currentIds, l.id] as unknown as undefined,
                      });
                    }}
                    className="text-xs px-1.5 py-0.5 rounded border border-dashed hover:bg-accent transition-colors text-muted-foreground"
                  >
                    + {l.name}
                  </button>
                ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveDescription}
              placeholder="Add a description..."
              className="min-h-[100px] text-sm"
            />
          </div>

          {/* Subtasks */}
          {subtaskCount > 0 && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <ListTree className="h-3 w-3" />
                Subtasks ({completedSubtasks}/{subtaskCount})
              </label>
              <Progress value={subtaskProgress} className="h-1.5 mb-2" />
              {task.subtasks?.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 py-1 text-sm"
                >
                  <button
                    onClick={() =>
                      updateTaskApi(st.id, {
                        status: st.status === "DONE" ? "TODO" : "DONE",
                      })
                    }
                    className={cn(
                      "h-4 w-4 rounded-sm border flex items-center justify-center text-xs",
                      st.status === "DONE" && "bg-primary text-primary-foreground"
                    )}
                  >
                    {st.status === "DONE" && "✓"}
                  </button>
                  <span
                    className={cn(
                      st.status === "DONE" && "line-through text-muted-foreground"
                    )}
                  >
                    {st.title}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Dependencies */}
          {((task.blockedBy && task.blockedBy.length > 0) ||
            (task.blocks && task.blocks.length > 0)) && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                Dependencies
              </label>
              {task.blockedBy?.map((dep) => (
                <div key={dep.id} className="text-sm text-muted-foreground py-0.5">
                  Blocked by: {dep.blocking.title}
                </div>
              ))}
              {task.blocks?.map((dep) => (
                <div key={dep.id} className="text-sm text-muted-foreground py-0.5">
                  Blocks: {dep.blocked.title}
                </div>
              ))}
            </div>
          )}

          {/* Recurrence */}
          {task.recurrence && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Repeat className="h-3 w-3" />
                Recurrence
              </label>
              <p className="text-sm">
                {(task.recurrence as unknown as Record<string, string>).type || "Custom"}
              </p>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Comments
            </label>

            {task.comments?.map((comment) => (
              <div key={comment.id} className="mb-3 p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {comment.user?.name || "User"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(comment.createdAt), "MMM d, h:mm a")}
                  </span>
                  {comment.isEdited && (
                    <span className="text-[10px] text-muted-foreground">
                      (edited)
                    </span>
                  )}
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="h-8 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
              <Button
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
              >
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Activity */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Created: {format(new Date(task.createdAt), "MMM d, yyyy h:mm a")}</p>
            <p>Updated: {format(new Date(task.updatedAt), "MMM d, yyyy h:mm a")}</p>
            {task.completedAt && (
              <p>
                Completed:{" "}
                {format(new Date(task.completedAt), "MMM d, yyyy h:mm a")}
              </p>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
