"use client";

import * as React from "react";
import { Command } from "cmdk";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative z-50 w-full max-w-lg rounded-lg border bg-popover p-0 shadow-lg">
        <Command className="flex flex-col overflow-hidden rounded-lg">
          <div className="flex items-center border-b px-3">
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group
              heading="Navigation"
              className="text-xs font-medium text-muted-foreground px-2 py-1.5"
            >
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onSelect={() => setOpen(false)}
              >
                Home
              </Command.Item>
            </Command.Group>
            <Command.Group
              heading="Theme"
              className="text-xs font-medium text-muted-foreground px-2 py-1.5"
            >
              <Command.Item
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                onSelect={() => {
                  document.documentElement.classList.toggle("dark");
                  setOpen(false);
                }}
              >
                Toggle Theme
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
