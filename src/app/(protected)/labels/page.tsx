"use client";

import { LabelManager } from "@/components/labels/label-manager";

export default function LabelsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Labels</h2>
        <p className="text-muted-foreground">
          Create and manage color-coded labels for your tasks
        </p>
      </div>

      <LabelManager />
    </div>
  );
}
