# Coding Agent Provider Architecture

The orchestrator should support three separate ways users can run the coding agent.

## 1. Anthropic — Proper Claude Subscription

```text
User
  ↓
Claude Code / Claude Agent SDK
  ↓
Anthropic
```

- Uses the Claude Agent SDK / Claude Code runtime.
- `anthropicSessionId` belongs to this provider.
- A session ID can be stored and used later to resume an existing Claude session.
- Users on this path authenticate through the supported Anthropic/Claude flow.

## 2. Ollama — Local Models

```text
User
  ↓
Ollama
  ↓
Local Model
```

- Runs models locally through Ollama.
- Does not require an Anthropic subscription.
- This path should not require `anthropicSessionId`.
- The orchestrator needs its own agent/tool loop or a compatible local coding-agent runtime.

## 3. OmniRoute Backend

```text
User
  ↓
Ollama / Agent Runtime
  ↓
OmniRoute Backend
  ↓
Routed Model
```

- OmniRoute is treated as a separate provider/backend path.
- It should not depend on an Anthropic session ID unless the specific OmniRoute setup explicitly requires one.
- Provider-specific configuration should be kept separate from Anthropic session state.

## Recommended Orchestrator Architecture

```text
                    YOUR ORCHESTRATOR
                           │
                  ┌────────┼────────┐
                  ↓        ↓        ↓
              Anthropic  Ollama  OmniRoute
                  │        │        │
             Claude SDK   Local   Routed
                  │       model   models
                  └────────┼────────┘
                           ↓
                      Coding Agent
                           ↓
                        Workspace
```

### Provider-aware session model

The session should not assume that every provider has an Anthropic session ID:

```ts
{
  provider: "anthropic" | "ollama" | "omniroute",

  anthropicSessionId?: string,

  // other provider-specific session data
}
```

Then the orchestrator can choose the appropriate runtime:

```ts
if (provider === "anthropic") {
  // Use Claude Agent SDK.
  // Resume with anthropicSessionId when available.
}

if (provider === "ollama") {
  // Use the Ollama/local-model agent flow.
}

if (provider === "omniroute") {
  // Use the OmniRoute backend.
}
```

## Key Principle

**`anthropicSessionId` is specific to the Anthropic/Claude Agent SDK path.**

It should **not** be mandatory for users running Ollama or OmniRoute.

The orchestrator's job is to provide one interface while keeping provider-specific authentication, sessions, and runtime behavior isolated.
