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
            ) : results.length === 0 && query ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    className="flex w-full items-start gap-3 rounded-md p-3 text-left hover:bg-muted"
                    onClick={() => setOpen(false)}
                  >
                    {typeIcon[result.type]}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {result.title}
                        </span>
                        {result.status && (
                          <Badge variant="outline" className="text-[10px]">
                            {result.status}
                          </Badge>
                        )}
                        {result.priority && (
                          <Badge variant="secondary" className="text-[10px]">
                            {result.priority}
                          </Badge>
                        )}
                      </div>
                      {result.description && (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {result.description}
                        </p>
                      )}
                      {result.projectName && (
                        <p className="text-xs text-muted-foreground">
                          in {result.projectName}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
