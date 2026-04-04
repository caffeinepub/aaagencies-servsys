import { RoleBadge } from "@/components/RoleBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { MOCK_USERS } from "@/lib/mockData";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useState } from "react";
import type { User } from "../../../backend.d";

type DisplayUser = {
  id: string;
  displayName: string;
  email: string;
  role: string;
  orgName: string;
  isActive: boolean;
};

function toDisplayUsers(users: User[] | undefined): DisplayUser[] {
  if (users && users.length > 0) {
    return users.map((u) => ({
      id: u.email,
      displayName: u.displayName,
      email: u.email,
      role:
        typeof u.role === "object"
          ? (Object.keys(u.role)[0] ?? "")
          : String(u.role),
      orgName: u.orgId ? String(u.orgId) : "Platform",
      isActive: u.isActive,
    }));
  }
  return MOCK_USERS.map((u) => ({
    id: u.id,
    displayName: u.displayName,
    email: u.email,
    role: u.role,
    orgName: u.orgName,
    isActive: u.isActive,
  }));
}

export default function AllUsers() {
  const { actor } = useActor();
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users, isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => actor!.getAllUsers(),
    enabled: !!actor,
  });

  const displayUsers = toDisplayUsers(users);
  const filteredUsers = displayUsers.filter((u) =>
    roleFilter === "all" ? true : u.role === roleFilter,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">All Users</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {displayUsers.length} registered users on the platform
          </p>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="org_admin">Org Admin</SelectItem>
            <SelectItem value="team_member">Team Member</SelectItem>
            <SelectItem value="end_customer">Customer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filteredUsers.map((user) => {
                const initials = user.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 px-5 py-3"
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/15 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="hidden sm:block text-xs text-muted-foreground min-w-0 max-w-[140px] truncate">
                      {user.orgName}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RoleBadge role={user.role} />
                      {user.isActive ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-destructive/10 text-destructive border-destructive/30"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
