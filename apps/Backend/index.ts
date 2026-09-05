import {WebSocket, WebSocketServer} from "ws"
import mongoose from "mongoose";
import { UserManager } from "./UserManager";

mongoose.connect(process.env.DB_URL!)

const server = new WebSocketServer({ port: 8080});

server.on("connection", (ws) => {
    UserManager.getInstance().addUser(ws);
})



