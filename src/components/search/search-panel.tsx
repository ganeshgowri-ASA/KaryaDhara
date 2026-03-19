"use client";

import { useState, useCallback } from "react";
import { useSearchStore } from "@/stores/search-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Loader2,
  Filter,
  X,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react";

const statusIcons: Record<string, React.ReactNode> = {
  TODO: <Circle className="h-3.5 w-3.5 text-muted-foreground" />,
  IN_PROGRESS: <Clock className="h-3.5 w-3.5 text-blue-500" />,
  DONE: <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />,
};

export function SearchPanel() {
  const {
    query,
    results,
    filters,
    loading,
    setQuery,
    setFilters,
    clearFilters,
    clearSearch,
    search,
  } = useSearchStore();

  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = useCallback(() => {
    if (query.trim()) search();
  }, [query, search]);

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search tasks, projects, labels..."
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} disabled={!query.trim() || loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={hasFilters ? "border-primary" : ""}
        >
          <Filter className="h-4 w-4" />
        </Button>
        {(query || hasFilters) && (
          <Button variant="ghost" size="icon" onClick={clearSearch}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-medium">Status</label>
                <Select
                  value={filters.status || "all"}
                  onValueChange={(v) =>
                    setFilters({ ...filters, status: v === "all" ? undefined : v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Priority</label>
                <Select
                  value={filters.priority || "all"}
                  onValueChange={(v) =>
                    setFilters({ ...filters, priority: v === "all" ? undefined : v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="P1">Urgent</SelectItem>
                    <SelectItem value="P2">High</SelectItem>
                    <SelectItem value="P3">Medium</SelectItem>
                    <SelectItem value="P4">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium">Due After</label>
                <Input
                  type="date"
                  className="mt-1"
                  value={filters.dueAfter || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, dueAfter: e.target.value || undefined })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium">Due Before</label>
                <Input
                  type="date"
                  className="mt-1"
                  value={filters.dueBefore || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, dueBefore: e.target.value || undefined })
                  }
                />
              </div>
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {results.counts.tasks} tasks, {results.counts.projects}{" "}
            projects, {results.counts.labels} labels
          </p>

          {results.tasks.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 p-2 rounded-md border text-sm"
                  >
                    {statusIcons[task.status] || statusIcons.TODO}
                    <span className="flex-1 truncate">{task.title}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {task.priority}
                    </Badge>
                    {task.project && (
                      <Badge variant="secondary" className="text-[10px]">
                        {task.project.name}
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {results.projects.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Projects</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {results.projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center gap-2 p-2 rounded-md border text-sm"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="flex-1">{project.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {project._count?.tasks || 0} tasks
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {results.labels.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Labels</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {results.labels.map((label) => (
                  <Badge
                    key={label.id}
                    variant="outline"
                    style={{ borderColor: label.color, color: label.color }}
                  >
                    {label.name} ({label._count?.tasks || 0})
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
