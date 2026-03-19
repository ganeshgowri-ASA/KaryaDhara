"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react";

interface ExportButtonProps {
  projectId?: string;
  status?: string;
}

export function ExportButton({ projectId, status }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "json" | "csv") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ format });
      if (projectId) params.set("projectId", projectId);
      if (status) params.set("status", status);

      const res = await fetch(`/api/tasks/export?${params}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      // Silently fail
    }
    setLoading(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-1 h-4 w-4" />
          )}
          Export
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => handleExport("json")}
          >
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => handleExport("csv")}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export as CSV
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
