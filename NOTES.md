# Realy - AI Agent Orchestrator: Unique Architectural Features & Vision

## 1. Competitive Landscape Analysis: Has This Been Done?

Most existing AI coding tools and orchestrators fall into narrow categories:

| Category | Examples | Limitations / Gaps |
| :--- | :--- | :--- |
| **IDE-Integrated Agents** | Cursor, Windsurf, GitHub Copilot Workspace | Locked inside a specific IDE; cannot orchestrate across multiple detached project directories or multiplex concurrent CLI runners. |
| **Standalone CLI Agents** | Claude Code CLI, Aider, Goose, Cline | Single-terminal, single-directory; lacks a centralized web dashboard, multi-workspace session state, and persistent DB history. |
| **LLM Workflow Builders** | Langflow, Flowise, Dify, n8n | Great for API pipelines/RAG, but not designed as local filesystem coding agent orchestrators executing real file edits and CLI tools across repos. |
| **Containerized Benchmarks / Autonomous Agents** | OpenHands (formerly OpenDevin), Devin | Heavy Docker-bound single-task environments rather than a lightweight developer-first control plane for local machines. |

---

## 2. Realy's Unique Value Propositions (Differentiators)

### 🌟 1. Multi-Workspace & Multi-Session Control Plane
* Manage multiple distinct local directories (workspaces) concurrently from a single unified UI.
* Spawn, monitor, pause, and inspect multiple parallel agent sessions inside any workspace without terminal clutter.

### 🌟 2. Pluggable Multi-Runner Engine (Agnostic Agent Adapters)
Unlike tools tightly coupled to one proprietary API or SDK, Realy supports **pluggable agent drivers**:
* **Subprocess CLI Runner Adapter**: Orchestrates local CLI coding agents (`claude`, `aider`, `goose`) directly inside `workspace.path` by capturing stdin/stdout streams.
* **Provider-Agnostic Agentic Loop**: Built-in tool-calling engine (Read, Write, Edit, Glob, Bash) compatible with:
  * **Free Cloud Tiers**: Google Gemini 2.5 (generous free rate limits), OpenRouter, Groq.
  * **100% Free / Local Privacy**: Ollama (Qwen 2.5 Coder, DeepSeek Coder).
  * **Paid APIs**: Anthropic Claude, OpenAI.
* **Zero-Subscription Lock-in**: Developers without a paid Anthropic/OpenAI subscription can still run fully autonomous coding agents across their repos using free local/cloud models.

### 🌟 3. Real-Time Multiplexed WebSocket Event Streaming
* Live bi-directional streaming of:
  * Agent reasoning & thoughts
  * Tool calls (file reads, edits, diffs, bash commands)
  * Execution status (`running`, `done`, `error`, `awaiting_approval`)
* Session persistence in MongoDB so agent runs, logs, and histories are never lost.

### 🌟 4. Workspace Context & Tool Sandboxing
* Tools are scoped strictly to the target `workspace.path`.
* Cross-workspace agent tasks: Orchestrate agent A working on a backend repo while agent B operates on a frontend repo.

---

## 3. Step-by-Step Implementation Guide

Here is the exact blueprint to implement this in your codebase:

```
apps/Backend/
├── index.ts
├── UserManager.ts
├── User.ts
├── orchestrator/
│   ├── types.ts              # AgentRunner interface & event schemas
│   ├── ToolExecutor.ts       # Sandboxed local tools (Read, Edit, Glob, Bash)
│   ├── runners/
│   │   ├── CliSubprocessRunner.ts  # Runs `claude`, `aider`, or other CLIs
│   │   └── FreeLlmRunner.ts        # Agent loop via Gemini / Ollama / OpenRouter
│   └── Orchestrator.ts       # Coordinates active runner instances per session
```

---

### Step 1: Define the Pluggable Runner Protocol (`types.ts`)

Create a uniform interface that all agent runners implement:

```typescript
// apps/Backend/orchestrator/types.ts
export type AgentEvent =
  | { type: "thought"; content: string }
  | { type: "tool-call"; tool: string; args: any }
  | { type: "tool-result"; tool: string; output: string }
  | { type: "terminal-output"; raw: string }
  | { type: "status"; status: "running" | "done" | "error"; error?: string };

export interface AgentRunner {
  run(
    workspacePath: string,
    prompt: string,
    onEvent: (event: AgentEvent) => void
  ): Promise<void>;
  stop(): Promise<void>;
}
```

---

### Step 2: Implement Option A — CLI Subprocess Runner (`CliSubprocessRunner.ts`)

This runs the locally installed `claude` CLI (or `aider`/`goose`) in the target workspace directory without needing direct API keys in Node.js:

```typescript
// apps/Backend/orchestrator/runners/CliSubprocessRunner.ts
import { spawn, type ChildProcessWithoutNullStreams } from "child_process";
import type { AgentRunner, AgentEvent } from "../types";

export class CliSubprocessRunner implements AgentRunner {
  private process: ChildProcessWithoutNullStreams | null = null;

  async run(
    workspacePath: string,
    prompt: string,
    onEvent: (event: AgentEvent) => void
  ): Promise<void> {
    onEvent({ type: "status", status: "running" });

    // Spawns claude CLI with non-interactive / headless prompt in target directory
    this.process = spawn("claude", ["-p", prompt, "--dangerously-skip-permissions"], {
      cwd: workspacePath,
      shell: true,
      env: { ...process.env },
    });

    this.process.stdout.on("data", (data: Buffer) => {
      const output = data.toString();
      onEvent({ type: "terminal-output", raw: output });
    });

    this.process.stderr.on("data", (data: Buffer) => {
      const errorOutput = data.toString();
      onEvent({ type: "terminal-output", raw: errorOutput });
    });

    return new Promise((resolve) => {
      this.process?.on("close", (code) => {
        onEvent({
          type: "status",
          status: code === 0 ? "done" : "error",
        });
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}
```

---

### Step 3: Implement Option B — Free Multi-Provider Agent Loop (`FreeLlmRunner.ts`)

For zero subscriptions, build a lightweight agent loop with free tools using Google Gemini (via `@google/genai` or `@google/generative-ai`), Ollama, or OpenRouter:

```typescript
// apps/Backend/orchestrator/ToolExecutor.ts
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export class ToolExecutor {
  constructor(private workspacePath: string) {}

  async readFile(relPath: string): Promise<string> {
    const fullPath = path.resolve(this.workspacePath, relPath);
    return await fs.readFile(fullPath, "utf-8");
  }

  async writeFile(relPath: string, content: string): Promise<string> {
    const fullPath = path.resolve(this.workspacePath, relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
    return `Successfully wrote to ${relPath}`;
  }

  async runBash(command: string): Promise<string> {
    const { stdout, stderr } = await execAsync(command, { cwd: this.workspacePath });
    return stdout || stderr;
  }
}
```

---

### Step 4: Stream Agent Events Over WebSockets to Frontend (`User.ts`)

Update `handleIncomingMessages` in `User.ts` to stream events in real time:

```typescript
// Inside handleIncomingMessages for "add-message"
const runner = new CliSubprocessRunner(); // Or FreeLlmRunner

runner.run(workspace.path, data.message, (event) => {
  // Broadcast live events to frontend
  this.SendMessage({
    type: "agent-event",
    payload: {
      sessionId: data.sessionId,
      event,
    },
  });
});
```

---

### Step 5: Update Frontend WebSocket Handlers & UI

1. **Update `packages/common/outgoing.ts`**:
   Add `{ type: "agent-event"; payload: { sessionId: string; event: any } }` to `OutgoingMessagesType`.

2. **Update `ChatPanel.tsx` / `SessionCard.tsx`**:
   * Listen to `agent-event` on the socket.
   * Render real-time status badges (`Running`, `Done`, `Error`).
   * Render terminal output stream or tool execution pills (`Executed: Read file.ts`, `Wrote: index.js`).
