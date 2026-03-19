"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: "json" | "csv") => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().split("T")[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={() => handleExport("json")}
          >
            <FileJson className="mr-2 h-4 w-4" />
            Export as JSON
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
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
