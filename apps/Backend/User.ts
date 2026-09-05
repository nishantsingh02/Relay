import { WebSocket } from "ws";
import { CreateWorkspaceSchema, type IncomingMessageType } from "common"
import { Types } from "mongoose";
import { WorkspaceModel } from "db";

export class User {
    private socket: WebSocket;
    public id: String; // every user have there own uuid

    constructor(id: string, socket: WebSocket) {
        this.socket = socket;
        this.id = id
    }

    async handleIncomingMessages(msg: IncomingMessageType) {
        if (msg.type === "create-worksapce") {
           const { success, data } = CreateWorkspaceSchema.safeParse(msg)
           if(!success) {
            return;
           }

           await WorkspaceModel.create({
            path: data.path,
            name: data.path.split("/").pop() // got the last name on from the path
           })

           this.socket.send({
            
           })

        } else if (msg.type === "create-session") {

        } else {
            // msg.type === "add-message"
        }
    }
}