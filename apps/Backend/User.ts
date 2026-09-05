import { WebSocket } from "ws";
import { CreateSessionSchema, CreateWorkspaceSchema, AddMessageSchema, type IncomingMessageType, type OutgoingMessagesType } from "common"
import { SessionModel, WorkspaceModel } from "db";

export class User {
    private socket: WebSocket;
    public id: string; // every user have there own uuid

    constructor(id: string, socket: WebSocket) {
        this.socket = socket;
        this.id = id
    }

    async SendMessage(payload: OutgoingMessagesType) {
        this.socket.send(JSON.stringify(payload))
    }

    async handleIncomingMessages(msg: IncomingMessageType): Promise<OutgoingMessagesType> {
        if (msg.type === "create-workspace") {
           const { success, data } = CreateWorkspaceSchema.safeParse(msg.payload)
           if(!success) {
            return { type: "error", payload: { message: "Invalid workspace data" } };
           }

          const workspace = await WorkspaceModel.create({
            path: data.path,
            name: data.path.split("/").pop()
           })

           return {
            type: "workspace-created",
            payload: { id: workspace._id.toString() }
           }

        } else if (msg.type === "create-session") {
            const { success, data } =  CreateSessionSchema.safeParse(msg.payload);
            if(!success) {
                return { type: "error" , payload: { message: "Invalid session data" } }
            }

            const session = await SessionModel.create({
                workspaceId: data.workspaceId,
                conversation: []
            })

            return {
                type: "session-created",
                payload: { id: session._id.toString() }
            }

        } else {
            // when msg.type === "message-added"
            const { success, data } = AddMessageSchema.safeParse(msg.payload);
            if (!success) {
                return { type: "error", payload: { message: "Invalid message data" } };
            }

            const workspace = await SessionModel.updateOne({
                $where: {
                    id: data.sessionId
                }
            }, {
                conversation: {
                    $push: { type: "user" , payload: { message:  data.message }}
                }
            })

            return {
                type: "message-added",
                payload: { id: "1" }
            };
        }
    }
}