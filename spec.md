# AAAgencies SerVSys™

## Current State
- Backend has Organization type with planTier field but no plan limit definitions or enforcement.
- No PlanLimits type, no stable storage for plan limits, no platform aggregate APIs.
- PlatformOverview.tsx uses mock metric data — no live getPlatformMetrics() call.
- 1,978 lines in main.mo; all Phases 1–4 fully live.

## Requested Changes (Diff)

### Add
- `PlanLimits` record type: maxUsers, maxBranches, maxAgents, maxApiKeys, maxWallets (all Nat)
- `PlatformMetrics` record type: totalOrgs, totalUsers, totalAgents, totalTasks, totalWallets, orgsByPlan (breakdown per tier)
- `planLimitsMap` stable Map<Text, PlanLimits> keyed by plan tier text ("free", "starter", "professional", "enterprise")
- Default plan limits initialized on first use (Free: 5/2/1/2/2, Starter: 20/5/5/10/5, Professional: 100/20/20/50/20, Enterprise: 999999/999999/999999/999999/999999)
- `getPlanLimits(tier: PlanTier)` — any authenticated user; returns PlanLimits for the given tier
- `setPlanLimits(tier: PlanTier, limits: PlanLimits)` — super_admin only; overrides defaults
- `getPlatformMetrics()` — super_admin only; returns live aggregate counts from stable maps
- `backend.d.ts` updated with PlanLimits, PlatformMetrics types and all three method signatures

### Modify
- Nothing modified in existing functions (enforcement comes in 5A-ii)

### Remove
- Nothing removed

## Implementation Plan
1. Add `PlanLimits` and `PlatformMetrics` record types after existing type definitions
2. Add `planLimitsMap` stable Map after existing stable maps; add `_getDefaultPlanLimits(tier)` private helper
3. Implement `getPlanLimits(tier)` — looks up planLimitsMap, falls back to defaults
4. Implement `setPlanLimits(tier, limits)` — super_admin auth check, upsert into planLimitsMap
5. Implement `getPlatformMetrics()` — super_admin auth check, iterate all stable maps for live counts
6. Update `backend.d.ts` with new types and three new method signatures
