import { useState, useRef, useEffect, useContext } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send, User, Bot } from "lucide-react"
import { AppContext } from "@/context/AppContext"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export function ChatPanel() {
  const { workspaces, selectedWorkspaceId, selectedSessionId, send } = useContext(AppContext)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeWorkspace = workspaces.find((w) => w.id === selectedWorkspaceId)
  const activeSession = activeWorkspace?.sessions.find((s) => s.id === selectedSessionId)

  const messages: Message[] = activeSession?.messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
  })) || []

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = () => {
    if (!input.trim() || !selectedSessionId) return

    send({ type: "add-message", payload: { sessionId: selectedSessionId, message: input } })
    setInput("")
  }

  if (!selectedSessionId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a session to start chatting
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <p className="text-sm font-medium">
          Session: {selectedSessionId.startsWith("temp-") ? "Creating..." : selectedSessionId.slice(0, 8) + "..."}
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="p-4 space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">
                No messages yet. Start the conversation.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
                {msg.role !== "user" && (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-3 py-2 max-w-[80%] text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
