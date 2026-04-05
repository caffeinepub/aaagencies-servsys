# AAAgencies SerVSys™

## Current State
Phases 1–4 are fully complete. Phase 5A (backend plan limits, enforcement, custom domain, platform metrics) and 5B (Super Admin platform overview, tenant management, platform billing) are live.

`SubscriptionBilling.tsx` (Org Admin) has a full Stripe-ready UI — current plan card, 4-tier plan comparison grid with static hardcoded feature text, billing history, and cancel section — but has no live usage bars or real limit data from the backend.

`MyOrganization.tsx` (Org Admin) shows org details and language settings wired to `getMyOrganization()`, but still uses a `MOCK_ORGS` fallback in `toDisplayOrg()` and has no custom domain/branding section.

## Requested Changes (Diff)

### Add
- Real-time usage bars section in `SubscriptionBilling.tsx`: fetch `getPlanLimits(tier)` and live resource counts (users via `getTeamMembersByOrg`, branches via `getBranchesByOrg`, agents via `getAgentsByOrg`, API keys via `listApiKeys`, wallets via `getWalletsByOrg`); render a Progress bar per resource with amber warning at ≥80%, red "At limit" at 100%, and an upgrade CTA when at 100%.
- Live limit values on plan comparison cards in `SubscriptionBilling.tsx`: replace hardcoded feature strings with real values from `getPlanLimits()` for all 4 tiers.
- Custom Domain & Branding card in `MyOrganization.tsx`: two inputs (`customDomain`, `customSubdomain`), pre-populated from org data, saved via `updateOrgDomain()`, read-only display with a "Branded Portal" badge when set.

### Modify
- `toDisplayOrg()` in `MyOrganization.tsx`: remove `MOCK_ORGS` fallback; return a null/empty state when org is not available.
- `SubscriptionBilling.tsx` plan feature lists: driven by live `getPlanLimits()` data instead of hardcoded strings.

### Remove
- `MOCK_ORGS` import and usage from `MyOrganization.tsx`.

## Implementation Plan
1. In `SubscriptionBilling.tsx`: fetch org → derive `planTier` → call `getPlanLimits(tier)` plus four parallel resource-count queries. Render a new "Resource Usage" card above the plan comparison grid with one row per resource (Progress bar, count label, warning/limit badge, upgrade CTA link).
2. In `SubscriptionBilling.tsx`: pass live `PlanLimits` values into a dynamic plan feature builder so each tier's card shows real numbers.
3. In `MyOrganization.tsx`: remove mock fallback; add a third card "Custom Domain & Branding" with `customDomain` and `customSubdomain` inputs wired to `updateOrgDomain()`; show read-only display with code-style labels and badge when values are set.
