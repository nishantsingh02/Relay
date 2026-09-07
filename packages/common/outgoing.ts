import z from "zod";

export const WorkspaceCreatedSchema = z.object({
  id: z.string(),
});

export type WorkspaceCreatedSchemaType = z.infer<typeof WorkspaceCreatedSchema>;

export const SessionCreatedSchema = z.object({
  id: z.string(),
});

export type SessionCreatedSchemaType = z.infer<typeof SessionCreatedSchema>;

export const MessageAdded = z.object({
  id: z.string(),
});

export type MessageAddedType = z.infer<typeof MessageAdded>;

export type OutgoingMessagesType =
  | { type: "workspace-created"; payload: WorkspaceCreatedSchemaType }
  | { type: "session-created"; payload: SessionCreatedSchemaType }
  | { type: "message-added"; payload: MessageAddedType }
  | { type: "error"; payload: { message: string } };


  // to get this on frontend ( the backend sends this to fr when a user connect)
 export type ConnectionResponse = {
    Workspaces: Workspace[]
 }

 type Workspace = {
  id: string
  name: string,
  path: string,
  session: Sessions[]
 }

 type Sessions = {
  id: string,
  messages: Message[]
 }

 type Message = {
  role: "user",
  payload: {
    message: string
  }
 } | {
  role: "assistent",
  payload: any
 }