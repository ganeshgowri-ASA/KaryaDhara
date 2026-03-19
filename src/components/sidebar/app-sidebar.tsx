"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Inbox,
  Sun,
  Filter,
  Tag,
  FolderKanban,
  Plus,
  LayoutList,
  Columns3,
  CalendarDays,
  GanttChart,
  ChevronLeft,
  ChevronRight,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProjectStore } from "@/stores/project-store";
import { useUIStore } from "@/stores/ui-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const { data: session } = useSession();
  const { sidebarOpen, toggleSidebar, selectedView, setSelectedView, viewMode, setViewMode } =
    useUIStore();
  const { projects, labels, fetchProjects, fetchLabels, setActiveProjectId } =
    useProjectStore();

  useEffect(() => {
    fetchProjects();
    fetchLabels();
  }, [fetchProjects, fetchLabels]);

  const navItems = [
    { id: "inbox", label: "Inbox", icon: Inbox, href: "/dashboard" },
    { id: "my-day", label: "My Day", icon: Sun, href: "/dashboard" },
    { id: "filters", label: "Filters", icon: Filter, href: "/dashboard" },
  ];

  const handleNavClick = (id: string) => {
    setSelectedView(id);
    if (id === "my-day") {
      setViewMode("my-day");
    } else if (id === "inbox") {
      setViewMode("list");
    }
    setActiveProjectId(null);
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedView(`project-${projectId}`);
    setActiveProjectId(projectId);
  };

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-300",
        sidebarOpen ? "w-64" : "w-14"
      )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-3">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">
                {session?.user?.name || "User"}
              </p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Nav Items */}
          {navItems.map((item) => (
            <Link key={item.id} href={item.href}>
              <button
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                  selectedView === item.id &&
                    "bg-accent text-accent-foreground font-medium"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            </Link>
          ))}

          {/* View Toggle */}
          {sidebarOpen && (
            <div className="flex flex-wrap items-center gap-1 px-3 py-2">
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 flex-1 text-xs min-w-0"
                onClick={() => setViewMode("list")}
              >
                <LayoutList className="mr-1 h-3 w-3" />
                List
              </Button>
              <Button
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 flex-1 text-xs min-w-0"
                onClick={() => setViewMode("kanban")}
              >
                <Columns3 className="mr-1 h-3 w-3" />
                Board
              </Button>
              <Button
                variant={viewMode === "calendar" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 flex-1 text-xs min-w-0"
                onClick={() => setViewMode("calendar")}
              >
                <CalendarDays className="mr-1 h-3 w-3" />
                Cal
              </Button>
              <Button
                variant={viewMode === "timeline" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 flex-1 text-xs min-w-0"
                onClick={() => setViewMode("timeline")}
              >
                <GanttChart className="mr-1 h-3 w-3" />
                Gantt
              </Button>
            </div>
          )}

          {/* Projects */}
          {sidebarOpen && (
            <div className="pt-4">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Projects
                </span>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => setSelectedView("new-project")}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              {projects.map((project) => (
                <Link key={project.id} href="/dashboard">
                  <button
                    onClick={() => handleProjectClick(project.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                      selectedView === `project-${project.id}` &&
                        "bg-accent font-medium"
                    )}
                  >
                    <FolderKanban
                      className="h-4 w-4 shrink-0"
                      style={{ color: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                    {project._count && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {project._count.tasks}
                      </span>
                    )}
                  </button>
                </Link>
              ))}
            </div>
          )}

          {/* Labels */}
          {sidebarOpen && labels.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-xs font-semibold uppercase text-muted-foreground">
                  Labels
                </span>
                <Tag className="h-3 w-3 text-muted-foreground" />
              </div>
              {labels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => setSelectedView(`label-${label.id}`)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent",
                    selectedView === `label-${label.id}` &&
                      "bg-accent font-medium"
                  )}
                >
                  <Hash
                    className="h-3 w-3 shrink-0"
                    style={{ color: label.color }}
                  />
                  <span className="truncate">{label.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer with shortcuts hint */}
      {sidebarOpen && (
        <div className="border-t p-3">
          <p className="text-[10px] text-muted-foreground text-center">
            <kbd className="rounded border bg-muted px-1">Ctrl+K</kbd> Command
            palette
          </p>
        </div>
      )}
    </aside>
  );
}
