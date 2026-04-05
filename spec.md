# AAAgencies SerVSys™

## Current State

`ApiDocumentation.tsx` was scaffolded in Phase 1A. It covers six sections:
- Organizations, Users, Wallets, AI Agents, Tasks, Invite Links

Missing from the documentation (added in Phases 1B and 2A):
- `updateMyProfile` (Phase 1B-i)
- `updateLastLogin` (Phase 1B-i)
- `createInviteLink`, `getInviteLinkByCode`, `getMyInviteLinks`, `getAllInviteLinks`, `redeemInviteLink`, `deactivateInviteLink` (Phase 1B-ii) — the existing "Invite Links" section only has 3 placeholder entries
- `submitLead`, `getAllLeads` (Phase 2A)

## Requested Changes (Diff)

### Add
- New `User Profile` section with `updateMyProfile` (POST, any authenticated user) and `updateLastLogin` (POST, any authenticated user)
- New `Marketing / Leads` section with `submitLead` (POST, public) and `getAllLeads` (GET, super_admin)

### Modify
- Expand the existing `Invite Links` section to include all 6 live invite endpoints: `createInviteLink`, `getInviteLinkByCode`, `getMyInviteLinks`, `getAllInviteLinks`, `redeemInviteLink`, `deactivateInviteLink`; each with description, required role, input/output shape and example where applicable
- Add a `Required Role` field to the `EndpointRow` display so each entry shows who can call it

### Remove
- Nothing removed

## Implementation Plan

1. Extend the `ApiEndpoint` type to include an optional `requiredRole` string field
2. Update `EndpointRow` to render a small role badge next to the method badge when `requiredRole` is set
3. Update `API_SECTIONS` data:
   - Expand `Invite Links` to all 6 endpoints with full descriptions and examples
   - Add `User Profile` section (2 endpoints)
   - Add `Marketing / Leads` section (2 endpoints)
4. No backend changes needed
