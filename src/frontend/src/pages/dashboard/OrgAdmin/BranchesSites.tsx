import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitBranch, Globe, MapPin, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// MOCK DATA - Phase 3 will replace with real API
const MOCK_BRANCHES = [
  {
    id: "br-001",
    name: "Headquarters",
    location: "New York, NY",
    siteUrl: "https://hq.techventures.io",
    isActive: true,
    manager: "Priya Nair",
  },
  {
    id: "br-002",
    name: "LATAM Office",
    location: "São Paulo, Brazil",
    siteUrl: "https://latam.techventures.io",
    isActive: true,
    manager: "Carlos Mendez",
  },
  {
    id: "br-003",
    name: "APAC Branch",
    location: "Singapore",
    siteUrl: null,
    isActive: true,
    manager: null,
  },
];

export default function BranchesSites() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", siteUrl: "" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Branches & Sites
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Remote offices and branch locations
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add Branch</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Branch Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. APAC Office"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                  placeholder="City, Country"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Site URL{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  value={form.siteUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, siteUrl: e.target.value }))
                  }
                  placeholder="https://..."
                />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  toast.success(
                    "Branch added (Phase 3 will persist to backend)",
                  );
                  setOpen(false);
                }}
              >
                Add Branch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_BRANCHES.map((branch) => (
          <Card key={branch.id} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GitBranch className="w-4 h-4 text-primary" />
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${branch.isActive ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : "bg-muted text-muted-foreground"}`}
                >
                  {branch.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <h3 className="font-display font-semibold text-sm mb-1">
                {branch.name}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <MapPin className="w-3 h-3" />
                {branch.location}
              </div>
              {branch.siteUrl && (
                <div className="flex items-center gap-1.5 text-xs text-primary truncate">
                  <Globe className="w-3 h-3 shrink-0" />
                  <a
                    href={branch.siteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate hover:underline"
                  >
                    {branch.siteUrl}
                  </a>
                </div>
              )}
              {branch.manager && (
                <p className="text-xs text-muted-foreground mt-2">
                  Manager: {branch.manager}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
