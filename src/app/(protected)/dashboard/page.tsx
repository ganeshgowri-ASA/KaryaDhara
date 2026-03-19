"use client";

import { useSession } from "next-auth/react";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

export default function DashboardPage() {
  useSession();

  return (
    <div className="flex flex-col h-full">
      <AnalyticsDashboard />
    </div>
  );
}
