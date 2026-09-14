import { WebSocket } from "ws";
import { CreateSessionSchema, CreateWorkspaceSchema, AddMessageSchema, type IncomingMessageType, type OutgoingMessagesType } from "common"
import { SessionModel, WorkspaceModel } from "db";
import mongoose from "mongoose";

export class User {
    private socket: WebSocket;
    public id: string; // every user have there own uuid

    constructor(id: string, socket: WebSocket) {
        this.socket = socket; // (ws) saves the WS connection to this instance
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
            name: data.path.split(/[\\/]/).pop() ?? "untitled"
           })

           return {
            type: "workspace-created",
            payload: { id: workspace._id.toString(), path: workspace.path, name: workspace.name }
           }

        } else if (msg.type === "create-session") {
            const { success, data } =  CreateSessionSchema.safeParse(msg.payload);
            if(!success) {
                return { type: "error" , payload: { message: "Invalid session data" } }
            }

            const session = await SessionModel.create({
                workspaceId: new mongoose.Types.ObjectId(data.workspaceId),
                conversation: []
            })

            return {
                type: "session-created",
                payload: { id: session._id.toString() }
            }

        } else {
            // msg.type === "add-message"
            const { success, data } = AddMessageSchema.safeParse(msg.payload);
            if (!success) {
                return { type: "error", payload: { message: "Invalid message data" } };
            }

            const session = await SessionModel.findByIdAndUpdate(
                data.sessionId,
                { $push: { conversation: { role: "user", content: data.message } } },
                { new: true }
            );

            if (!session) {
                return { type: "error", payload: { message: "Session not found" } };
            }

            return {
                type: "message-added",
                payload: { id: session._id.toString() }
            };
        }
    }

}