import "./App.css";
import useSocket from "./hooks/useSocket";
import { AppContext } from "./context/AppContext";
import { useContext, useEffect, useState } from "react";
import type { Workspace } from "common";

function App() {
  const { loading, socket } = useSocket();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

  // useEffect(() => {
  //   if (!loading && socket) {
  //     socket.onmessage = (parsedData) => {
  //       // const parsedData = JSON.parse(data.toString());
  //       if (parsedData.type === "init") {
  //         const workspaces: Workspace[] = parsedData.Workspaces;
  //         setWorkspaces(workspaces);
  //       }
  //       if(parsedData.type === "workspace-created") {
  //         setWorkspaces(workspaces => workspaces.map(w => {
  //           if(w.id == null) {
  //             return {
  //               ...w,
  //               ...parsedData.payload
  //             }
  //           } else {
  //             return w;
  //           }
  //         }))
  //       }
  //     };
  //   }
  // }, [loading, socket]);

  useEffect(() => {
    if (!loading && socket) {
      socket.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);
        if (parsedData.type === "init") {
          const workspaces: Workspace[] = parsedData.Workspaces;
          setWorkspaces(workspaces);
        }
        if(parsedData.type === "workspace-created") {
          setWorkspaces(workspaces => workspaces.map(w => {
            if(w.id == null) {
              return {
                ...w,
                ...parsedData.payload
              }
            } else {
              return w;
            }
          }))
        }
      };
    }
  }, [loading, socket]);

  if (loading) {
    return <div>laoding...</div>;
  }

  return (
    <AppContext.Provider value={{ workspaces, socket, setWorkspaces }}>
      <div className="flex">
        <div className="flex-1">
          <Sidebar />
        </div>
        <div className="flex-6">chatWindow</div>
      </div>
    </AppContext.Provider>
  );
}

function Sidebar() {
  const { socket, workspaces, setWorkspaces } = useContext(AppContext)
  const [path, setPath] = useState("")

  return <div>
    {JSON.stringify(workspaces[workspaces.length - 1])}
    {/* creating a new workspace. give path as a input */}
    <input type="text" placeholder="Path" onChange={(e) => setPath(e.target.value)} /> 
    <button onClick={() => {
      setWorkspaces((w: Workspace[]) => [...w, {
        path: path,
        id: null
      }])
      setPath("")
      socket?.send(JSON.stringify({
        type: "create-workspace",
        payload: {
          path
        }
      }))
    }}>Create</button>
  </div>
}

export default App;
