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
  // ─── Phase 1A ───────────────────────────────────────────────────────────────
  {
    title: "Organizations",
    description: "Manage platform organizations and their configurations",
    endpoints: [
      {
        method: "GET",
        path: "/api/organizations",
        description: "List all organizations",
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
      // Phase 3A
      {
        method: "PUT",
        path: "/api/organizations/me",
        description:
          "Update caller's organization (name, description, plan, logo)",
        requiredRole: "org_admin",
        example:
          '{"name": "Acme Corp", "description": "Global AI Agency", "planTier": "professional", "logoUrl": "https://"}',
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
        description: "List all users",
        requiredRole: "org_admin",
      },
      // Phase 3A
      {
        method: "GET",
        path: "/api/users/org/{orgId}",
        description: "List all team members for an organization",
        requiredRole: "org_admin",
      },
      {
        method: "PUT",
        path: "/api/users/{principal}/role",
        description: "Update a user's role within the org",
        requiredRole: "org_admin",
        example: '{"role": "team_member"}',
      },
      {
        method: "DELETE",
        path: "/api/users/{principal}/org",
        description: "Remove a user from the organization",
        requiredRole: "org_admin",
      },
    ],
  },
  // ─── Phase 1B ───────────────────────────────────────────────────────────────
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
  // ─── Phase 2A ───────────────────────────────────────────────────────────────
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
  // ─── Phase 3A ───────────────────────────────────────────────────────────────
  {
    title: "Branches & Sites",
    description:
      "Organization branches and site management with per-branch configuration",
    endpoints: [
      {
        method: "GET",
        path: "/api/branches/org/{orgId}",
        description: "List all branches for an organization",
        requiredRole: "org_admin",
      },
      {
        method: "POST",
        path: "/api/branches",
        description: "Create a new branch/site",
        requiredRole: "org_admin",
        example:
          '{"orgId": "org-001", "name": "Downtown HQ", "location": "New York, NY", "siteUrl": "https://nyc.acme.com", "phone": "+1-555-0100", "timezone": "America/New_York", "language": "en", "hasSubWallet": true}',
      },
      {
        method: "PUT",
        path: "/api/branches/{id}",
        description: "Update branch details",
        requiredRole: "org_admin",
        example:
          '{"name": "Downtown HQ", "location": "New York, NY", "timezone": "America/New_York", "isActive": true}',
      },
      {
        method: "PUT",
        path: "/api/branches/{id}/deactivate",
        description: "Deactivate a branch",
        requiredRole: "org_admin",
      },
    ],
  },
  // ─── Phase 3B ───────────────────────────────────────────────────────────────
  {
    title: "Wallets & ICP Transfers",
    description:
      "FinFracFran multi-wallet management with real ICP ledger integration",
    endpoints: [
      {
        method: "POST",
        path: "/api/wallets",
        description: "Create a new wallet account",
        requiredRole: "org_admin",
        example:
          '{"orgId": "org-001", "name": "Main Treasury", "accountType": "org_main", "branchId": null}',
      },
      {
        method: "GET",
        path: "/api/wallets/me",
        description: "Get wallets belonging to the caller",
        requiredRole: "authenticated",
      },
      {
        method: "GET",
        path: "/api/wallets/org/{orgId}",
        description: "Get all wallets for an organization",
        requiredRole: "org_admin",
      },
      {
        method: "POST",
        path: "/api/wallets/{id}/deposit",
        description: "Deposit ICP into wallet (admin top-up)",
        requiredRole: "org_admin",
        example:
          '{"amountE8s": 100000000, "description": "Q2 Treasury Deposit"}',
      },
      {
        method: "POST",
        path: "/api/wallets/transfer",
        description: "Transfer ICP between wallets (real ledger call)",
        requiredRole: "authenticated",
        example:
          '{"fromWalletId": "w-001", "toWalletId": "w-002", "amountE8s": 50000000, "memo": "Payment for services"}',
      },
      {
        method: "GET",
        path: "/api/wallets/{id}/transactions",
        description: "Get transaction history for a wallet",
        requiredRole: "authenticated",
      },
      {
        method: "GET",
        path: "/api/wallets/org/{orgId}/transactions",
        description: "Get all transactions for an organization",
        requiredRole: "org_admin",
      },
    ],
  },
  // ─── Phase 3C ───────────────────────────────────────────────────────────────
  {
    title: "Subscriptions & Billing",
    description:
      "Stripe-powered subscription management. All endpoints activate when Stripe keys are configured.",
    endpoints: [
      {
        method: "POST",
        path: "/api/billing/checkout",
        description: "Create a Stripe Checkout session for plan upgrade",
        requiredRole: "org_admin",
        example:
          '{"planTier": "professional", "successUrl": "https://app.aaagencies.ai/billing?success=1", "cancelUrl": "https://app.aaagencies.ai/billing"}',
      },
      {
        method: "GET",
        path: "/api/billing/subscription",
        description: "Get current subscription status and plan details",
        requiredRole: "org_admin",
      },
      {
        method: "POST",
        path: "/api/billing/cancel",
        description: "Cancel active subscription (end of billing period)",
        requiredRole: "org_admin",
      },
      {
        method: "POST",
        path: "/api/billing/webhook",
        description: "Stripe webhook handler (internal — not called directly)",
        requiredRole: "public",
      },
    ],
  },
  // ─── Phase 3D ───────────────────────────────────────────────────────────────
  {
    title: "API Keys",
    description:
      "Org-scoped API key management with one-time reveal and masked storage",
    endpoints: [
      {
        method: "POST",
        path: "/api/keys",
        description:
          "Generate a new API key. Returns full key once — never retrievable again.",
        requiredRole: "org_admin",
        example:
          '{"name": "Production Integration", "description": "Used by CRM", "permissions": ["read", "write", "agents"]}',
      },
      {
        method: "GET",
        path: "/api/keys",
        description:
          "List API keys for caller's org (prefix only, full key never returned)",
        requiredRole: "org_admin",
      },
      {
        method: "DELETE",
        path: "/api/keys/{keyId}",
        description: "Revoke an API key (marks inactive, irreversible)",
        requiredRole: "org_admin",
      },
    ],
  },
  // ─── Phase 4A ───────────────────────────────────────────────────────────────
  {
    title: "Agent Registry",
    description:
      "Register, update, and manage AI agent definitions with endpoint routing for HTTP outcalls",
    endpoints: [
      {
        method: "POST",
        path: "/api/agents",
        description:
          "Register a new AI agent scoped to the caller's organization",
        requiredRole: "org_admin",
        example:
          '{"name": "SupportBot", "description": "Handles tier-1 support tickets", "modelType": "GPT-4o", "endpointUrl": "https://api.myagent.ai/v1/chat", "capabilities": ["ticket-routing", "faq-answering", "sentiment-analysis"], "supportedLanguages": ["en", "es", "fr"], "status": "active"}',
      },
      {
        method: "PUT",
        path: "/api/agents/{id}",
        description:
          "Partially update an agent — any field can be updated independently",
        requiredRole: "org_admin",
        example:
          '{"endpointUrl": "https://api.myagent.ai/v2/chat", "capabilities": ["ticket-routing", "escalation"], "status": "training"}',
      },
      {
        method: "PUT",
        path: "/api/agents/{id}/deactivate",
        description:
          "Deactivate an agent (sets status to inactive). Agent data is preserved.",
        requiredRole: "org_admin",
      },
      {
        method: "GET",
        path: "/api/agents/org/{orgId}",
        description:
          "List all agents for an organization, sorted by creation date",
        requiredRole: "org_admin",
      },
      {
        method: "GET",
        path: "/api/agents/{id}",
        description: "Get a single agent definition by ID",
        requiredRole: "authenticated",
      },
    ],
  },
  // ─── Phase 4B ───────────────────────────────────────────────────────────────
  {
    title: "Task Management",
    description:
      "Create, assign, and track tasks across agents and team members. All authenticated roles can create tasks.",
    endpoints: [
      {
        method: "POST",
        path: "/api/tasks",
        description:
          "Create a new task. Any authenticated user (org_admin, team_member, end_customer) can create tasks.",
        requiredRole: "authenticated",
        example:
          '{"title": "Summarize Q3 support tickets", "description": "Use the SupportBot to summarize all open tickets from Q3.", "priority": "high", "language": "en", "tags": ["support", "q3", "summary"], "assignedAgentId": "agent-001", "assignedTo": "principal-abc123", "inputData": "ticket_export_q3.csv"}',
      },
      {
        method: "PUT",
        path: "/api/tasks/{id}",
        description:
          "Partially update a task (title, description, priority, language, tags, inputData, outputData)",
        requiredRole: "authenticated",
        example:
          '{"priority": "urgent", "tags": ["support", "q3", "escalated"], "outputData": "Summary: 423 tickets, 78% resolved..."}',
      },
      {
        method: "PUT",
        path: "/api/tasks/{id}/status",
        description:
          "Quick status update. Allowed values: pending, in_progress, completed, failed, cancelled",
        requiredRole: "authenticated",
        example: '{"status": "completed"}',
      },
      {
        method: "PUT",
        path: "/api/tasks/{id}/assign-agent",
        description:
          "Assign a task to a registered agent. Verifies the agent exists before assigning.",
        requiredRole: "org_admin",
        example: '{"agentId": "agent-002"}',
      },
      {
        method: "GET",
        path: "/api/tasks/org/{orgId}",
        description: "List all tasks for an organization, sorted newest-first",
        requiredRole: "org_admin",
      },
      {
        method: "GET",
        path: "/api/tasks/me",
        description:
          "Get tasks where the caller is either the creator or the assignee",
        requiredRole: "authenticated",
      },
      {
        method: "GET",
        path: "/api/tasks/agent/{agentId}",
        description: "List all tasks currently assigned to a specific agent",
        requiredRole: "authenticated",
      },
    ],
  },
  // ─── Phase 4C ───────────────────────────────────────────────────────────────
  {
    title: "Agent Conversations",
    description:
      "Persistent, per-user conversation history with AI agents. Messages are stored in the backend and available across sessions.",
    endpoints: [
      {
        method: "POST",
        path: "/api/conversations/{agentId}/message",
        description:
          'Send a message to an agent. Stores the user message, performs an HTTP outcall to the agent\'s endpoint (POST {"message": "..."}), stores the agent reply, and returns the full updated message list.',
        requiredRole: "authenticated",
        example:
          '{"agentId": "agent-001", "userMessage": "Summarize the open tickets from last week and flag any escalations."}',
      },
      {
        method: "GET",
        path: "/api/conversations/{agentId}/history",
        description:
          "Get full persistent conversation history between the caller and a specific agent. Auto-creates an empty conversation record if none exists yet.",
        requiredRole: "authenticated",
      },
    ],
  },
  // ─── Phase 5A ───────────────────────────────────────────────────────────────
  {
    title: "Plan Limits & Platform Metrics",
    description:
      "PaaS plan limit configuration and live platform-wide aggregate metrics for Super Admins",
    endpoints: [
      {
        method: "GET",
        path: "/api/platform/limits/{tier}",
        description:
          "Get the current plan limits for a given tier (free, starter, professional, enterprise). Returns custom overrides if set, otherwise defaults.",
        requiredRole: "authenticated",
        example: '{"tier": "professional"}',
      },
      {
        method: "PUT",
        path: "/api/platform/limits/{tier}",
        description:
          "Override the default plan limits for a given tier. Super Admin only. Changes apply immediately to all orgs on that tier.",
        requiredRole: "super_admin",
        example:
          '{"maxUsers": 150, "maxBranches": 25, "maxAgents": 25, "maxApiKeys": 75, "maxWallets": 25}',
      },
      {
        method: "GET",
        path: "/api/platform/metrics",
        description:
          "Get live aggregate platform metrics: total orgs, users, agents, tasks, wallets, active orgs, and breakdown by plan tier. Super Admin only.",
        requiredRole: "super_admin",
      },
    ],
  },
  // ─── Phase 5A-iii ───────────────────────────────────────────────────────────
  {
    title: "Tenant Management",
    description:
      "Super Admin controls for tenant activation, plan overrides, and white-label domain configuration per org",
    endpoints: [
      {
        method: "PUT",
        path: "/api/organizations/{orgId}/domain",
        description:
          "Set or update the custom domain and subdomain for a tenant org's white-label branded portal. Callable by org_admin (own org) or super_admin.",
        requiredRole: "org_admin",
        example:
          '{"customDomain": "myagency.com", "customSubdomain": "myagency"}',
      },
      {
        method: "PUT",
        path: "/api/organizations/{orgId}/plan",
        description:
          "Override the plan tier for a specific tenant org (e.g. upgrade free org to professional). Super Admin only.",
        requiredRole: "super_admin",
        example: '{"tier": "enterprise"}',
      },
      {
        method: "PUT",
        path: "/api/organizations/{orgId}/active",
        description:
          "Activate or deactivate a tenant org. Deactivated orgs are blocked from creating resources. Super Admin only.",
        requiredRole: "super_admin",
        example: '{"isActive": false}',
      },
    ],
  },
  // ─── Phase 5B ───────────────────────────────────────────────────────────────
  {
    title: "Platform Billing",
    description:
      "Super Admin platform revenue overview and per-tier plan limit configuration. Aggregate billing data across all tenant orgs.",
    endpoints: [
      {
        method: "GET",
        path: "/api/platform/billing/overview",
        description:
          "Get aggregate revenue overview: org counts per plan tier × plan pricing = estimated MRR. Super Admin only.",
        requiredRole: "super_admin",
      },
      {
        method: "GET",
        path: "/api/platform/limits",
        description:
          "Get plan limit configurations for all four tiers (free, starter, professional, enterprise) in a single call. Super Admin only.",
        requiredRole: "super_admin",
      },
      {
        method: "PUT",
        path: "/api/platform/limits/{tier}",
        description:
          "Update plan limits for a specific tier. Changes apply immediately to all orgs on that tier without requiring individual org updates.",
        requiredRole: "super_admin",
        example:
          '{"maxUsers": 200, "maxBranches": 30, "maxAgents": 30, "maxApiKeys": 100, "maxWallets": 30}',
      },
    ],
  },
  // ─── Phase 6B ───────────────────────────────────────────────────────────────
  {
    title: "Activity Feed",
    description:
      "Org-scoped and platform-wide activity feed showing real-time events across agents, tasks, users, and organizations",
    endpoints: [
      {
        method: "GET",
        path: "/api/activity/feed",
        description:
          "Get the activity feed. org_admin and team_member receive their org-scoped feed (50 most recent events). super_admin with no orgId receives the platform-wide feed (100 most recent). Events include: taskCreated, taskCompleted, taskFailed, agentRegistered, agentDeactivated, userInvited, userJoined, walletCreated, orgCreated.",
        requiredRole: "authenticated",
        example: '{"orgId": null}',
      },
    ],
  },
  // ─── Phase 6C ───────────────────────────────────────────────────────────────
  {
    title: "Notification Center",
    description:
      "In-app notification system with per-user delivery, read tracking, and admin broadcast. Auto-generates notifications on key platform events.",
    endpoints: [
      {
        method: "GET",
        path: "/api/notifications",
        description:
          "Get up to 50 most recent notifications for the caller, sorted newest-first. Includes unread count for badge display.",
        requiredRole: "authenticated",
      },
      {
        method: "PUT",
        path: "/api/notifications/{id}/read",
        description:
          "Mark a single notification as read. Caller must own the notification.",
        requiredRole: "authenticated",
        example: '{"id": "notif-042"}',
      },
      {
        method: "PUT",
        path: "/api/notifications/read-all",
        description:
          "Mark all of the caller's notifications as read in a single call. Returns the count of notifications marked.",
        requiredRole: "authenticated",
      },
      {
        method: "POST",
        path: "/api/notifications/system",
        description:
          "Push a system notification to a specific user. Super Admin or Org Admin only. Used for announcements, alerts, or manual nudges.",
        requiredRole: "org_admin",
        example:
          '{"userId": "principal-abc123", "title": "Action Required", "message": "Your plan limit is almost reached. Upgrade to avoid disruption.", "relatedId": "org-001"}',
      },
    ],
  },
  // ─── Phase 6D ───────────────────────────────────────────────────────────────
  {
    title: "Settings & Webhook",
    description:
      "Org-level and platform-level settings including webhook configuration for real HTTP outcalls on key events, and announcement banners for all users",
    endpoints: [
      {
        method: "GET",
        path: "/api/settings/org/{orgId}",
        description:
          "Get org-level settings: webhook URL, webhook events, notification toggles, default language, timezone. Callable by org_admin (own org) or super_admin.",
        requiredRole: "org_admin",
      },
      {
        method: "PUT",
        path: "/api/settings/org/{orgId}",
        description:
          "Update org-level settings. Webhook URL is stored and triggers real HTTP POST outcalls when events in webhookEvents occur (task.completed, task.failed, user.joined, agent.deactivated).",
        requiredRole: "org_admin",
        example:
          '{"webhookUrl": "https://hooks.myapp.com/events", "webhookEvents": ["task.completed", "user.joined"], "notifyOnTaskComplete": true, "notifyOnUserJoined": true, "notifyOnAgentDeactivated": false, "defaultLanguage": "en", "timezone": "America/New_York"}',
      },
      {
        method: "GET",
        path: "/api/settings/platform",
        description:
          "Get platform-level settings: announcement banner text, enabled flag, and campaign launch date. Available to all authenticated users (banner must be shown to all roles).",
        requiredRole: "authenticated",
      },
      {
        method: "PUT",
        path: "/api/settings/platform",
        description:
          "Update platform-level settings: announcement banner content, enabled toggle, and campaign launch date (Unix nanoseconds). Super Admin only.",
        requiredRole: "super_admin",
        example:
          '{"announcementBanner": "\ud83d\ude80 Phase 7 is live \u2014 check out the new automation features!", "announcementBannerEnabled": true, "launchDate": 1780000000000000000}',
      },
    ],
  },
  {
    title: "FFF Assets",
    description:
      "FinFracFran™ fractional asset management. Create and manage assets that can be divided into fractional ownership shares. Assets can represent real estate, businesses, intellectual property, revenue streams, or custom asset types.",
    endpoints: [
      {
        method: "POST",
        path: "/api/fff/assets",
        description:
          "Create a new fractional asset for an org. org_admin creates assets for their own org; super_admin can create for any org. Requires assetType, totalShares, and valuationUsd.",
        requiredRole: "org_admin",
        example:
          '{"orgId": "org-1", "name": "Downtown Office Building", "description": "Commercial property at 123 Main St", "assetType": "realEstate", "totalShares": 1000, "valuationUsd": 2500000}',
      },
      {
        method: "GET",
        path: "/api/fff/assets/{orgId}",
        description:
          "Get all fractional assets belonging to an org. Accessible by org members (org_admin, team_member) or super_admin.",
        requiredRole: "org_admin",
      },
      {
        method: "GET",
        path: "/api/fff/assets/id/{id}",
        description:
          "Get a single fractional asset by its ID. Returns full asset details including totalShares, valuationUsd, and isActive status.",
        requiredRole: "authenticated",
      },
      {
        method: "PUT",
        path: "/api/fff/assets/{id}",
        description:
          "Update a fractional asset's name, description, valuation, or active status. org_admin (own org) or super_admin only.",
        requiredRole: "org_admin",
        example:
          '{"name": "Downtown Office Building (Updated)", "valuationUsd": 2750000, "isActive": true}',
      },
    ],
  },
  {
    title: "FFF Ownership",
    description:
      "Fractional ownership share management. Issue shares of an asset to users and query ownership portfolios. Ownership records track who holds how many shares of each fractional asset.",
    endpoints: [
      {
        method: "POST",
        path: "/api/fff/ownership/issue",
        description:
          "Issue fractional ownership shares of an asset to a user. org_admin (own org) or super_admin. Validates asset exists and belongs to the org. Creates an ownership record linking the user to the asset.",
        requiredRole: "org_admin",
        example:
          '{"assetId": "fff-asset-1", "userId": "principal-abc123", "shares": 100}',
      },
      {
        method: "GET",
        path: "/api/fff/ownership/asset/{assetId}",
        description:
          "Get all ownership records for a specific asset. Returns an array of FractionalOwnership objects showing each holder's shares and issuance date.",
        requiredRole: "org_admin",
      },
      {
        method: "GET",
        path: "/api/fff/ownership/me",
        description:
          "Get the caller's full ownership portfolio — all assets the authenticated user holds shares in, across all orgs. Returns array of FractionalOwnership records.",
        requiredRole: "authenticated",
      },
    ],
  },
  // ─── Phase 7B (Revenue Splits) ──────────────────────────────────────────────
  {
    title: "Revenue Splits",
    description:
      "FinFracFran™ revenue distribution management. Create and distribute revenue split events across fractional asset owners. Each split records a total amount and per-recipient allocation; distributing a split marks it as paid and credits each recipient.",
    endpoints: [
      {
        method: "POST",
        path: "/api/fff/revenue-splits",
        description:
          "Create a pending revenue split for a fractional asset. Provide the total amount and a distribution array with per-recipient shares. org_admin (own org) or super_admin.",
        requiredRole: "org_admin",
        example:
          '{"assetId": "fff-asset-1", "totalAmountUsd": 50000, "distribution": [{"userId": "principal-abc123", "amountUsd": 30000}, {"userId": "principal-def456", "amountUsd": 20000}]}',
      },
      {
        method: "PUT",
        path: "/api/fff/revenue-splits/{splitId}/distribute",
        description:
          "Mark a revenue split as distributed and credit each recipient. Idempotent — re-calling on an already-distributed split is a no-op. org_admin (own org) or super_admin.",
        requiredRole: "org_admin",
        example: '{"splitId": "fff-split-1"}',
      },
      {
        method: "GET",
        path: "/api/fff/revenue-splits/{assetId}",
        description:
          "List all revenue splits for a specific fractional asset, sorted newest-first. Shows status (pending, distributed, cancelled) and full distribution breakdown per split.",
        requiredRole: "org_admin",
      },
    ],
  },
  // ─── Phase 7B (Franchise Links) ─────────────────────────────────────────────
  {
    title: "Franchise Links",
    description:
      "FinFracFran™ franchise relationship management between organizations. Establish franchisor\u2013franchisee relationships with royalty percentages, terms URLs, and lifecycle status tracking (pending \u2192 active \u2192 terminated).",
    endpoints: [
      {
        method: "POST",
        path: "/api/fff/franchise-links",
        description:
          "Create a new franchise relationship between two orgs. The franchisorOrgId org grants the franchiseeOrgId org franchise rights with a specified royaltyPct (0\u2013100). org_admin (own org as franchisor) or super_admin.",
        requiredRole: "org_admin",
        example:
          '{"franchisorOrgId": "org-1", "franchiseeOrgId": "org-2", "royaltyPct": 12.5, "termsUrl": "https://acme.com/franchise-terms"}',
      },
      {
        method: "PUT",
        path: "/api/fff/franchise-links/{id}/status",
        description:
          "Update the status of a franchise link. Allowed values: active (accept the relationship), terminated (end the relationship). Both parties (franchisor or franchisee org_admin) or super_admin are authorized.",
        requiredRole: "org_admin",
        example: '{"status": "active"}',
      },
      {
        method: "GET",
        path: "/api/fff/franchise-links/org/{orgId}",
        description:
          "Get all franchise links where the given org is either the franchisor or the franchisee. Returns both incoming and outgoing franchise relationships for the org.",
        requiredRole: "org_admin",
      },
      {
        method: "GET",
        path: "/api/fff/franchise-links/platform",
        description:
          "Get all franchise links across the entire platform. Super Admin only. Use for platform-wide franchise network visualization and oversight.",
        requiredRole: "super_admin",
      },
    ],
  },
  {
    title: "Search",
    description:
      "Platform-wide and org-scoped search across users, agents, tasks, and organizations.",
    endpoints: [
      {
        method: "GET",
        path: "searchOrg(orgId, query)",
        description:
          "Search across users, agents, and tasks within a specific organization. Returns up to 20 matched results. Org admin and team members restricted to their own org; super admin can search any org.",
        requiredRole: "org_admin, team_member, super_admin",
        example: '{ "orgId": "org_1", "query": "analytics" }',
      },
      {
        method: "GET",
        path: "searchPlatform(query)",
        description:
          "Platform-wide search across all organizations, users, agents, and tasks. Super admin only. Returns up to 30 matched results.",
        requiredRole: "super_admin",
        example: '{ "query": "john" }',
      },
    ],
  },
  {
    title: "Bulk Actions",
    description:
      "Perform batch operations on platform entities for efficient management.",
    endpoints: [
      {
        method: "POST",
        path: "bulkUpdateTaskStatus(ids, status)",
        description:
          "Update the status of multiple tasks at once. Returns counts of updated and failed tasks. Org admin can bulk-update tasks within their org; super admin can update any tasks.",
        requiredRole: "org_admin, super_admin",
        example:
          '{ "ids": ["task_1", "task_2", "task_3"], "status": "completed" }',
      },
    ],
  },
  {
    title: "Audit Log",
    description:
      "Retrieve platform and organization audit trail entries for compliance and monitoring.",
    endpoints: [
      {
        method: "GET",
        path: "getAuditLog(orgId?)",
        description:
          "Retrieve audit log entries. Org admin: returns last 100 entries for their organization. Super admin: pass null to retrieve platform-wide last 200 entries, or pass an orgId to filter by organization.",
        requiredRole: "org_admin, super_admin",
        example: '{ "orgId": null }',
      },
    ],
  },
  {
    title: "Agent Templates",
    description:
      "Manage reusable agent templates. Super admins create platform-wide public templates; org admins create private templates for their organization.",
    endpoints: [
      {
        method: "POST",
        path: "createAgentTemplate(input)",
        description:
          "Create a new agent template. Org admin creates a private template for their org. Super admin can create public platform-wide templates by setting isPublic: true.",
        requiredRole: "org_admin, super_admin",
        example:
          '{ "name": "Customer Support Bot", "description": "Handles tier-1 support inquiries", "systemPrompt": "You are a helpful support agent.", "endpointUrl": "https://api.openai.com/v1/chat/completions", "tags": ["support", "customer"], "isPublic": true }',
      },
      {
        method: "GET",
        path: "getAgentTemplates(orgId?)",
        description:
          "Retrieve agent templates. Returns org-private templates for the given org plus all public platform-wide templates. Pass null to retrieve public templates only.",
        requiredRole: "org_admin, team_member, super_admin",
        example: '{ "orgId": "org_1" }',
      },
      {
        method: "DELETE",
        path: "deleteAgentTemplate(id)",
        description:
          "Delete an agent template. Org admin can delete their org's private templates. Super admin can delete any template.",
        requiredRole: "org_admin, super_admin",
        example: '{ "id": "tmpl_1" }',
      },
      {
        method: "POST",
        path: "cloneAgentFromTemplate(templateId, orgId, nameOverride?, endpointUrlOverride?)",
        description:
          "Create a new agent definition from an existing template, with optional field overrides for name and endpoint URL. Checks the org's agent plan limit before creating.",
        requiredRole: "org_admin, super_admin",
        example:
          '{ "templateId": "tmpl_1", "orgId": "org_1", "nameOverride": "My Support Agent", "endpointUrlOverride": "https://my-api.example.com/v1/chat" }',
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

const PHASE_LABELS: Record<string, string> = {
  Organizations: "3A",
  Users: "3A",
  "Branches & Sites": "3A",
  "Wallets & ICP Transfers": "3B",
  "Subscriptions & Billing": "3C",
  "API Keys": "3D",
  "Agent Registry": "4A",
  "Task Management": "4B",
  "Agent Conversations": "4C",
  "Plan Limits & Platform Metrics": "5A",
  "Tenant Management": "5A",
  "Platform Billing": "5B",
  "Activity Feed": "6B",
  "Notification Center": "6C",
  "Settings & Webhook": "6D",
  "FFF Assets": "7B",
  "FFF Ownership": "7B",
  "Revenue Splits": "7B",
  "Franchise Links": "7B",
  Search: "7C",
  "Bulk Actions": "7C",
  "Audit Log": "7C",
  "Agent Templates": "7E",
};

export default function ApiDocumentation() {
  return (
    <div className="space-y-6" data-ocid="api_docs.page">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            API Documentation
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AAAgencies SerVSys REST API reference — Phases 1–7 · 27 sections
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
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-display">
                  {section.title}
                </CardTitle>
                {PHASE_LABELS[section.title] && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30"
                  >
                    Phase {PHASE_LABELS[section.title]}
                  </Badge>
                )}
              </div>
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
