"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || "User"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{session?.user?.role || "Member"}</p>
            <CardDescription>Your access level</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Timezone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{session?.user?.timezone || "UTC"}</p>
            <CardDescription>Current timezone</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <CardDescription>Active tasks</CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
