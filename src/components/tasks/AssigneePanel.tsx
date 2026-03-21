"use client";

import { useState, useEffect } from "react";
import { Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Assignee {
  id: string;
  user: { id: string; name: string | null; email: string };
  role: string;
}

export function AssigneePanel({ taskId }: { taskId: string }) {
  const [assignees, setAssignees] = useState<Assignee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (taskId) fetchAssignees();
  }, [taskId]);

  const fetchAssignees = async () => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/assignees`);
      if (res.ok) {
        const data = await res.json();
        setAssignees(data);
      }
    } catch (err) {
      console.error("Failed to fetch assignees", err);
    }
  };

  const addAssignee = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/assignees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setEmail("");
        setShowAdd(false);
        fetchAssignees();
      }
    } catch (err) {
      console.error("Failed to add assignee", err);
    } finally {
      setLoading(false);
    }
  };

  const removeAssignee = async (assigneeId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/assignees`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId }),
      });
      fetchAssignees();
    } catch (err) {
      console.error("Failed to remove assignee", err);
    }
  };

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
        <Users className="h-3 w-3" />
        Assignees ({assignees.length})
      </label>
      <div className="flex gap-1 flex-wrap mt-1">
        {assignees.map((a) => (
          <Badge key={a.id} variant="secondary" className="flex items-center gap-1 text-xs">
            <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
              {(a.user.name || a.user.email).charAt(0).toUpperCase()}
            </span>
            {a.user.name || a.user.email}
            <button onClick={() => removeAssignee(a.id)} className="ml-1 hover:text-destructive">
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {!showAdd && (
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setShowAdd(true)}>
            <Plus className="h-3 w-3 mr-1" /> Add
          </Button>
        )}
      </div>
      {showAdd && (
        <div className="flex gap-1 mt-2">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="User email..."
            className="flex-1 h-7 px-2 text-xs border rounded-md bg-background"
            onKeyDown={(e) => e.key === "Enter" && addAssignee()}
          />
          <Button size="sm" className="h-7 text-xs" onClick={addAssignee} disabled={loading}>
            Add
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowAdd(false)}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
