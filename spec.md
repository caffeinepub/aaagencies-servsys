# AAAgencies SerVSys™

## Current State
- `Organizations.tsx` exists as a basic Super Admin page: list of orgs, create org dialog, plan tier badge, active/inactive badge
- Uses `MOCK_ORGS` as fallback when no real data; real orgs displayed when available
- No activate/deactivate toggle, no plan override dialog, no per-org resource count indicators
- Backend has `setOrgActive(orgId, isActive)`, `setOrgPlanOverride(orgId, tier)` APIs (5A-iii)
- Backend has `getAgentsByOrg`, `getBranchesByOrg`, `getTeamMembersByOrg` for per-org counts
- `getPlanLimits(tier)` available for limit context
- `DashboardLayout.tsx` routes `organizations` → `<Organizations />`

## Requested Changes (Diff)

### Add
- Activate/Deactivate toggle per org row — calls `setOrgActive(orgId, !isActive)` with confirmation AlertDialog
- Plan Override dialog — "Change Plan" button per org row, tier selector, calls `setOrgPlanOverride(orgId, tier)`
- Per-org resource count indicators — users, agents, branches inline in each row
- Remove `MOCK_ORGS` fallback — show real empty state when no orgs
- Loading skeletons while data loads
- Expandable row or side panel for org details (domain, subdomain, owner)

### Modify
- `Organizations.tsx` — expand from simple list to full tenant management UI
- Row layout: org name/description + resource counts + plan badge + active badge + action buttons (Change Plan, Activate/Deactivate)

### Remove
- `MOCK_ORGS` fallback import and usage

## Implementation Plan
1. Rewrite `Organizations.tsx` with:
   - Real data from `getAllOrganizations()` only (no mock fallback)
   - Per-org sub-queries for user/agent/branch counts (via `getTeamMembersByOrg`, `getAgentsByOrg`, `getBranchesByOrg`)
   - Activate/Deactivate toggle with AlertDialog confirmation
   - Plan Override dialog with PlanTier select
   - Resource count badges inline per row
   - Loading skeletons
   - Real empty state
