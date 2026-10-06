import { WebSocket } from "ws";
import {
  CreateSessionSchema,
  CreateWorkspaceSchema,
  AddMessageSchema,
  type IncomingMessageType,
  type OutgoingMessagesType,
} from "common";
import { SessionModel, WorkspaceModel } from "db";
import mongoose from "mongoose";
import { query } from "@anthropic-ai/claude-agent-sdk";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function getClaudeExecutablePath(): string | undefined {
  if (process.env.CLAUDE_PATH && fs.existsSync(process.env.CLAUDE_PATH)) {
    return process.env.CLAUDE_PATH;
  }

  const candidates = [
    "C:/nvm4w/nodejs/node_modules/@anthropic-ai/claude-code/bin/claude.exe",
    path.join(process.env.LOCALAPPDATA || "", "Programs/Claude/claude.exe"),
    path.join(
      process.env.APPDATA || "",
      "npm/node_modules/@anthropic-ai/claude-code/bin/claude.exe",
    ),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate.replace(/\\/g, "/");
    }
  }

  try {
    const out = execSync("where claude.exe", { encoding: "utf-8" });
    const lines = out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const firstLine = lines[0];
    if (firstLine && fs.existsSync(firstLine)) {
      return firstLine.replace(/\\/g, "/");
    }
  } catch {}

  return undefined;
}

export class User {
  private socket: WebSocket;
  public id: string; // every user have there own uuid

  constructor(id: string, socket: WebSocket) {
    this.socket = socket; // (ws) saves the WS connection to this instance
    this.id = id;
  }

  async SendMessage(payload: OutgoingMessagesType) {
    this.socket.send(JSON.stringify(payload));
  }

  async handleIncomingMessages(
    msg: IncomingMessageType,
  ): Promise<OutgoingMessagesType> {
    if (msg.type === "create-workspace") {
      const { success, data } = CreateWorkspaceSchema.safeParse(msg.payload);
      if (!success) {
        return {
          type: "error",
          payload: { message: "Invalid workspace data" },
        };
      }

      const name = (data.path.split(/[\\/]/).pop() ?? "untitled").replace(
        /^[\s"'‘’“”]+|[\s"'‘’“”]+$/g,
        "",
      );

      const workspace = await WorkspaceModel.findOneAndUpdate(
        { path: data.path },
        { $setOnInsert: { path: data.path, name } },
        { upsert: true, returnDocument: "after" },
      );

      return {
        type: "workspace-created",
        payload: {
          id: workspace._id.toString(),
          path: workspace.path,
          name: workspace.name,
        },
      };
    } else if (msg.type === "create-session") {
      const { success, data } = CreateSessionSchema.safeParse(msg.payload);
      if (!success) {
        return { type: "error", payload: { message: "Invalid session data" } };
      }

      const session = await SessionModel.create({
        workspaceId: new mongoose.Types.ObjectId(data.workspaceId),
        conversation: [],
      });

      return {
        type: "session-created",
        payload: { id: session._id.toString() },
      };
    } else {
      // msg.type === "add-message"
      const { success, data } = AddMessageSchema.safeParse(msg.payload);
      if (!success) {
        return { type: "error", payload: { message: "Invalid message data" } };
      }
      // featch the id from the db
      const sessions = await SessionModel.findById(
        new mongoose.Types.ObjectId(data.sessionId),
      );

      if (!sessions) {
        throw new Error("session does not exist " + data.sessionId);
      }

      const workspace = await WorkspaceModel.findOne({
        _id: sessions?.workspaceId,
      });

      if (!workspace) {
        throw new Error("workspace does not exist");
      }

      // add the msg to the DB.
      const session = await SessionModel.findByIdAndUpdate(
        data.sessionId,
        { $push: { conversation: { role: "user", content: data.message } } },
        { returnDocument: "after" },
      );

      if (!session) {
        return { type: "error", payload: { message: "Session not found" } };
      }

      // Agentic loop: streams messages as Claude works
      for await (const message of query({
        prompt: data.message,
        options: {
          pathToClaudeCodeExecutable: getClaudeExecutablePath(),
          cwd: workspace.path, // current working directry
          allowedTools: ["Read", "Edit", "Glob"], // Auto-approve these tools
          resume: sessions.antropicSessionId
            ? sessions.antropicSessionId
            : undefined,
          permissionMode: "acceptEdits", // Auto-approve file edits
        },
      })) {
        // Print human-readable output
        if (message.type === "assistant" && message.message?.content) {
          for (const block of message.message.content) {
            if ("text" in block) {
              console.log(block.text); // Claude's reasoning
              await this.SendMessage({
                type: "assistant-message",
                payload: {
                  sessionId: data.sessionId,
                  content: block.text,
                },
              });

              await SessionModel.findByIdAndUpdate(data.sessionId, {
                $push: {
                  conversation: { role: "assistant", content: block.text },
                },
              }, { returnDocument: "after" });
            } else if ("name" in block) {
              console.log(`Tool: ${block.name}`); // Tool being called
            }
          }
        } else if (message.type === "result") {
          console.log(`Done: ${message.subtype}`); // Final result
          if (!sessions.antropicSessionId) {
            sessions.antropicSessionId = message.session_id;
            await sessions.save(); //Save the current sessions data to the database.
          }
        }
      }

      return {
        type: "message-added",
        payload: { id: session._id.toString(), message: data.message },
      };
    }
  }
}
