# AAAgencies SerVSys™

## Current State
Phases 1–3 fully complete. Phase 4A is live (backend agent registry + wired frontend). Backend has: Organization, Branch, User, InviteLink, Lead, WalletAccount, Transaction, ApiKey, AgentDefinition types and all their CRUD APIs.

## Requested Changes (Diff)

### Add
- `TaskStatus` variant: `#pending | #in_progress | #completed | #failed | #cancelled`
- `TaskPriority` variant: `#low | #medium | #high | #urgent`
- `Task` type: id, orgId, createdBy, assignedAgentId?, assignedTo?, title, description, status, priority, language, tags[], inputData?, outputData?, createdAt, updatedAt
- `TaskInput` input type
- `TaskUpdateInput` partial update type (all optional fields + status)
- `tasks` stable map + `nextTaskId` counter
- `createTask(input)` — any registered user; scoped to their org
- `updateTask(id, input)` — creator, org_admin (same org), or super_admin
- `updateTaskStatus(id, status)` — creator, assignee, org_admin (same org), or super_admin
- `assignTaskToAgent(taskId, agentId)` — verifies agent exists; creator, org_admin, or super_admin
- `getTasksByOrg(orgId)` — org_admin (same org) or super_admin; sorted newest-first
- `getMyTasks()` — any registered user; returns tasks where createdBy = caller OR assignedTo = caller; sorted newest-first
- `getTasksByAgent(agentId)` — any registered user; returns tasks assigned to the given agent
- All Task types + 7 API methods added to `backend.d.ts`

### Modify
- `main.mo`: added `isRegisteredUser` helper; added `tasks` map and `nextTaskId` counter alongside existing stable state
- `backend.d.ts`: appended `TaskStatus`, `TaskPriority`, `Task`, `TaskInput`, `TaskUpdateInput` enums/interfaces and all 7 task method signatures to `backendInterface`

### Remove
- Nothing removed

## Implementation Plan
1. Add TaskStatus, TaskPriority, Task types to main.mo ✓
2. Add TaskInput, TaskUpdateInput input types to main.mo ✓
3. Add tasks map + nextTaskId counter to actor state ✓
4. Implement all 7 task APIs with correct role/auth checks ✓
5. Append all Task types + API signatures to backend.d.ts ✓
6. Deploy to get updated bindings for frontend wiring in 4B-ii
