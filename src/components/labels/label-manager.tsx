"use client";

import { useState, useEffect } from "react";
import { useLabelStore } from "../../../stores/label-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, X, Check, Loader2 } from "lucide-react";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#94a3b8",
];

export function LabelManager({ workspaceId }: { workspaceId?: string }) {
  const { labels, loading, fetchLabels, createLabel, patchLabel, deleteLabel } =
    useLabelStore();
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  useEffect(() => {
    fetchLabels(workspaceId);
  }, [fetchLabels, workspaceId]);

  const handleCreate = async () => {
    if (!newName.trim() || !workspaceId) return;
    await createLabel({
      name: newName.trim(),
      color: newColor,
      workspaceId,
    });
    setNewName("");
    setNewColor("#6366f1");
  };

  const handleEdit = async (id: string) => {
    await patchLabel(id, { name: editName, color: editColor });
    setEditingId(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Labels</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create label */}
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New label name"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <div className="flex gap-1">
            {PRESET_COLORS.slice(0, 5).map((c) => (
              <button
                key={c}
                className={`h-8 w-8 rounded-md border-2 ${newColor === c ? "border-foreground" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                onClick={() => setNewColor(c)}
              />
            ))}
          </div>
          <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Label list */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : labels.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No labels yet. Create one above.
          </p>
        ) : (
          <div className="space-y-2">
            {labels.map((label) =>
              editingId === label.id ? (
                <div key={label.id} className="flex items-center gap-2 p-2 rounded border">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 h-8"
                  />
                  <div className="flex gap-1">
                    {PRESET_COLORS.slice(0, 5).map((c) => (
                      <button
                        key={c}
                        className={`h-6 w-6 rounded border-2 ${editColor === c ? "border-foreground" : "border-transparent"}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setEditColor(c)}
                      />
                    ))}
                  </div>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(label.id)}>
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div
                  key={label.id}
                  className="flex items-center justify-between p-2 rounded border"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <Badge
                      variant="outline"
                      style={{ borderColor: label.color, color: label.color }}
                    >
                      {label.name}
                    </Badge>
                    {label._count && (
                      <span className="text-xs text-muted-foreground">
                        {label._count.tasks} tasks
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingId(label.id);
                        setEditName(label.name);
                        setEditColor(label.color);
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteLabel(label.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
