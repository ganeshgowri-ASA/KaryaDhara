"use client";

import * as React from "react";
import { useCommandPaletteStore } from "@/stores/commandPaletteStore";

export function CommandPaletteKeyboardHandler() {
  const { toggle } = useCommandPaletteStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  return null;
}
