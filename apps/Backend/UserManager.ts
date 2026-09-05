import { WebSocket } from "ws";
import { User } from "./User";
import { uuid } from "uuidv4";

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
  addUser(ws: WebSocket) {
    const id = uuid();
    const user = new User(id, ws); 
    this.users.push(user);

    ws.on("message", async (msg) => {
      try {
        const parsedMessage = JSON.parse(msg.toString());
        user.handleIncomingMessages(parsedMessage);
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
