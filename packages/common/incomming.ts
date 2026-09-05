import z from "zod";

// just for the input ( so we add zod for the input type validation)
export const CreateWorkspaceSchema = z.object({
  path: z.string(),
});

// creates a TypeScript type automatically from the Zod schema
export type CreateWorkspaceSchemaType = z.infer<typeof CreateWorkspaceSchema>;

export const CreateSessionSchema = z.object({
  workspaceId: z.string(),
});
// infer -> create a typescript type
export type CreateSessionSchemaType = z.infer<typeof CreateSessionSchema>;

export const AddMessageSchema = z.object({
  sessionId: z.string(),
  message: z.string(),
});

export type AddMessageSchemaType = z.infer<typeof AddMessageSchema>;

export type IncomingMessageType =
  | { type: "create-session"; payload: CreateSessionSchemaType }
  | { type: "create-worksapce"; payload: CreateWorkspaceSchemaType }
  | { type: "add-message"; payload: AddMessageSchemaType };
