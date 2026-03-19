"use client";

import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskList } from "@/components/tasks/task-list";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { SearchPanel } from "@/components/search/search-panel";
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";
import { LabelManager } from "@/components/labels/label-manager";
import { ExportButton } from "@/components/export/export-button";
import {
  ListTodo,
  BarChart3,
  Search,
  Tags,
} from "lucide-react";

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
          <CreateTaskDialog />
        </div>
      </div>

      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-1.5">
            <ListTodo className="h-4 w-4" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="search" className="gap-1.5">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="labels" className="gap-1.5">
            <Tags className="h-4 w-4" />
            Labels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <TaskList />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
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
