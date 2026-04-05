# AAAgencies SerVSys™

## Current State
Phase 5A-i (PlanLimits type + storage + read APIs) and 5A-ii (enforcement in createBranch, createWallet, generateApiKey, registerAgent, registerUser/redeemInviteLink) are complete and live. The Organization type has no custom domain fields, and there are no super_admin APIs to override plan tiers or activate/deactivate tenants.

## Requested Changes (Diff)

### Add
- `customDomain: ?Text` and `customSubdomain: ?Text` fields to the `Organization` type
- `customDomain?: string` and `customSubdomain?: string` to `UpdateOrgInput` type (so org_admin can set via existing `updateOrganization`)
- `updateOrgDomain(orgId, customDomain, customSubdomain)` — org_admin (own org) or super_admin; updates domain/subdomain settings and returns updated Organization
- `setOrgPlanOverride(orgId, tier)` — super_admin only; changes an org's planTier
- `setOrgActive(orgId, isActive)` — super_admin only; activates or deactivates a tenant org
- All three methods added to `backend.d.ts` interface

### Modify
- `Organization` type in `main.mo`: added `customDomain` and `customSubdomain` optional fields
- `createOrganization`: initializes both fields to `null`
- `updateOrganization`: preserves or updates `customDomain`/`customSubdomain` from input
- `Organization` interface in `backend.d.ts`: added optional `customDomain` and `customSubdomain`
- `UpdateOrgInput` interface in `backend.d.ts`: added optional `customDomain` and `customSubdomain`

### Remove
- Nothing removed

## Implementation Plan
1. ✅ Add `customDomain: ?Text` and `customSubdomain: ?Text` to `Organization` type in `main.mo`
2. ✅ Add same fields to `UpdateOrgInput` type in `main.mo`
3. ✅ Update `createOrganization` record to initialize both as `null`
4. ✅ Update `updateOrganization` record to carry through `input.customDomain`/`input.customSubdomain`
5. ✅ Add `updateOrgDomain`, `setOrgPlanOverride`, `setOrgActive` APIs to `main.mo`
6. ✅ Update `Organization` and `UpdateOrgInput` interfaces in `backend.d.ts`
7. ✅ Add method signatures for all three new APIs to `backendInterface` in `backend.d.ts`
