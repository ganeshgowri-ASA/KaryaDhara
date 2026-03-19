"use client";

import { useState } from "react";
import { Download, FileJson, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ExportPage() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (format: "json" | "csv") => {
    setIsExporting(format);
    try {
      const res = await fetch(`/api/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tasks-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // handle silently
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Export</h2>
        <p className="text-muted-foreground">
          Export your tasks for backup or integration with other apps
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5 text-blue-500" />
              JSON Export
            </CardTitle>
            <CardDescription>
              Full structured data export. Ideal for programmatic use and API
              integrations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExport("json")}
              disabled={isExporting !== null}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting === "json" ? "Exporting..." : "Download JSON"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              CSV Export
            </CardTitle>
            <CardDescription>
              Spreadsheet-compatible format. Opens in Excel, Google Sheets, and
              other tools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExport("csv")}
              disabled={isExporting !== null}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting === "csv" ? "Exporting..." : "Download CSV"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
