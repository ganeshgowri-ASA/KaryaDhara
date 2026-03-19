"use client";

import * as React from "react";
import { Command, Search } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useCommandPaletteStore } from "@/stores/commandPaletteStore";

export function Navbar() {
  const { open } = useCommandPaletteStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-6">
          <Command className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg tracking-tight">KaryaDhara</span>
        </div>

        <div className="flex flex-1 items-center justify-between">
          <Button
            variant="outline"
            className="relative w-full max-w-sm justify-start text-sm text-muted-foreground"
            onClick={open}
          >
            <Search className="mr-2 h-4 w-4" />
            <span>Search or run commands...</span>
            <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <div className="flex items-center gap-2 ml-4">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
