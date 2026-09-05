import { useState, useEffect } from "react"
import { useSocket, type OutgoingMessage } from "@/hooks/useSocket"
import { WorkspacePanel } from "@/components/WorkspacePanel"
import { SessionCard } from "@/components/SessionCard"
import { ChatPanel } from "@/components/ChatPanel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Activity } from "lucide-react"
import "./App.css"

interface Session {
  id: string
  status: "running" | "done" | "error"
  lastMessage?: string
}

function App() {
  const { status, send, on } = useSocket("ws://localhost:8080")
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)

  const createSession = () => {
    if (!selectedWorkspace) return
    send({ type: "create-session", payload: { workspaceId: selectedWorkspace } })

    on("session-created", (msg) => {
      if (msg.type === "session-created") {
        setSessions((prev) => [
          ...prev,
          { id: msg.payload.id, status: "running" },
        ])
      }
    })
  }

  const statusColor = {
    connected: "bg-green-500",
    disconnected: "bg-red-500",
    connecting: "bg-yellow-500",
    error: "bg-red-500",
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Realy</h1>
          <span className="text-sm text-muted-foreground">Multi-Agent Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${statusColor[status]}`} />
            <span className="text-sm text-muted-foreground capitalize">{status}</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-72 border-r flex flex-col">
          <WorkspacePanel
            send={send}
            on={on}
            selectedWorkspace={selectedWorkspace}
            onSelectWorkspace={setSelectedWorkspace}
          />

          {/* Sessions */}
          {selectedWorkspace && (
            <div className="border-t p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Sessions</h3>
                <Button size="sm" variant="outline" onClick={createSession}>
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </Button>
              </div>
              <div className="space-y-2 max-h-48 overflow-auto">
                {sessions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No sessions. Create one above.
                  </p>
                )}
                {sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    id={session.id}
                    status={session.status}
                    lastMessage={session.lastMessage}
                    isSelected={selectedSession === session.id}
                    onClick={() => setSelectedSession(session.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          <ChatPanel
            sessionId={selectedSession}
            send={send}
            on={on}
          />
        </div>
      </div>
    </div>
  )
}

export default App
