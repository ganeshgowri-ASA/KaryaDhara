"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { useTaskStore } from "../../../stores/task-store";

interface Suggestion {
  subtasks: { title: string; priority: string }[];
  priority: { priority: string; reason: string };
}

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("P3");
  const [status, setStatus] = useState("TODO");
  const [dueDate, setDueDate] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<string>("");
  const [suggestions, setSuggestions] = useState<Suggestion | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState<string[]>([]);

  const { createTask, loading } = useTaskStore();

  const fetchSuggestions = async () => {
    if (!title.trim()) return;
    setLoadingSuggestions(true);
    try {
      const res = await fetch("/api/tasks/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, dueDate }),
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
        if (data.priority) {
          setPriority(data.priority.priority);
        }
      }
    } catch {
      // Silently fail
    }
    setLoadingSuggestions(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    const recurrence = recurrenceType
      ? { type: recurrenceType, interval: 1 }
      : undefined;

    const task = await createTask({
      title,
      description: description || undefined,
      priority,
      status,
      dueDate: dueDate || undefined,
      recurrence: recurrence as Record<string, unknown> | undefined,
    });

    if (task && selectedSubtasks.length > 0) {
      for (const subtaskTitle of selectedSubtasks) {
        await fetch(`/api/tasks/${task.id}/subtasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: subtaskTitle }),
        });
      }
    }

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("P3");
    setStatus("TODO");
    setDueDate("");
    setRecurrenceType("");
    setSuggestions(null);
    setSelectedSubtasks([]);
  };

  const toggleSubtask = (title: string) => {
    setSelectedSubtasks((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task with optional AI-powered suggestions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={fetchSuggestions}
                disabled={!title.trim() || loadingSuggestions}
                title="Get AI suggestions"
              >
                {loadingSuggestions ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="P1">P1 - Urgent</SelectItem>
                  <SelectItem value="P2">P2 - High</SelectItem>
                  <SelectItem value="P3">P3 - Medium</SelectItem>
                  <SelectItem value="P4">P4 - Low</SelectItem>
                </SelectContent>
              </Select>
              {suggestions?.priority && (
                <p className="mt-1 text-xs text-muted-foreground">
                  AI: {suggestions.priority.reason}
                </p>
              )}
            </div>

            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="IN_REVIEW">In Review</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Recurrence</Label>
              <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {suggestions?.subtasks && suggestions.subtasks.length > 0 && (
            <div>
              <Label className="flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Suggested Subtasks
              </Label>
              <div className="mt-2 space-y-1.5">
                {suggestions.subtasks.map((st, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 rounded-md border p-2 text-sm cursor-pointer hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubtasks.includes(st.title)}
                      onChange={() => toggleSubtask(st.title)}
                      className="rounded"
                    />
                    <span className="flex-1">{st.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {st.priority}
                    </Badge>
                  </label>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Create Task
            {selectedSubtasks.length > 0 &&
              ` with ${selectedSubtasks.length} subtask(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
