import type { Workspace } from "common"
import { createContext } from "react"

export const AppContext = createContext<{
    workspaces: Workspace[],
    socket: WebSocket | null,
    setWorkspaces: React.Dispatch<React.SetStateAction<Workspace[]>>,
    send: (msg: any) => void,
    on: (type: string, handler: (msg: any) => void) => () => void,
    selectedWorkspaceId: string | null,
    setSelectedWorkspaceId: (id: string | null) => void,
    selectedSessionId: string | null,
    setSelectedSessionId: (id: string | null) => void,
    theme: "light" | "dark",
    setTheme: (theme: "light" | "dark") => void,
}>({
    workspaces: [],
    socket: null,
    setWorkspaces: () => {},
    send: () => {},
    on: () => () => {},
    selectedWorkspaceId: null,
    setSelectedWorkspaceId: () => {},
    selectedSessionId: null,
    setSelectedSessionId: () => {},
    theme: "light",
    setTheme: () => {},
})
