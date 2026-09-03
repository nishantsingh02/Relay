import {WebSocket, WebSocketServer} from "ws"
import mongoose from "mongoose";
import { Workspace, WorkspaceModel } from "db";

mongoose.connect(process.env.DB_URL!)

const server = new WebSocketServer({ port: 8080});

server.on("connection", (ws) => {
    ws.on("message", async (msg) => {
        console.log(msg);
       await WorkspaceModel.create({
            path: "nishuHouse",
            name: "team-channel"
        })
    })
})
