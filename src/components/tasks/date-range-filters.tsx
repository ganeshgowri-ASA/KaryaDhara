"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useViewStore } from "../../../stores";
import type { DateRangeFilter } from "../../../types";

const filters: { value: DateRangeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "this_week", label: "This Week" },
  { value: "this_month", label: "This Month" },
  { value: "overdue", label: "Overdue" },
];

export function DateRangeFilters() {
  const { dateFilter, setDateFilter } = useViewStore();

  return (
    <div className="flex items-center gap-1">
      {filters.map((f) => (
        <Button
          key={f.value}
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2.5 text-xs",
            dateFilter === f.value &&
              "bg-secondary text-secondary-foreground"
          )}
          onClick={() => setDateFilter(f.value)}
        >
          {f.label}
        </Button>
      ))}
    </div>
  );
}
