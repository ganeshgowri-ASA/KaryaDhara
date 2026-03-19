"use client";

import { useEffect, useState } from "react";
import { useLabelStore, type Label } from "@/stores/label-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label as FormLabel } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16",
  "#22c55e", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#d946ef", "#ec4899", "#94a3b8",
];

function LabelForm({
  initialName = "",
  initialColor = "#6366f1",
  onSubmit,
  submitLabel = "Create",
}: {
  initialName?: string;
  initialColor?: string;
  onSubmit: (name: string, color: string) => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormLabel>Name</FormLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Label name..."
        />
      </div>
      <div className="space-y-2">
        <FormLabel>Color</FormLabel>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`h-7 w-7 rounded-full border-2 transition-transform ${
                color === c ? "scale-110 border-foreground" : "border-transparent"
              }`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <Input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-8 w-20"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Preview:</span>
        <Badge style={{ backgroundColor: color, color: "#fff" }}>
          {name || "Label"}
        </Badge>
      </div>
      <Button
        className="w-full"
        disabled={!name.trim()}
        onClick={() => onSubmit(name.trim(), color)}
      >
        {submitLabel}
      </Button>
    </div>
  );
}

function LabelItem({ label }: { label: Label }) {
  const { editLabel, deleteLabel } = useLabelStore();
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex items-center justify-between rounded-lg border p-2.5">
      <div className="flex items-center gap-2">
        <div
          className="h-3.5 w-3.5 rounded-full"
          style={{ backgroundColor: label.color }}
        />
        <span className="text-sm font-medium">{label.name}</span>
        {label._count && (
          <span className="text-xs text-muted-foreground">
            {label._count.tasks} task(s)
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Label</DialogTitle>
              <DialogDescription>Update the label name and color.</DialogDescription>
            </DialogHeader>
            <LabelForm
              initialName={label.name}
              initialColor={label.color}
              submitLabel="Save Changes"
              onSubmit={async (name, color) => {
                await editLabel(label.id, { name, color });
                setEditing(false);
              }}
            />
          </DialogContent>
        </Dialog>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={() => deleteLabel(label.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function LabelManager() {
  const { labels, isLoading, fetchLabels, createLabel } = useLabelStore();
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Tag className="h-4 w-4" />
            Labels
          </CardTitle>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-1 h-3.5 w-3.5" />
                New Label
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Label</DialogTitle>
                <DialogDescription>Add a color-coded label to organize your tasks.</DialogDescription>
              </DialogHeader>
              <LabelForm
                onSubmit={async (name, color) => {
                  await createLabel({
                    name,
                    color,
                    workspaceId: "default",
                  });
                  setCreateOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && labels.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : labels.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No labels yet. Create one to organize your tasks.
          </p>
        ) : (
          labels.map((label) => <LabelItem key={label.id} label={label} />)
        )}
      </CardContent>
    </Card>
  );
}
