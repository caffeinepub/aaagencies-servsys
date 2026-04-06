# AAAgencies SerVSys™

## Current State
- `OrgDashboard.tsx` — live data for agents/tasks/stats, has Recent Tasks card but no activity feed or trend charts
- `PlatformOverview.tsx` — live data from `getPlatformMetrics()`, has Recent Orgs/Recent Users panels, no activity feed
- `PlatformMetrics.tsx` — still uses `PLATFORM_METRICS` mock data from `mockData.ts`, has a BarChart with mock monthly growth data
- `backend.d.ts` — has `ActivityEvent`, `ActivityEventType`, and `getActivityFeed(orgId: string | null)` already defined
- `ActivityFeed` component — does not exist yet
- recharts is available in the project (already used in PlatformMetrics)

## Requested Changes (Diff)

### Add
- New shared `ActivityFeed.tsx` component in `src/frontend/src/components/` — live event list with icon per event type, actor name, description, relative timestamp; accepts orgId prop (null = platform-wide)
- Trend chart in `OrgDashboard.tsx` — bar chart showing tasks bucketed by day for last 7 days using tasks data already fetched
- Activity feed section in `OrgDashboard.tsx` — below Recent Tasks, calls `getActivityFeed(org.id)`
- Activity feed section in `PlatformOverview.tsx` — below existing panels, calls `getActivityFeed(null)` (platform-wide)

### Modify
- `PlatformMetrics.tsx` — replace all `PLATFORM_METRICS` mock data with real calls to `getPlatformMetrics()` + `getActivityFeed(null)` for trend chart (use real task/org counts from metrics; keep the BarChart but populate with real monthly-ish data derived from actual activity event timestamps)
- `OrgDashboard.tsx` — add ActivityFeed component + a 7-day task trend chart
- `PlatformOverview.tsx` — add ActivityFeed at the bottom

### Remove
- `PLATFORM_METRICS` mock import from `PlatformMetrics.tsx`

## Implementation Plan
1. Create `src/frontend/src/components/ActivityFeed.tsx` — reusable component; accepts `orgId: string | null`; calls `getActivityFeed(orgId)` internally; shows event-type icon, actor name, description, relative timestamp; loading skeleton; empty state; max 20 items displayed
2. Update `OrgDashboard.tsx` — add a 7-day tasks trend bar chart (bucket tasks already fetched by `createdAt` day), add `<ActivityFeed orgId={org.id} />` below the Recent Tasks card
3. Update `PlatformOverview.tsx` — add `<ActivityFeed orgId={null} />` section at the bottom of the page
4. Update `PlatformMetrics.tsx` — wire `getPlatformMetrics()` for stat cards, use `getActivityFeed(null)` to derive trend data (count events by day for last 7 days, plot as bar chart); remove PLATFORM_METRICS mock import
5. Validate (typecheck + lint + build)
