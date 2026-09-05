import { useEffect, useRef, useState, useCallback } from "react"

export type IncomingMessage =
  | { type: "create-workspace"; payload: { path: string } }
  | { type: "create-session"; payload: { workspaceId: string } }
  | { type: "add-message"; payload: { sessionId: string; message: string } }

export type OutgoingMessage =
  | { type: "workspace-created"; payload: { id: string } }
  | { type: "session-created"; payload: { id: string } }
  | { type: "message-added"; payload: { id: string } }
  | { type: "error"; payload: { message: string } }

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error"

export function useSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null)
  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const [lastMessage, setLastMessage] = useState<OutgoingMessage | null>(null)
  const listenersRef = useRef<Map<string, ((msg: OutgoingMessage) => void)[]>>(new Map())

  useEffect(() => {
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => setStatus("connected")
    ws.onclose = () => setStatus("disconnected")
    ws.onerror = () => setStatus("error")

    ws.onmessage = (e) => {
      try {
        const msg: OutgoingMessage = JSON.parse(e.data)
        setLastMessage(msg)

        const listeners = listenersRef.current.get(msg.type)
        listeners?.forEach((fn) => fn(msg))

        const allListeners = listenersRef.current.get("*")
        allListeners?.forEach((fn) => fn(msg))
      } catch {
        console.error("Failed to parse WS message")
      }
    }

    return () => ws.close()
  }, [url])

  const send = useCallback((msg: IncomingMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  const on = useCallback((type: string, fn: (msg: OutgoingMessage) => void) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, [])
    }
    listenersRef.current.get(type)!.push(fn)

    return () => {
      const list = listenersRef.current.get(type)
      if (list) {
        const idx = list.indexOf(fn)
        if (idx > -1) list.splice(idx, 1)
      }
    }
  }, [])

  return { status, send, lastMessage, on }
}
