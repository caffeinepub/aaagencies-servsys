# AAAgencies SerVSys™

## Current State
- Phases 1–3 fully complete: auth, orgs, branches, wallets, Stripe, API keys, lead admin
- Phase 4A live: AgentDefinition + full agent CRUD APIs; AiAgents.tsx and ActiveAgents.tsx wired
- Phase 4B live: Task type + full task CRUD APIs; MyTasks.tsx, TaskManagement.tsx, MyRequests.tsx wired
- No conversation/chat types or APIs exist yet

## Requested Changes (Diff)

### Add
- SenderRole variant: #user / #agent
- ConversationMessage type: id, agentId, orgId, senderId (Principal), senderRole, content, timestamp, isError
- Conversation type: id, agentId, userId (Principal), orgId, messages[], createdAt, lastMessageAt
- conversations stable map (Text to Conversation)
- nextConversationId and nextMessageId counters
- getConversationHistory(agentId): returns messages for caller+agent pair; creates empty conversation if none exists
- TypeScript types: SenderRole, ConversationMessage, Conversation
- backendInterface method: getConversationHistory

### Modify
- main.mo: append new types, storage vars, and getConversationHistory before closing brace
- backend.d.ts: append new types and interface method

### Remove
- Nothing

## Implementation Plan
1. Add SenderRole, ConversationMessage, Conversation types to main.mo
2. Add conversations map + counters to storage section
3. Implement getConversationHistory(agentId) — lookup or create conversation for caller+agentId, return messages
4. Append TypeScript types and getConversationHistory signature to backend.d.ts
