import type {
  AuditEntry,
  backendInterface as FullBackend,
} from "@/../src/backend.d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { exportToCSV } from "@/lib/utils";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, Download, Filter, Search, X } from "lucide-react";
import { useState } from "react";
import { createActor } from "../../../backend";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  if (!ms) return "—";
  return new Date(ms).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function tsToISO(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  if (!ms) return "";
  return new Date(ms).toISOString();
}

const TARGET_KIND_COLORS: Record<string, string> = {
  org: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  user: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  agent: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  task: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  invite: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  wallet: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  apikey: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

function TargetKindBadge({ kind }: { kind: string }) {
  const colorClass =
    TARGET_KIND_COLORS[kind.toLowerCase()] ??
    "bg-muted/40 text-muted-foreground border-border";
  return (
    <Badge
      variant="outline"
      className={`text-xs capitalize font-medium ${colorClass}`}
    >
      {kind}
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AuditLog() {
  const { actor: _actor } = useActor(createActor);
  const actor = _actor as unknown as FullBackend | null;

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Fetch audit log ──────────────────────────────────────────────────────

  const { data: entries = [], isLoading } = useQuery<AuditEntry[]>({
    queryKey: ["audit-log"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await (actor as FullBackend).getAuditLog(null);
        if (result.__kind__ === "ok") return result.ok;
        return [];
      } catch {
        // API not yet live in backend — return empty gracefully
        return [];
      }
    },
    enabled: !!actor,
    staleTime: 30_000,
  });

  // ── Client-side filtering ────────────────────────────────────────────────

  const filteredEntries = entries.filter((entry) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        entry.actorName.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.description.toLowerCase().includes(q) ||
        entry.targetKind.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (dateFrom) {
      const fromMs = new Date(dateFrom).getTime();
      const entryMs = Number(entry.timestamp / 1_000_000n);
      if (entryMs < fromMs) return false;
    }
    if (dateTo) {
      const toMs = new Date(dateTo).getTime() + 86_400_000;
      const entryMs = Number(entry.timestamp / 1_000_000n);
      if (entryMs > toMs) return false;
    }
    return true;
  });

  const hasFilters = !!searchQuery || !!dateFrom || !!dateTo;

  function clearFilters() {
    setSearchQuery("");
    setDateFrom("");
    setDateTo("");
  }

  function handleExport() {
    const exportData = filteredEntries.map((entry) => ({
      timestamp: tsToISO(entry.timestamp),
      actorName: entry.actorName,
      action: entry.action,
      targetKind: entry.targetKind,
      targetId: entry.targetId,
      description: entry.description,
    }));
    exportToCSV(exportData, "audit-log", [
      { key: "timestamp", label: "Timestamp" },
      { key: "actorName", label: "Actor" },
      { key: "action", label: "Action" },
      { key: "targetKind", label: "Target Type" },
      { key: "targetId", label: "Target ID" },
      { key: "description", label: "Description" },
    ]);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">Audit Log</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Platform-wide record of all significant actions taken by admins and
            users
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          {!isLoading && filteredEntries.length > 0 && (
            <Badge
              variant="outline"
              className="text-xs bg-muted/30 border-border"
            >
              {filteredEntries.length} entr
              {filteredEntries.length === 1 ? "y" : "ies"}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            title="Export CSV"
            disabled={filteredEntries.length === 0}
            data-ocid="audit.secondary_button"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by actor, action, or description…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[150px] text-sm"
            title="From date"
          />
          <span className="text-muted-foreground text-sm">—</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[150px] text-sm"
            title="To date"
          />
          {hasFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={clearFilters}
              title="Clear filters"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {/* Table header — desktop only */}
          <div className="hidden md:grid grid-cols-[180px_160px_150px_160px_1fr] gap-3 px-5 py-3 border-b border-border/40 bg-muted/10">
            {["Timestamp", "Actor", "Action", "Target", "Description"].map(
              (col) => (
                <span
                  key={col}
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                >
                  {col}
                </span>
              ),
            )}
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="audit.loading">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-full rounded-md" />
              ))}
            </div>
          ) : filteredEntries.length === 0 ? (
            /* Empty state */
            <div className="py-20 text-center" data-ocid="audit.empty">
              <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {hasFilters
                  ? "No entries match your filters"
                  : "No audit entries yet"}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                {hasFilters
                  ? "Try adjusting your search or date range."
                  : "Audit entries will appear here as significant actions are taken on the platform."}
              </p>
              {hasFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-xs"
                  onClick={clearFilters}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            /* Rows */
            <div className="divide-y divide-border/40">
              {filteredEntries.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="grid md:grid-cols-[180px_160px_150px_160px_1fr] gap-3 px-5 py-3.5 hover:bg-muted/10 transition-colors text-sm items-start"
                  data-ocid={`audit.row.${idx + 1}`}
                >
                  {/* Timestamp */}
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatTimestamp(entry.timestamp)}
                  </span>

                  {/* Actor */}
                  <span
                    className="font-medium truncate"
                    title={entry.actorName}
                  >
                    {entry.actorName || "System"}
                  </span>

                  {/* Action */}
                  <span className="text-xs font-mono text-foreground/80 truncate">
                    {entry.action}
                  </span>

                  {/* Target */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TargetKindBadge kind={entry.targetKind} />
                    <span
                      className="text-xs text-muted-foreground font-mono truncate"
                      title={entry.targetId}
                    >
                      {entry.targetId.length > 8
                        ? `${entry.targetId.slice(0, 8)}…`
                        : entry.targetId}
                    </span>
                  </div>

                  {/* Description */}
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    {entry.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
