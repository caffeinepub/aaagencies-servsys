# AAAgencies SerVSys — Phase 4C-ii: Agent Chat UI

## Current State

- Backend is fully complete: `ConversationMessage`, `Conversation` types, `getConversationHistory(agentId)`, and `sendAgentMessage(agentId, userMessage)` with HTTP outcall are all live.
- `AiAgents.tsx` (Org Admin): shows agent cards with Edit / Deactivate buttons only.
- `ActiveAgents.tsx` (Team Member): shows read-only agent cards, no chat action.
- `ServicePortal.tsx` (End Customer): fully mock data, "Talk to an Agent" card shows a toast stub.
- `DashboardLayout.tsx`: renders all pages via `renderPage(pageId)`; no chat page or drawer imported yet.
- No shared chat component exists anywhere in the codebase.

## Requested Changes (Diff)

### Add
- `src/frontend/src/components/AgentChatInterface.tsx` — shared inner chat component used by both the full-page view and the drawer. Responsibilities:
  - Loads `getConversationHistory(agentId)` on mount.
  - Message input + send → calls `sendAgentMessage(agentId, userMessage)`.
  - Message bubbles: user messages right-aligned, agent messages left-aligned.
  - Timestamps (formatted from bigint nanoseconds).
  - Loading/typing indicator while awaiting backend response.
  - Error messages (`isError: true`) shown with a red tint.
  - If agent has no endpoint, shows a banner "No endpoint configured — messages will be echoed back" (graceful).
  - Auto-scrolls to latest message.
  - Agent info header: name, status badge, model type.
- `src/frontend/src/components/AgentChatDrawer.tsx` — slide-in Sheet/drawer wrapping `AgentChatInterface`. Accepts `agent: AgentDefinition`, `open: boolean`, `onClose: () => void`.
- `src/frontend/src/pages/dashboard/chat/AgentChatPage.tsx` — full-page chat view with agent selector dropdown (if org has multiple active agents). Loads org agents, lets user pick one, renders `AgentChatInterface` below.

### Modify
- `AiAgents.tsx` (Org Admin): Add a "Test Chat" button on each agent card (only for `active` agents). Opens `AgentChatDrawer` with that agent pre-selected.
- `ActiveAgents.tsx` (Team Member): Add a "Chat" button on each agent card (only for `active` agents). Opens `AgentChatDrawer` with that agent pre-selected.
- `ServicePortal.tsx` (End Customer): Replace "Talk to an Agent" stub card with a real trigger that opens `AgentChatDrawer`. Load org agents, pick the first active one (or show agent selector). Replace mock recent requests with real `getMyTasks()` data.
- `DashboardLayout.tsx`:
  - Import `AgentChatPage` and add `case 'agent-chat'` to `renderPage`.
  - Add "Agent Chat" nav item to `TEAM_MEMBER_NAV` (MessageSquare icon, id: `agent-chat`).
  - Add "Agent Chat" nav item to `END_CUSTOMER_NAV` (MessageSquare icon, id: `agent-chat`).

### Remove
- Mock data usage in `ServicePortal.tsx` (MOCK_TASKS import and usage).

## Implementation Plan

1. Create `AgentChatInterface.tsx` — the shared inner component with all message, scroll, send, and error logic.
2. Create `AgentChatDrawer.tsx` — wraps the interface in a shadcn `Sheet` (side panel, slides in from right).
3. Create `AgentChatPage.tsx` — full-page view with agent selector and embedded interface.
4. Modify `AiAgents.tsx` — import drawer, add "Test Chat" button to active agent cards.
5. Modify `ActiveAgents.tsx` — import drawer, add "Chat" button to active agent cards.
6. Modify `ServicePortal.tsx` — wire "Talk to an Agent" to real drawer, wire recent requests to `getMyTasks()`.
7. Modify `DashboardLayout.tsx` — add Agent Chat page case, add nav items for Team Member and End Customer.
