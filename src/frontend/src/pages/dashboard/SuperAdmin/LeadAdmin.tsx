import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Inbox,
  Search,
} from "lucide-react";
import { useState } from "react";
import type { Lead } from "../../../backend.d";

type SortKey = "name" | "createdAt" | "interest" | "source";
type SortDir = "asc" | "desc";

const SKELETON_ROWS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

const INTEREST_STYLES: Record<string, string> = {
  individual: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  agency: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  enterprise: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  developer: "bg-green-500/20 text-green-400 border-green-500/30",
  partner: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

function interestStyle(interest: string): string {
  return (
    INTEREST_STYLES[interest.toLowerCase()] ??
    "bg-muted text-muted-foreground border-border"
  );
}

function formatDate(createdAt: bigint): string {
  return new Date(Number(createdAt) / 1_000_000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SortIcon({
  column,
  sortKey,
  sortDir,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  if (sortKey !== column)
    return <ArrowUpDown className="w-3.5 h-3.5 ml-1 opacity-40" />;
  return sortDir === "asc" ? (
    <ArrowUp className="w-3.5 h-3.5 ml-1 text-primary" />
  ) : (
    <ArrowDown className="w-3.5 h-3.5 ml-1 text-primary" />
  );
}

function SortableHead({
  column,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  column: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (col: SortKey) => void;
}) {
  return (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => onSort(column)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon column={column} sortKey={sortKey} sortDir={sortDir} />
      </span>
    </TableHead>
  );
}

export default function LeadAdmin() {
  const { actor, isFetching } = useActor();
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [search, setSearch] = useState("");

  const {
    data: leads,
    isLoading,
    isError,
    error,
  } = useQuery<Lead[]>({
    queryKey: ["all-leads"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await actor.getAllLeads();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    enabled: !!actor && !isFetching,
  });

  const handleSort = (col: SortKey) => {
    if (sortKey === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(col);
      setSortDir("desc");
    }
  };

  const filtered = (leads ?? []).filter((l) => {
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "createdAt") {
      cmp = Number(a.createdAt - b.createdAt);
    } else if (sortKey === "name") {
      cmp = a.name.localeCompare(b.name);
    } else if (sortKey === "interest") {
      cmp = a.interest.localeCompare(b.interest);
    } else if (sortKey === "source") {
      cmp = a.source.localeCompare(b.source);
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const totalCount = leads?.length ?? 0;

  return (
    <div className="space-y-6" data-ocid="leads.page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">Lead Admin</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? (
              <Skeleton className="h-4 w-24 inline-block" />
            ) : (
              <span data-ocid="leads.table">
                {totalCount} {totalCount === 1 ? "lead" : "leads"} captured
              </span>
            )}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            data-ocid="leads.search_input"
            className="pl-8"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Error */}
      {isError && (
        <Alert variant="destructive" data-ocid="leads.error_state">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load leads"}
          </AlertDescription>
        </Alert>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/60">
              <SortableHead
                column="name"
                label="Name"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">
                Organization
              </TableHead>
              <SortableHead
                column="interest"
                label="Interest"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <TableHead className="hidden lg:table-cell">Language</TableHead>
              <SortableHead
                column="source"
                label="Source"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                column="createdAt"
                label="Submitted"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              SKELETON_ROWS.map((rowId) => (
                <TableRow key={rowId} className="border-border/40">
                  <TableCell>
                    <Skeleton className="h-3.5 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-36" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-3.5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Skeleton className="h-5 w-10 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-16"
                  data-ocid="leads.empty_state"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Inbox className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">
                      {search ? "No leads match your search" : "No leads yet"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((lead, idx) => (
                <TableRow
                  key={lead.id}
                  className="border-border/40 hover:bg-muted/30 transition-colors"
                  data-ocid={`leads.item.${idx + 1}`}
                >
                  <TableCell className="font-medium text-sm">
                    {lead.name}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {lead.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {lead.orgName ?? <span className="opacity-40">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${interestStyle(lead.interest)}`}
                    >
                      {lead.interest}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge
                      variant="secondary"
                      className="text-xs font-mono tracking-wide"
                    >
                      {lead.preferredLanguage}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground capitalize">
                    {lead.source}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
