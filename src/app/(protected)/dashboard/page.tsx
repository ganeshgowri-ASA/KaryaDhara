"use client";

import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { TaskList } from "@/components/tasks/task-list";
import { TaskCreateDialog } from "@/components/tasks/task-create-dialog";
import { TaskFilters } from "@/components/tasks/task-filters";
import { LabelManager } from "@/components/labels/label-manager";
import { SearchPanel } from "@/components/search/search-panel";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { ExportButton } from "@/components/export/export-button";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "User"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton />
          <TaskCreateDialog />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground">
          <TabsTrigger
            value="overview"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
          >
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="search"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
          >
            Search
          </TabsTrigger>
          <TabsTrigger
            value="labels"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
          >
            Labels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskFilters />
          <TaskList />
        </TabsContent>

        <TabsContent value="search">
          <SearchPanel />
        </TabsContent>

        <TabsContent value="labels">
          <LabelManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
