"use client";

import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Task completion trends and productivity metrics
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
