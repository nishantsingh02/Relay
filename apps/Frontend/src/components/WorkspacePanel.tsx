import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FolderOpen, Plus, Terminal } from "lucide-react"
import type { useSocket } from "@/hooks/useSocket"

interface Workspace {
  id: string
  path: string
  name: string
  sessions: Session[]
}

interface Session {
  id: string
  status: "running" | "done" | "error"
  messages: { role: string; content: string }[]
}

interface WorkspacePanelProps {
  send: ReturnType<typeof useSocket>["send"]
  on: ReturnType<typeof useSocket>["on"]
  selectedWorkspace: string | null
  onSelectWorkspace: (id: string) => void
}

export function WorkspacePanel({ send, on, selectedWorkspace, onSelectWorkspace }: WorkspacePanelProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [path, setPath] = useState("")

  const createWorkspace = () => {
    if (!path.trim()) return
    send({ type: "create-workspace", payload: { path } })

    on("workspace-created", (msg) => {
      if (msg.type === "workspace-created") {
        setWorkspaces((prev) => [
          ...prev,
          { id: msg.payload.id, path, name: path.split("/").pop() || path, sessions: [] },
        ])
        setPath("")
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 border-r border-border h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Workspaces</h2>
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

      <div className="flex flex-col gap-2 flex-1 overflow-auto">
        {workspaces.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            No workspaces yet. Add a path above.
          </div>
        )}
        {workspaces.map((ws) => (
          <Card
            key={ws.id}
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedWorkspace === ws.id ? "border-primary bg-accent" : ""
            }`}
            onClick={() => onSelectWorkspace(ws.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{ws.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{ws.path}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {ws.sessions.length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
