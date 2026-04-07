import type { backendInterface as FullBackend } from "@/../src/backend.d";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  Bot,
  Building2,
  ClipboardList,
  Loader2,
  Search,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createActor } from "../backend";

export interface SearchResult {
  kind: "user" | "agent" | "task" | "org";
  id: string;
  resultLabel: string;
  subtitle: string;
  url: string;
}

interface GlobalSearchProps {
  role: string;
  orgId?: string;
  onNavigate: (page: string) => void;
}

const KIND_CONFIG: Record<
  SearchResult["kind"],
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  org: {
    icon: Building2,
    label: "Organizations",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  user: {
    icon: Users,
    label: "Users",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  agent: {
    icon: Bot,
    label: "Agents",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  task: {
    icon: ClipboardList,
    label: "Tasks",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
};

const KIND_ORDER: SearchResult["kind"][] = ["org", "user", "agent", "task"];

function urlToPage(url: string): string {
  // /app/agents -> agents, /app/users -> users, etc.
  const parts = url
    .replace(/^\/?app\/?/, "")
    .split("/")
    .filter(Boolean);
  const segment = parts[0] ?? "";
  const MAP: Record<string, string> = {
    agents: "ai-agents",
    users: "all-users",
    tasks: "task-management",
    organizations: "organizations",
    org: "my-organization",
    members: "team-invites",
    wallets: "wallets-finance",
  };
  return MAP[segment] ?? segment;
}

const isMac =
  typeof navigator !== "undefined" && /mac/i.test(navigator.platform || "");

export function GlobalSearch({ role, orgId, onNavigate }: GlobalSearchProps) {
  const { actor: _actor, isFetching } = useActor(createActor);
  const actor = _actor as unknown as FullBackend | null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const runSearch = useCallback(
    async (q: string) => {
      if (!actor || isFetching || q.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        let res:
          | { __kind__: "ok"; ok: SearchResult[] }
          | { __kind__: "err"; err: string };

        if (role === "super_admin") {
          res = await (actor as any).searchPlatform(q);
        } else {
          const oid = orgId ?? "";
          res = await (actor as any).searchOrg(oid, q);
        }
        if (res.__kind__ === "ok") {
          setResults(res.ok);
        } else {
          setResults([]);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [actor, isFetching, role, orgId],
  );

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  // Global Cmd+K / Ctrl+K listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setQuery("");
      setResults([]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    const page = urlToPage(result.url);
    onNavigate(page);
    handleOpenChange(false);
  };

  // Group results by kind (maintaining order)
  const grouped = KIND_ORDER.reduce(
    (acc, kind) => {
      const items = results.filter((r) => r.kind === kind);
      if (items.length > 0) acc[kind] = items;
      return acc;
    },
    {} as Partial<Record<SearchResult["kind"], SearchResult[]>>,
  );

  const hasResults = results.length > 0;
  const showEmptyState = !isLoading && query.length >= 2 && !hasResults;
  const showHint = !isLoading && query.length < 2;

  const shortcut = isMac ? "⌘K" : "Ctrl+K";

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 text-muted-foreground hover:text-foreground"
        onClick={() => setOpen(true)}
        aria-label={`Search (${shortcut})`}
        data-ocid="global_search.button"
      >
        <Search className="w-4 h-4" />
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="p-0 gap-0 max-w-lg bg-card border-border overflow-hidden"
          data-ocid="global_search.dialog"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            {isLoading ? (
              <Loader2 className="w-4 h-4 shrink-0 text-muted-foreground animate-spin" />
            ) : (
              <Search className="w-4 h-4 shrink-0 text-muted-foreground" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, agents, tasks, orgs…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none border-0 focus:ring-0"
              data-ocid="global_search.input"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-muted-foreground/60 hover:text-muted-foreground px-1.5 py-0.5 rounded border border-border/60 shrink-0"
              >
                Clear
              </button>
            )}
          </div>

          {/* Results area */}
          <ScrollArea className="max-h-[400px]">
            {/* Hint state */}
            {showHint && (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Search className="w-8 h-8 opacity-20" />
                <p className="text-sm">Type to search…</p>
                <p className="text-xs text-muted-foreground/60">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono">
                    {shortcut}
                  </kbd>{" "}
                  to open anytime
                </p>
              </div>
            )}

            {/* Loading skeleton */}
            {isLoading && (
              <div className="px-4 py-3 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {showEmptyState && (
              <div
                className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2"
                data-ocid="global_search.empty_state"
              >
                <Search className="w-8 h-8 opacity-20" />
                <p className="text-sm">No results found</p>
                <p className="text-xs text-muted-foreground/60">
                  Try a different search term
                </p>
              </div>
            )}

            {/* Results grouped by kind */}
            {!isLoading && hasResults && (
              <div className="py-1">
                {KIND_ORDER.map((kind) => {
                  const items = grouped[kind];
                  if (!items) return null;
                  const config = KIND_CONFIG[kind];
                  const Icon = config.icon;
                  return (
                    <div key={kind}>
                      {/* Group header */}
                      <div className="px-4 py-1.5 flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
                          {config.label}
                        </span>
                      </div>
                      {/* Group items */}
                      {items.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => handleSelect(result)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:bg-accent/60",
                          )}
                        >
                          <div
                            className={cn(
                              "shrink-0 w-7 h-7 rounded-full flex items-center justify-center",
                              config.bg,
                            )}
                          >
                            <Icon className={cn("w-3.5 h-3.5", config.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {result.resultLabel}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer hint */}
          {!showHint && (
            <div className="px-4 py-2 border-t border-border/60 flex items-center gap-3 text-xs text-muted-foreground/60">
              <span>
                <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono">
                  ↵
                </kbd>{" "}
                to select
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground text-xs font-mono">
                  Esc
                </kbd>{" "}
                to close
              </span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
