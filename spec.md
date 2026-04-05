# AAAgencies SerVSys™

## Current State

Phase 4B-i is complete: the backend has full Task management APIs — `createTask`, `updateTask`, `updateTaskStatus`, `assignTaskToAgent`, `getTasksByOrg`, `getMyTasks`, `getTasksByAgent` — all wired and published in `backend.d.ts` with `Task`, `TaskInput`, `TaskUpdateInput`, `TaskStatus`, and `TaskPriority` types.

Frontend task pages still use `MOCK_TASKS` from `mockData.ts`:
- `MyTasks.tsx` (Team Member) — read-only mock list with expand/collapse, no create
- `MyRequests.tsx` (End Customer) — read-only mock list, no create
- No Org Admin Task Management page exists yet

## Requested Changes (Diff)

### Add
- `src/frontend/src/pages/dashboard/OrgAdmin/TaskManagement.tsx` — new Org Admin page: full task list from `getTasksByOrg()`, create/edit/assign-to-agent dialogs, quick status update, filter by status/priority/agent, live counts in header
- Wire `task-management` nav entry into `ORG_ADMIN_NAV` in `DashboardLayout.tsx` (with `ListTodo` or `ClipboardList` icon), import and render `TaskManagement` in `renderPage`

### Modify
- `MyTasks.tsx` (Team Member): replace `MOCK_TASKS` with real `getMyTasks()` backend call; add Create Task button/dialog (title, description, priority, language, tags, optional agent assignment via `getAgentsByOrg()`); add quick status update via `updateTaskStatus()`; loading skeletons; empty state
- `MyRequests.tsx` (End Customer): replace `MOCK_TASKS` with real `getMyTasks()` backend call; add Create Request button/dialog (title, description, priority, language, tags); requests are tasks the end customer created; loading skeletons; empty state with friendly copy

### Remove
- All `MOCK_TASKS` imports from `MyTasks.tsx` and `MyRequests.tsx`

## Implementation Plan

1. **MyTasks.tsx** — wire `getMyTasks()`, load org agents via `getAgentsByOrg()` for assignment in create dialog; Create Task dialog with `createTask()`; inline status selector calls `updateTaskStatus()`; expand detail panel; loading/empty states
2. **TaskManagement.tsx** (new) — load org via `getMyOrganization()`, then `getTasksByOrg(orgId)`; `getAgentsByOrg(orgId)` for agent assignment dropdown; Create dialog, Edit dialog, Assign to Agent dialog, status update; filter bar (status, priority, agent); sortable table or card list
3. **MyRequests.tsx** — wire `getMyTasks()` (end customer sees tasks they created); Create Request dialog with `createTask()`; card list with status badges; loading/empty states
4. **DashboardLayout.tsx** — add `task-management` to `ORG_ADMIN_NAV`, import `TaskManagement`, wire into `renderPage`
