import { useState, useContext } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Plus, Terminal, ChevronRight, ChevronDown, MessageSquare } from "lucide-react"
import { AppContext } from "@/context/AppContext"

export function WorkspacePanel() {
  const {
    workspaces,
    setWorkspaces,
    send,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    selectedSessionId,
    setSelectedSessionId,
  } = useContext(AppContext)
  const [path, setPath] = useState("")
  const [expandedWorkspaceId, setExpandedWorkspaceId] = useState<string | null>(null)

  const createWorkspace = () => {
    if (!path.trim()) return

    // optimistic update
    setWorkspaces((prev) => [
      ...prev,
      { id: null as any, path, name: (path.split(/[\\/]/).pop() || path).replace(/^[\s"'‘'""\u201C\u201D\u2018\u2019]+|[\s"'‘'""\u201C\u201D\u2018\u2019]+$/g, ""), sessions: [] },
    ])

    send({ type: "create-workspace", payload: { path } })
    setPath("")
  }

  const createSession = (workspaceId: string) => {
    // optimistic update
    const tempId = "temp-" + Date.now()
    setWorkspaces((prev) =>
      prev.map((w) => {
        if (w.id === workspaceId) {
          return {
            ...w,
            sessions: [...w.sessions, { id: tempId, messages: [] }],
          }
        }
        return w
      })
    )

    send({ type: "create-session", payload: { workspaceId } })
  }

  const toggleWorkspace = (id: string) => {
    if (expandedWorkspaceId === id) {
      setExpandedWorkspaceId(null)
    } else {
      setExpandedWorkspaceId(id)
    }
    setSelectedWorkspaceId(id)
    setSelectedSessionId(null)
  }

  const selectSession = (sessionId: string) => {
    setSelectedSessionId(sessionId)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Workspaces</h2>
          <Badge variant="secondary">{workspaces.length}</Badge>
        </div>

        <div className="flex gap-2">
          <Input
            value={path}
            onChange={(e) => setPath(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createWorkspace()}
            placeholder="/path/to/project"
            className="text-sm"
          />
          <Button size="icon" onClick={createWorkspace} variant="outline">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {workspaces.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No workspaces yet. Add a path above.
          </div>
        )}

        {workspaces.map((ws) => (
          <div key={ws.id} className="mb-1">
            {/* Workspace button */}
            <div
              className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                selectedWorkspaceId === ws.id ? "bg-accent" : ""
              }`}
              onClick={() => toggleWorkspace(ws.id)}
            >
              {expandedWorkspaceId === ws.id ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{ws.name}</p>
                <p className="text-xs text-muted-foreground truncate">{ws.path}</p>
              </div>
              <Badge variant="outline" className="shrink-0">
                {ws.sessions.length}
              </Badge>
            </div>

            {/* Sessions list (expanded) */}
            {expandedWorkspaceId === ws.id && (
              <div className="ml-6 mt-1 space-y-1">
                {ws.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors text-sm ${
                      selectedSessionId === session.id ? "bg-accent border-l-2 border-primary" : ""
                    }`}
                    onClick={() => selectSession(session.id)}
                  >
                    <MessageSquare className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate font-mono text-xs">
                      {session.id.startsWith("temp-") ? "Creating..." : session.id.slice(0, 8) + "..."}
                    </span>
                  </div>
                ))}

                {/* Create session button */}
                <div
                  className="flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors text-sm text-muted-foreground"
                  onClick={() => createSession(ws.id)}
                >
                  <Plus className="h-3 w-3 shrink-0" />
                  <span>New Session</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
