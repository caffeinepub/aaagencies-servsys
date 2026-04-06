# AAAgencies SerVSys™

## Current State
- Backend has `ActivityEventType` variant, `ActivityEvent` type, `activityEvents` map, `_nextActivityId` counter, and `getActivityFeed(orgId?)` query API — all added in 6B-i-1.
- No `_recordActivity` internal helper exists yet.
- None of the existing mutation APIs (registerAgent, deactivateAgent, createTask, updateTaskStatus, createInviteLink, redeemInviteLink, createWallet, createOrganization) emit activity events.
- `backend.d.ts` has `ActivityEvent`, `ActivityEventType`, and `getActivityFeed` signatures from 6B-i-1.

## Requested Changes (Diff)

### Add
- `_recordActivity(event)` internal helper function that stores an `ActivityEvent` in `activityEvents` map using the `_nextActivityId` counter.
- Activity recording calls wired into 8 existing APIs:
  - `registerAgent` → `#agentRegistered`
  - `deactivateAgent` → `#agentDeactivated`
  - `createTask` → `#taskCreated`
  - `updateTaskStatus` → `#taskCompleted` (only when newStatus is `#completed`) and `#taskFailed` (only when newStatus is `#failed`)
  - `createInviteLink` → `#userInvited`
  - `redeemInviteLink` → `#userJoined`
  - `createWallet` → `#walletCreated`
  - `createOrganization` → `#orgCreated`
- Each call resolves actor name from `users` map for a readable description.

### Modify
- `registerAgent`, `deactivateAgent`, `createTask`, `updateTaskStatus`, `createInviteLink`, `redeemInviteLink`, `createWallet`, `createOrganization` — each gets a `_recordActivity(...)` call appended after the successful write, before the `#ok(...)` return.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `_recordActivity` private helper function after the existing Activity Feed type declarations.
2. Wire `_recordActivity` into `createOrganization` after `organizationsNew.add(...)` with `#orgCreated` event.
3. Wire `_recordActivity` into `createInviteLink` after `inviteLinks.add(...)` with `#userInvited` event (actor = caller; description includes role).
4. Wire `_recordActivity` into `redeemInviteLink` after `users.add(input.principal, newUser)` with `#userJoined` event (actor = new user principal).
5. Wire `_recordActivity` into `createWallet` after `wallets.add(...)` with `#walletCreated` event.
6. Wire `_recordActivity` into `registerAgent` after `agents.add(...)` with `#agentRegistered` event (targetId = agent.id, targetName = agent.name).
7. Wire `_recordActivity` into `deactivateAgent` after `agents.add(id, deactivated)` with `#agentDeactivated` event.
8. Wire `_recordActivity` into `createTask` after `tasks.add(id, task)` with `#taskCreated` event (targetId = task.id, targetName = task.title).
9. Wire `_recordActivity` into `updateTaskStatus` after `tasks.add(id, updated)` for `#completed` → `#taskCompleted` and `#failed` → `#taskFailed` transitions only.
