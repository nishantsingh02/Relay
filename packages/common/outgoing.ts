// Backend -> Frontend
import z from "zod";

export const WorkspaceCreatedSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string()
});

export type WorkspaceCreatedSchemaType = z.infer<typeof WorkspaceCreatedSchema>;

export const SessionCreatedSchema = z.object({
  id: z.string(),
});

export type SessionCreatedSchemaType = z.infer<typeof SessionCreatedSchema>;

export const MessageAdded = z.object({
  id: z.string(),
  message: z.string().optional(),
});

export type MessageAddedType = z.infer<typeof MessageAdded>;

export const AssistantMessageSchema = z.object({
  sessionId: z.string(),
  content: z.string(),
  id: z.string().optional(),
});

export type AssistantMessageType = z.infer<typeof AssistantMessageSchema>;


export type OutgoingMessagesType =
  | { type: "workspace-created"; payload: WorkspaceCreatedSchemaType }
  | { type: "session-created"; payload: SessionCreatedSchemaType }
  | { type: "message-added"; payload: MessageAddedType }
  | { type: "error"; payload: { message: string } }
  | { type: "init"; payload: { Workspaces: Workspace[] }}
  | { type: "assistant-message"; payload: AssistantMessageType }


 export type Workspace = {
  id: string
  name: string,
  path: string,
  sessions: Session[]
 }

 export type Session = {
  id: string,
  messages: Message[]
 }

 export type Message = {
  id?: string,
  role: "user" | "assistant" | "system",
  content?: string,
  payload?: {
    message: string
  }
 }