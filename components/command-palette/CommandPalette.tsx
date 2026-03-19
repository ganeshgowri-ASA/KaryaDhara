"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, Plus, CheckSquare, LayoutDashboard, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useCommandPaletteStore } from "@/stores/commandPaletteStore";

export function CommandPalette() {
  const { isOpen, close } = useCommandPaletteStore();
  const { setTheme } = useTheme();
  const router = useRouter();

  const runCommand = React.useCallback(
    (command: () => void) => {
      close();
      command();
    },
    [close]
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>

            <Command.Group heading="Tasks">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create new task
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  N
                </kbd>
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <CheckSquare className="mr-2 h-4 w-4" />
                View all tasks
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation">
              <Command.Item
                onSelect={() => runCommand(() => router.push("/dashboard"))}
                className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => router.push("/settings"))}
                className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Theme">
              <Command.Item
                onSelect={() => runCommand(() => setTheme("light"))}
                className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light mode
              </Command.Item>
              <Command.Item
                onSelect={() => runCommand(() => setTheme("dark"))}
                className="flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark mode
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
