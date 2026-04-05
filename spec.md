# AAAgencies SerVSys™

## Current State
- Phase 5A (backend) is fully complete: PlanLimits type, enforcement, custom domain, platform metrics, org activation/plan override APIs
- Phase 5B-i: PlatformOverview.tsx shows live metrics from getPlatformMetrics()
- Phase 5B-ii: Organizations.tsx is full tenant management with activate/deactivate and plan override
- No `PlatformBilling.tsx` page exists yet
- DashboardLayout.tsx has no "Platform Billing" nav entry in SUPER_ADMIN_NAV

## Requested Changes (Diff)

### Add
- `src/frontend/src/pages/dashboard/SuperAdmin/PlatformBilling.tsx` — new Super Admin page:
  - Revenue Overview section: aggregate MRR estimate per tier (tier org count × plan price), display-only
  - Plan Limit Configuration section: editable table for all 4 tiers showing all 5 limit fields, loads from getPlanLimits() for all tiers, saves via setPlanLimits()
  - Loading skeletons for both sections
- "Platform Billing" nav entry in SUPER_ADMIN_NAV in DashboardLayout.tsx (icon: CreditCard)
- Import PlatformBilling in DashboardLayout and add case "platform-billing"

### Modify
- DashboardLayout.tsx: add `CreditCard` icon import, add nav item, add import + render case

### Remove
- Nothing

## Implementation Plan
1. Create PlatformBilling.tsx:
   - Load all 4 plan limits in parallel with 4x getPlanLimits() calls
   - Revenue Overview: hardcoded plan prices (Free=$0, Starter=$29, Professional=$99, Enterprise=custom), use getPlatformMetrics() orgsByPlan for counts, show estimated MRR
   - Plan Limit Config: editable number inputs per tier per field (maxUsers, maxBranches, maxAgents, maxApiKeys, maxWallets), per-tier save button calling setPlanLimits(), success/error toasts
   - Loading skeletons while data loads
2. Update DashboardLayout.tsx: add CreditCard to imports, add nav item, add import and switch case
