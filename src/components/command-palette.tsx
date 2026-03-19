"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import { useAppStore } from "@/stores/app-store";

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setCommandPaletteOpen(false)}
      />
      <Command className="relative z-50 w-full max-w-lg rounded-lg border bg-popover text-popover-foreground shadow-md">
        <Command.Input
          placeholder="Type a command or search..."
          className="flex h-11 w-full rounded-t-lg bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Command.List className="max-h-[300px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>
          <Command.Group heading="Navigation" className="text-xs font-medium text-muted-foreground px-2 py-1.5">
            <Command.Item
              className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              onSelect={() => setCommandPaletteOpen(false)}
            >
              Home
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
