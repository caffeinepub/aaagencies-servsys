# AAAgencies SerVSys™

## Current State
`MyOrganization.tsx` (Org Admin) shows org details and a language settings card, with an Edit form for name/description/logo/language fields. It still falls back to `MOCK_ORGS[0]` when `getMyOrganization()` returns null, rather than showing a proper empty/loading state. The `Organization` type in `backend.d.ts` already has `customDomain?: string` and `customSubdomain?: string` fields. The `updateOrgDomain(orgId, customDomain, customSubdomain)` API is live in the backend.

## Requested Changes (Diff)

### Add
- New "Custom Domain & Branding" card in the view state (read-only display of current domain/subdomain, with a "Branded Portal" badge when set)
- Domain edit fields (`customDomain`, `customSubdomain`) in the existing Edit form — saved via `updateOrgDomain()` mutation with loading spinner and success/error toasts
- Proper empty/loading state when org is null (remove `MOCK_ORGS` fallback)

### Modify
- `toDisplayOrg` helper — remove `MOCK_ORGS` fallback; return null/empty when no real org
- `DisplayOrg` type — add `customDomain` and `customSubdomain` optional fields
- `EditForm` type — add `customDomain` and `customSubdomain` fields
- Edit form `startEditing` — pre-populate domain fields from current org
- Save flow — when domain fields have changed, call `updateOrgDomain()` in addition to (or instead of) `updateOrganization()`
- View state grid — add a third card for Custom Domain & Branding

### Remove
- `MOCK_ORGS` import and fallback usage in `toDisplayOrg`
- `MockOrg` type import

## Implementation Plan
1. Update `DisplayOrg` and `EditForm` types to include `customDomain` and `customSubdomain`
2. Remove `MOCK_ORGS` / `MockOrg` fallback; show proper empty state when org is null
3. Add domain fields to the Edit form
4. Add a `updateDomainMutation` that calls `updateOrgDomain()`; on Save, call both `updateMutation` and `updateDomainMutation` if domain fields changed
5. Add "Custom Domain & Branding" read-only card in view mode
