"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Plus,
  Search,
  Sun,
  Inbox,
  LayoutList,
  Columns3,
  Moon,
  Settings,
  LogOut,
  FolderKanban,
} from "lucide-react";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useUIStore } from "@/stores/ui-store";
import { useTaskStore } from "@/stores/task-store";
import { useProjectStore } from "@/stores/project-store";

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen, setViewMode, setSelectedView } =
    useUIStore();
  const { tasks, createTask } = useTaskStore();
  const { projects, setActiveProjectId } = useProjectStore();
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape" && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const handleSelect = React.useCallback(
    (callback: () => void) => {
      setCommandPaletteOpen(false);
      setSearch("");
      callback();
    },
    [setCommandPaletteOpen]
  );

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />
      <div className="relative z-50 w-full max-w-lg rounded-lg border bg-popover shadow-lg">
        <Command
          className="flex flex-col overflow-hidden rounded-lg"
          shouldFilter={true}
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search tasks..."
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Quick Actions */}
            <Command.Group
              heading="Quick Actions"
              className="text-xs font-medium text-muted-foreground px-2 py-1.5"
            >
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                onSelect={() =>
                  handleSelect(async () => {
                    if (search.trim()) {
                      await createTask({ title: search.trim() });
                    }
                  })
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                {search.trim()
                  ? `Create task: "${search}"`
                  : "Create new task"}
              </Command.Item>
            </Command.Group>

            {/* Navigation */}
            <Command.Group
              heading="Navigation"
              className="text-xs font-medium text-muted-foreground px-2 py-1.5"
            >
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                onSelect={() =>
                  handleSelect(() => {
                    setSelectedView("inbox");
                    setViewMode("list");
                    setActiveProjectId(null);
                  })
                }
              >
                <Inbox className="mr-2 h-4 w-4" />
                Go to Inbox
              </Command.Item>
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                onSelect={() =>
                  handleSelect(() => {
                    setSelectedView("my-day");
                    setViewMode("my-day");
                  })
                }
              >
                <Sun className="mr-2 h-4 w-4" />
                Go to My Day
              </Command.Item>
            </Command.Group>

            {/* Views */}
            <Command.Group
              heading="Views"
              className="text-xs font-medium text-muted-foreground px-2 py-1.5"
            >
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                onSelect={() => handleSelect(() => setViewMode("list"))}
              >
                <LayoutList className="mr-2 h-4 w-4" />
                Switch to List View
              </Command.Item>
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                onSelect={() => handleSelect(() => setViewMode("kanban"))}
              >
                <Columns3 className="mr-2 h-4 w-4" />
                Switch to Kanban Board
              </Command.Item>
            </Command.Group>

            {/* Projects */}
            {projects.length > 0 && (
              <Command.Group
                heading="Projects"
                className="text-xs font-medium text-muted-foreground px-2 py-1.5"
              >
                {projects.map((project) => (
                  <Command.Item
                    key={project.id}
                    className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                    onSelect={() =>
                      handleSelect(() => {
                        setActiveProjectId(project.id);
                        setSelectedView(`project-${project.id}`);
                      })
                    }
                  >
                    <FolderKanban
                      className="mr-2 h-4 w-4"
                      style={{ color: project.color }}
                    />
                    {project.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Tasks (search results) */}
            {search.trim() && tasks.length > 0 && (
              <Command.Group
                heading="Tasks"
                className="text-xs font-medium text-muted-foreground px-2 py-1.5"
              >
                {tasks
                  .filter((t) =>
                    t.title.toLowerCase().includes(search.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((task) => (
                    <Command.Item
                      key={task.id}
                      className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                      onSelect={() =>
                        handleSelect(() => {
                          useTaskStore.getState().setSelectedTask(task);
                          useUIStore.getState().setTaskDetailOpen(true);
                        })
                      }
                    >
                      <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                      {task.title}
                    </Command.Item>
                  ))}
              </Command.Group>
            )}

            {/* Theme */}
            <Command.Group
              heading="Settings"
              className="text-xs font-medium text-muted-foreground px-2 py-1.5"
            >
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                onSelect={() =>
                  handleSelect(() =>
                    setTheme(theme === "dark" ? "light" : "dark")
                  )
                }
              >
                <Moon className="mr-2 h-4 w-4" />
                Toggle Theme
              </Command.Item>
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                onSelect={() =>
                  handleSelect(() => router.push("/profile"))
                }
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Command.Item>
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent"
                onSelect={() =>
                  handleSelect(() => signOut({ callbackUrl: "/login" }))
                }
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
