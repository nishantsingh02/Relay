import z from "zod";

export const WorksapceCreatedSchema = z.object({
  id: z.string(),
});

export type WorksapceCreatedSchemaType = z.infer<typeof WorksapceCreatedSchema>;

export const SessionCreatedSchema = z.object({
  id: z.string(),
});

export type SessionCreatedSchemaType = z.infer<typeof SessionCreatedSchema>;

export const MessageAdded = z.object({
  id: z.string(),
});

export type MessageAddedType = z.infer<typeof MessageAdded>;

export type OutgoingMessagesType =
  | { type: "worksapce-created"; payload: WorksapceCreatedSchemaType }
  | { type: "session-createde"; payload: SessionCreatedSchemaType }
  | { type: "message-added"; payload: MessageAddedType };
