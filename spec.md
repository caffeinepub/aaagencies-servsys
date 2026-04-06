# AAAgencies SerVSys™ — Phase 6A

## Current State
Phases 1-5 fully live. Last mock data remains in OrgDashboard.tsx (MOCK_AGENTS, MOCK_TASKS, MOCK_ORGS fallback).

## Requested Changes (Diff)

### Add
- Real getAgentsByOrg(orgId) query for live agent count
- Real getTasksByOrg(orgId) query for live task count and recent tasks

### Modify
- OrgDashboard.tsx: remove all mock imports, wire live queries, add skeletons

### Remove
- MOCK_AGENTS, MOCK_ORGS, MOCK_TASKS imports and MockOrg type import

## Implementation Plan
1. Add getAgentsByOrg + getTasksByOrg queries dependent on org.id
2. Compute agentCount (active only) and taskCount (non-completed) from real data
3. Replace Recent Tasks panel with real Task[] from backend
4. Clean empty state when no org found (no mock fallback)
