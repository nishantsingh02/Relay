import { WebSocket } from "ws";
import { User } from "./User";
import { v4 as uuid } from "uuid";
import { SessionModel, WorkspaceModel } from "db";
import type { Workspace } from "common";

// interface User {
//   socket: WebSocket;
// } // shifted this to User.ts file

//NOTE: in typescript a class gives you both a value and a type

export class UserManager {
  private users: User[]; // stores all connected users
  private static instance: UserManager; //  // ensures only ONE UserManager exists
  
  private constructor() {
    // prevents "new UserManager()" from outside
    this.users = [];
  }

  // returns the single instance
  static getInstance(): UserManager {
    if (UserManager.instance) {
      return UserManager.instance;
    }
    // else
    UserManager.instance = new UserManager();
    return UserManager.instance;
  }

  // methord addUser This addUser method does two things: Takes a WebSocket connection as a parameter ,Pushes it into the users array wrapped in an object
  async addUser(ws: WebSocket) {
    const id = uuid();
    const user = new User(id, ws); 
    this.users.push(user);

    const workspaces = await WorkspaceModel.find()
    const sessions = await SessionModel.find()

    const response: Workspace[] = [];

    // now i am trying to itrater over all the iteration

    workspaces.forEach(w => {
      const sessions = [];
      response.push({
        id: w._id.toString(),
        name: w.name,
        path: w.path,
        sessions: []
      })
      sessions.forEach(s => {
        if(s.workspaceId === w._id) {
          sessions.push({
            id: s._id.toString(),
            conversation: []
          })
        }
      })

    })

    ws.send(JSON.stringify({
      type: "init",
      Workspace: response
    }))

    ws.on("message", async (msg) => {
      try {
        const parsedMessage = JSON.parse(msg.toString());
        const responsePayload = await user.handleIncomingMessages(parsedMessage)
        user.SendMessage(responsePayload)

      } catch (err) {
        console.error("User sent non JSON format input");
        console.log(err);
      }
    });

    ws.on("close", () => {
        this.users = this.users.filter(x => x.id != id);
    })
  }
}
