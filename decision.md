# Project Decisions

## 1. UserManager — Singleton Pattern

**File:** `apps/Backend/UserManager.ts`

**Why:** The backend handles multiple WebSocket connections. We need a single source of truth to track all connected users.

**What it does:**
- Stores all active WebSocket connections in a `users[]` array
- Uses the Singleton pattern so only one instance exists across the entire backend
- Without it, creating `new UserManager()` in multiple places would give each one its own empty list — losing track of connections

**How it works:**
- `private constructor` — prevents external instantiation
- `static instance` — holds the single instance
- `getInstance()` — returns the one existing instance (or creates it)

**Usage in `index.ts`:**
- `addUser(ws)` — when a user connects
- `removeUser(ws)` — when a user disconnects
- `broadcast(message)` — send to all connected users
