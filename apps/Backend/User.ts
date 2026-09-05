import { WebSocket } from "ws";
import type { IncomingMessageType } from "common"
import { Types } from "mongoose";

export class User {
    private socket: WebSocket;
    public id: String; // every user have there own uuid

    constructor(id: string, socket: WebSocket) {
        this.socket = socket;
        this.id = id
    }

    handleIncomingMessages(msg: IncomingMessageType) {
        
    }
}