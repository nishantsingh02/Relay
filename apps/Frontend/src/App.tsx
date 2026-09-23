import "./App.css";
import useSocket from "./hooks/useSocket";
import { AppContext } from "./context/AppContext";
import { useEffect, useState } from "react";
import type { Workspace } from "common";
import { WorkspacePanel } from "./components/WorkspacePanel";
import { ChatPanel } from "./components/ChatPanel";
import { Moon, Sun } from "lucide-react";
import { Button } from "./components/ui/button";

function App() {
  const { loading, socket, send, on } = useSocket();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("theme") as "light" | "dark") || "light";
  });

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
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!loading && socket) {
      const unsubInit = on("init", (msg) => {
        setWorkspaces(msg.Workspaces);
      });

      const unsubWsCreated = on("workspace-created", (msg) => {
        setWorkspaces((prev) =>
          prev.map((w) => {
            if (w.id == null) {
              return { ...w, ...msg.payload };
            }
            return w;
          })
        );
      });

      const unsubSessionCreated = on("session-created", (msg) => {
        setWorkspaces((prev) =>
          prev.map((w) => {
            if (w.id === selectedWorkspaceId) {
              const realSession = { id: msg.payload.id, messages: [] };
              const withoutTemp = w.sessions.filter((s) => !s.id.startsWith("temp-"));
              return { ...w, sessions: [...withoutTemp, realSession] };
            }
            return w;
          })
        );
        setSelectedSessionId(msg.payload.id);
      });

      const unsubMsgAdded = on("message-added", (msg) => {
        setWorkspaces((prev) =>
          prev.map((w) => {
            if (w.id === selectedWorkspaceId) {
              return {
                ...w,
                sessions: w.sessions.map((s) => {
                  if (s.id === selectedSessionId) {
                    return {
                      ...s,
                      messages: [
                        ...s.messages,
                        {
                          id: msg.payload.id ?? crypto.randomUUID(),
                          role: "user",
                          payload: { message: msg.payload.message },
                        },
                      ],
                    };
                  }
                  return s;
                }),
              };
            }
            return w;
          })
        );
      });

      const unsubError = on("error", (msg) => {
        console.error("Server error:", msg.payload.message);
      });

      return () => {
        unsubInit();
        unsubWsCreated();
        unsubSessionCreated();
        unsubMsgAdded();
        unsubError();
      };
    }
  }, [loading, socket, on, selectedWorkspaceId, selectedSessionId]);

  // useEffect(() => {
  //   if (!loading && socket) {
  //     const unsub = on("message-added", (msg) => {
  //       if (msg.type === "message-added") {
  //         // handle message added
  //       }
  //     });
  //     return unsub;
  //   }
  // }, [loading, socket, on]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">loading...</div>;
  }

  return (
    <AppContext.Provider
      value={{
        workspaces,
        socket,
        setWorkspaces,
        send,
        on,
        selectedWorkspaceId,
        setSelectedWorkspaceId,
        selectedSessionId,
        setSelectedSessionId,
        theme,
        setTheme,
      }}
    >
      <div className="flex h-screen bg-background text-foreground">
        <div className="w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h1 className="font-semibold">Realy</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
          <WorkspacePanel />
        </div>
        <div className="flex-1 flex flex-col">
          <ChatPanel />
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
