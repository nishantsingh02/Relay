import {WebSocket, WebSocketServer} from "ws"
import mongoose from "mongoose";
import { Workspace, WorkspaceModel } from "db";
import { CreateWorkspaceSchema } from "common";

mongoose.connect(process.env.DB_URL!)

const server = new WebSocketServer({ port: 8080});

server.on("connection", (ws) => {
    UserManager.getInstance.adduser(ws);
})



