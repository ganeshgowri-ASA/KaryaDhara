"use client";

import { useEffect, useCallback, useRef } from "react";
import { Search, FileText, FolderOpen, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchStore } from "@/stores/search-store";

export function SearchDialog() {
  const { isOpen, setOpen, query, results, isSearching, search, clearResults } =
    useSearchStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        search(value);
      }, 300);
    },
    [search]
  );

  const typeIcon = {
    task: <FileText className="h-4 w-4 text-blue-500" />,
    project: <FolderOpen className="h-4 w-4 text-purple-500" />,
    label: <Tag className="h-4 w-4 text-green-500" />,
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) clearResults();
      }}
    >
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search tasks, projects, labels..."
              className="pl-10"
              defaultValue={query}
              onChange={(e) => handleSearch(e.target.value)}
              autoFocus
            />
          </div>

          <ScrollArea className="max-h-[400px]">
            {isSearching ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results && (results.counts.tasks + results.counts.projects + results.counts.labels) === 0 && query ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : results ? (
              <div className="space-y-1">
                {results.tasks.map((task) => (
                  <button
                    key={`task-${task.id}`}
                    className="flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {typeIcon.task}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{task.title}</span>
                        {task.status && (
                          <Badge variant="outline" className="text-[10px]">{task.status}</Badge>
                        )}
                        {task.priority && (
                          <Badge variant="secondary" className="text-[10px]">{task.priority}</Badge>
                        )}
                      </div>
                      {task.project && (
                        <p className="text-xs text-muted-foreground">in {task.project.name}</p>
                      )}
                    </div>
                  </button>
                ))}
                {results.projects.map((project) => (
                  <button
                    key={`project-${project.id}`}
                    className="flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {typeIcon.project}
                    <span className="text-sm font-medium">{project.name}</span>
                  </button>
                ))}
                {results.labels.map((label) => (
                  <button
                    key={`label-${label.id}`}
                    className="flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {typeIcon.label}
                    <span className="text-sm font-medium">{label.name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
