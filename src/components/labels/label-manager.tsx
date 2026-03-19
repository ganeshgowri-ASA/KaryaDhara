"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useLabelStore, Label } from "@/stores/label-store";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
  "#94a3b8",
];

interface LabelManagerProps {
  workspaceId?: string;
}

export function LabelManager({ workspaceId }: LabelManagerProps) {
  const { labels, createLabel, deleteLabel } = useLabelStore();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newName.trim() || !workspaceId) return;
    setIsCreating(true);
    await createLabel({ name: newName.trim(), color: newColor, workspaceId });
    setNewName("");
    setNewColor("#3b82f6");
    setIsCreating(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Labels</CardTitle>
        <CardDescription>
          Color-coded labels for organizing tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Input
              placeholder="Label name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
          <div className="flex gap-1">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: newColor === color ? "white" : "transparent",
                  boxShadow:
                    newColor === color ? `0 0 0 2px ${color}` : "none",
                }}
                onClick={() => setNewColor(color)}
              />
            ))}
          </div>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!newName.trim() || isCreating}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {labels.map((label: Label) => (
            <Badge
              key={label.id}
              variant="outline"
              className="group flex items-center gap-1.5 px-3 py-1"
              style={{ borderColor: label.color, color: label.color }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: label.color }}
              />
              {label.name}
              {label._count && (
                <span className="text-muted-foreground">
                  ({label._count.tasks})
                </span>
              )}
              <button
                className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => deleteLabel(label.id)}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {labels.length === 0 && (
            <p className="text-sm text-muted-foreground">No labels yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
