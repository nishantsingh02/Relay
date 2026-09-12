import type { Workspace } from "common"
import { createContext } from "react"

export const AppContext = createContext<{
    worksapces: Workspace[],
    socket: WebSocket | null
}>({
    worksapces: [],
    socket: null
})