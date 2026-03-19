"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSearchStore } from "@/stores/search-store";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  FileText,
  FolderKanban,
  Tag,
  MessageSquare,
  Loader2,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  task: <FileText className="h-4 w-4 text-blue-500" />,
  project: <FolderKanban className="h-4 w-4 text-purple-500" />,
  label: <Tag className="h-4 w-4 text-green-500" />,
  comment: <MessageSquare className="h-4 w-4 text-orange-500" />,
};

export function SearchPanel() {
  const { query, results, isSearching, performSearch, clearSearch } =
    useSearchStore();
  const [localQuery, setLocalQuery] = useState(query);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const debouncedSearch = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        performSearch(q);
      }, 300);
    },
    [performSearch]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    if (value.trim()) {
      debouncedSearch(value);
    } else {
      clearSearch();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks, projects, labels, comments..."
            className="pl-8"
            value={localQuery}
            onChange={handleChange}
          />
          {isSearching && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>

        {results.length > 0 && (
          <ScrollArea className="mt-3 max-h-[400px]">
            <div className="space-y-1">
              {results.map((result) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <div className="mt-0.5">
                    {TYPE_ICONS[result.type] || (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {result.title}
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        {result.type}
                      </Badge>
                      {result.priority && (
                        <Badge variant="outline" className="text-[10px] px-1.5">
                          {result.priority}
                        </Badge>
                      )}
                    </div>
                    {result.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.description}
                      </p>
                    )}
                    {result.labels && result.labels.length > 0 && (
                      <div className="flex gap-1">
                        {result.labels.map((l, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px]"
                            style={{ borderColor: l.color, color: l.color }}
                          >
                            {l.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {localQuery && !isSearching && results.length === 0 && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            No results found for &quot;{localQuery}&quot;
          </p>
        )}
      </CardContent>
    </Card>
  );
}
