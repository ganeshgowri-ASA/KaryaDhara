"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";

export function TaskFilters() {
  const { filters, setFilters, fetchTasks } = useTaskStore();

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value === "all" ? undefined : value };
    setFilters(newFilters);
    setTimeout(fetchTasks, 0);
  };

  const clearFilters = () => {
    setFilters({});
    setTimeout(fetchTasks, 0);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          className="pl-10"
          value={filters.search || ""}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />
      </div>

      <Select
        value={(filters.status as unknown as string) || "all"}
        onValueChange={(v) => handleFilterChange("status", v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="TODO">To Do</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="IN_REVIEW">In Review</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={(filters.priority as unknown as string) || "all"}
        onValueChange={(v) => handleFilterChange("priority", v)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          <SelectItem value="P1">P1 - Urgent</SelectItem>
          <SelectItem value="P2">P2 - High</SelectItem>
          <SelectItem value="P3">P3 - Medium</SelectItem>
          <SelectItem value="P4">P4 - Low</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Input
          type="date"
          className="w-[150px]"
          value={filters.dueDateFrom || ""}
          onChange={(e) => handleFilterChange("dueDateFrom", e.target.value)}
          placeholder="From"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <Input
          type="date"
          className="w-[150px]"
          value={filters.dueDateTo || ""}
          onChange={(e) => handleFilterChange("dueDateTo", e.target.value)}
          placeholder="To"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
