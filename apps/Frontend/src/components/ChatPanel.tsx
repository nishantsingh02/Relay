import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, User, Bot } from "lucide-react"
import type { useSocket } from "@/hooks/useSocket"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

interface ChatPanelProps {
  sessionId: string | null
  send: ReturnType<typeof useSocket>["send"]
  on: ReturnType<typeof useSocket>["on"]
}

export function ChatPanel({ sessionId, send, on }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!sessionId) return

    setMessages([])
    const unsub = on("message-added", () => {})
    const unsubErr = on("error", (msg) => {
      if (msg.type === "error") {
        setMessages((prev) => [...prev, { role: "system", content: msg.payload.message }])
      }
    })

    return () => {
      unsub()
      unsubErr()
    }
  }, [sessionId, on])

  const sendMessage = () => {
    if (!input.trim() || !sessionId) return

    setMessages((prev) => [...prev, { role: "user", content: input }])
    send({ type: "add-message", payload: { sessionId, message: input } })
    setInput("")
  }

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a session to start chatting
      </div>
    )
  }

  return (
    <Card className="flex flex-col h-full border-0 rounded-none">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-sm font-medium">
          Session: {sessionId.slice(0, 8)}...
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
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
                      : msg.role === "system"
                      ? "bg-muted text-muted-foreground"
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
      </CardContent>

      <div className="p-4 border-t">
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
    </Card>
  )
}
