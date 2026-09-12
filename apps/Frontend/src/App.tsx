import "./App.css";
import useSocket from "./hooks/useSocket";
import { AppContext } from "./context/AppContext";
import { useEffect, useState } from "react";
import type { Workspace } from "common";

function App() {
  const { loading, socket } = useSocket();
  const [worksapces, setworkspaces] = useState<Workspace[]>([]);

  if (loading) {
    return <div>laoding...</div>;
  }

  useEffect(() => {
    if (!loading && socket) {
      // data => init | and other msg see file outgoing.ts
      socket.onmessage = (data) => { // listen msg from backend
        const parsedData = JSON.parse(data.toString()); 
        if (parsedData.type === "init") {
          const worksapces: Workspace[] = parsedData.workspaces;
          setworkspaces(worksapces);
        }
      };
    }
  }, [loading]);

  return (
    <AppContext.Provider value={{ worksapces, socket }}>
      <div className="flex">
        <div className="flex-1">
          <Sidebar />
        </div>
        <div className="flex-6">chatWindow</div>
      </div>
    </AppContext.Provider>
  );
}

function Sidebar(socket: { socket: WebSocket }) {}

export default App;
