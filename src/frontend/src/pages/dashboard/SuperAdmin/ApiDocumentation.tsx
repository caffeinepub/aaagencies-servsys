import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Code2 } from "lucide-react";
import { useState } from "react";

type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  requiredRole?: string;
  example?: string;
};

type ApiSection = {
  title: string;
  description: string;
  endpoints: ApiEndpoint[];
};

const API_SECTIONS: ApiSection[] = [
  {
    title: "Organizations",
    description: "Manage platform organizations and their configurations",
    endpoints: [
      {
        method: "GET",
        path: "/api/organizations",
        description: "List all organizations (super_admin)",
        requiredRole: "super_admin",
      },
      {
        method: "POST",
        path: "/api/organizations",
        description: "Create a new organization",
        example:
          '{"name": "Acme Corp", "planTier": "professional", "primaryLanguage": "en"}',
      },
      {
        method: "GET",
        path: "/api/organizations/{id}",
        description: "Get organization by ID",
      },
      {
        method: "GET",
        path: "/api/organizations/me",
        description: "Get caller's organization",
        requiredRole: "authenticated",
      },
    ],
  },
  {
    title: "Users",
    description: "User registration, profiles, and role management",
    endpoints: [
      {
        method: "POST",
        path: "/api/users/register",
        description: "Register a new user",
        example:
          '{"displayName": "Jane Doe", "email": "jane@example.com", "preferredLanguage": "en"}',
      },
      {
        method: "GET",
        path: "/api/users/me",
        description: "Get current user profile",
        requiredRole: "authenticated",
      },
      {
        method: "GET",
        path: "/api/users/{principal}",
        description: "Get user by principal",
      },
      {
        method: "GET",
        path: "/api/users",
        description: "List all users (super_admin/org_admin)",
        requiredRole: "org_admin",
      },
    ],
  },
  {
    title: "User Profile",
    description:
      "Profile management and session tracking for authenticated users",
    endpoints: [
      {
        method: "PUT",
        path: "/api/users/me/profile",
        description: "Update caller's profile",
        requiredRole: "authenticated",
        example:
          '{"displayName": "Jane Doe", "email": "jane@example.com", "preferredLanguage": "es", "bio": "Agency founder"}',
      },
      {
        method: "POST",
        path: "/api/users/me/last-login",
        description: "Record last login timestamp",
        requiredRole: "authenticated",
      },
    ],
  },
  {
    title: "Wallets",
    description: "FinFracFran multi-wallet and transaction management",
    endpoints: [
      {
        method: "POST",
        path: "/api/wallets",
        description: "Create a new wallet account",
      },
      {
        method: "GET",
        path: "/api/wallets/{id}",
        description: "Get wallet by ID",
      },
      {
        method: "GET",
        path: "/api/wallets/org/{orgId}",
        description: "Get all wallets for an organization",
      },
      {
        method: "POST",
        path: "/api/wallets/{id}/deposit",
        description: "Deposit funds into wallet",
        example:
          '{"amount": 1000, "currency": "USD", "description": "Q2 payment"}',
      },
      {
        method: "POST",
        path: "/api/wallets/transfer",
        description: "Transfer between wallets",
      },
      {
        method: "POST",
        path: "/api/wallets/{id}/fractionalize",
        description: "FinFracFran distribution to recipients",
      },
    ],
  },
  {
    title: "AI Agents",
    description: "Register and manage AI agents in the swarm",
    endpoints: [
      {
        method: "POST",
        path: "/api/agents",
        description: "Register a new AI agent",
        example:
          '{"name": "SupportBot", "capabilities": ["ticket-routing"], "modelType": "GPT-4"}',
      },
      {
        method: "GET",
        path: "/api/agents/{id}",
        description: "Get agent by ID",
      },
      {
        method: "GET",
        path: "/api/agents/org/{orgId}",
        description: "List all agents for an org",
      },
      {
        method: "PUT",
        path: "/api/agents/{id}/status",
        description: "Update agent status (active/inactive/training)",
      },
    ],
  },
  {
    title: "Tasks",
    description: "Multi-agent task routing and management",
    endpoints: [
      {
        method: "POST",
        path: "/api/tasks",
        description: "Create a new task",
        example:
          '{"title": "Process tickets", "priority": "high", "assignedAgentId": "agent-001"}',
      },
      { method: "GET", path: "/api/tasks/{id}", description: "Get task by ID" },
      {
        method: "GET",
        path: "/api/tasks/me",
        description: "Get tasks assigned to caller",
        requiredRole: "authenticated",
      },
      {
        method: "PUT",
        path: "/api/tasks/{id}/status",
        description: "Update task status",
      },
      {
        method: "PUT",
        path: "/api/tasks/{id}/assign",
        description: "Assign task to agent",
      },
    ],
  },
  {
    title: "Invite Links",
    description: "Role-scoped invite link management",
    endpoints: [
      {
        method: "POST",
        path: "/api/invites",
        description: "Create an invite link",
        requiredRole: "org_admin",
        example:
          '{"orgId": "org-001", "role": "team_member", "maxRedemptions": 5, "expiresAt": 1700000000}',
      },
      {
        method: "GET",
        path: "/api/invites",
        description: "List caller's invite links",
        requiredRole: "org_admin",
      },
      {
        method: "GET",
        path: "/api/invites/all",
        description: "List all invite links",
        requiredRole: "super_admin",
      },
      {
        method: "GET",
        path: "/api/invites/{code}",
        description: "Get invite link by code",
        requiredRole: "public",
      },
      {
        method: "POST",
        path: "/api/invites/{code}/redeem",
        description: "Redeem an invite link (assigns role)",
        requiredRole: "authenticated",
        example: '{"displayName": "Jane Doe", "email": "jane@example.com"}',
      },
      {
        method: "PUT",
        path: "/api/invites/{id}/deactivate",
        description: "Deactivate an invite link",
        requiredRole: "org_admin",
      },
    ],
  },
  {
    title: "Marketing / Leads",
    description: "Early access lead capture and management",
    endpoints: [
      {
        method: "POST",
        path: "/api/leads",
        description: "Submit a lead (early access form)",
        requiredRole: "public",
        example:
          '{"name": "Alex Rivera", "email": "alex@example.com", "message": "Role: Agency. Org: Acme Corp. Interested in SerVSys."}',
      },
      {
        method: "GET",
        path: "/api/leads",
        description: "List all leads",
        requiredRole: "super_admin",
      },
    ],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  POST: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  PUT: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  DELETE: "bg-destructive/15 text-destructive border-destructive/30",
};

const ROLE_STYLES: Record<string, string> = {
  public: "bg-muted/60 text-muted-foreground border-border/50",
  authenticated: "bg-muted/60 text-muted-foreground border-border/50",
  org_admin: "bg-muted/60 text-sky-400/80 border-sky-500/20",
  super_admin: "bg-muted/60 text-violet-400/80 border-violet-500/20",
};

function RoleBadge({ accessLevel }: { accessLevel: string }) {
  const style =
    ROLE_STYLES[accessLevel] ??
    "bg-muted/60 text-muted-foreground border-border/50";
  return (
    <Badge
      variant="outline"
      className={cn("font-mono text-[10px] px-1.5 py-0 h-4 shrink-0", style)}
    >
      {accessLevel}
    </Badge>
  );
}

function EndpointRow({ endpoint }: { endpoint: ApiEndpoint }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-t border-border/30 first:border-t-0">
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 transition-colors text-left"
        onClick={() => setExpanded(!expanded)}
        data-ocid="api_docs.row"
      >
        <Badge
          variant="outline"
          className={cn(
            "font-mono text-xs w-14 justify-center shrink-0",
            METHOD_COLORS[endpoint.method],
          )}
        >
          {endpoint.method}
        </Badge>
        {endpoint.requiredRole && (
          <RoleBadge accessLevel={endpoint.requiredRole} />
        )}
        <code className="text-xs font-mono text-foreground/80 flex-1 truncate">
          {endpoint.path}
        </code>
        <span className="text-xs text-muted-foreground hidden sm:block flex-1 text-right truncate">
          {endpoint.description}
        </span>
        {endpoint.example &&
          (expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ))}
      </button>
      {expanded && endpoint.example && (
        <div className="px-4 pb-3">
          <pre className="bg-muted/50 rounded p-3 text-xs font-mono overflow-x-auto text-muted-foreground">
            {JSON.stringify(JSON.parse(endpoint.example), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function ApiDocumentation() {
  return (
    <div className="space-y-6" data-ocid="api_docs.page">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            API Documentation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AAAgencies SerVSys REST API reference
          </p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-sm">
            <Code2 className="w-4 h-4 text-primary" />
            <span className="font-mono text-muted-foreground">Base URL:</span>
            <code className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">
              https://api.aaagencies.ai/v1
            </code>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            All requests require an API key in the{" "}
            <code className="bg-muted px-1 rounded">X-API-Key</code> header.
            Obtain keys from your org's API Keys page.
          </p>
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/30">
            <span className="text-xs text-muted-foreground self-center">
              Access levels:
            </span>
            <RoleBadge accessLevel="public" />
            <RoleBadge accessLevel="authenticated" />
            <RoleBadge accessLevel="org_admin" />
            <RoleBadge accessLevel="super_admin" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4" data-ocid="api_docs.list">
        {API_SECTIONS.map((section) => (
          <Card key={section.title} className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">
                {section.title}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {section.description}
              </p>
            </CardHeader>
            <CardContent className="p-0 pb-1">
              {section.endpoints.map((ep) => (
                <EndpointRow key={ep.path + ep.method} endpoint={ep} />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
