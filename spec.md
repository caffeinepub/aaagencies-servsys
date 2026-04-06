# AAAgencies SerVSys™

## Current State
- Backend for OrgSettings, PlatformSettings, webhook trigger is fully live (Phase 6D-i)
- `DashboardLayout.tsx` has an inline `SettingsPage` stub returning a "coming in Phase 1B" placeholder
- No real settings UI exists anywhere
- `NotificationCenter` is live in the topbar
- `backend.d.ts` exposes: `getOrgSettings`, `updateOrgSettings`, `getPlatformSettings`, `updatePlatformSettings`, `updateMyProfile`

## Requested Changes (Diff)

### Add
- New `src/frontend/src/pages/dashboard/SettingsPage.tsx` with three tabs:
  - **Account** (all roles): display name input, email read-only, preferred language selector (7 languages), avatar URL input — save via `updateMyProfile()`
  - **Organization** (org_admin only): default language, timezone, webhook URL, webhook events checkboxes (task.completed, task.failed, user.joined, agent.deactivated) — save via `updateOrgSettings(orgId, settings)`
  - **Platform** (super_admin only): announcement banner text, enable/disable toggle — save via `updatePlatformSettings(settings)`
- Announcement banner in `DashboardLayout.tsx`: rendered at top of main content area when `announcementBannerEnabled` is true; dismissable per session (local state)

### Modify
- `DashboardLayout.tsx`: remove inline `SettingsPage` stub, import real `SettingsPage`, add announcement banner above page content, pass `user` prop to `SettingsPage`

### Remove
- Inline `SettingsPage` function stub in `DashboardLayout.tsx`

## Implementation Plan
1. Create `src/frontend/src/pages/dashboard/SettingsPage.tsx` with Account/Org/Platform tabs, loading/save states, toast feedback
2. Update `DashboardLayout.tsx`: remove stub, import real page, add dismissable announcement banner from `getPlatformSettings()`
