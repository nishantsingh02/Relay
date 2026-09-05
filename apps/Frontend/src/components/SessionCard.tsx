import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, CheckCircle, AlertCircle, Loader } from "lucide-react"

interface SessionCardProps {
  id: string
  status: "running" | "done" | "error"
  lastMessage?: string
  isSelected: boolean
  onClick: () => void
}

const statusConfig = {
  running: { icon: Loader, color: "text-blue-500", badge: "default" as const, label: "Running" },
  done: { icon: CheckCircle, color: "text-green-500", badge: "success" as const, label: "Done" },
  error: { icon: AlertCircle, color: "text-red-500", badge: "destructive" as const, label: "Error" },
}

export function SessionCard({ id, status, lastMessage, isSelected, onClick }: SessionCardProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "border-primary shadow-md" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${config.color}`}>
            <Icon className={`h-5 w-5 ${status === "running" ? "animate-spin" : ""}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span className="font-medium text-sm">Agent</span>
              </div>
              <Badge variant={config.badge} className="text-xs">
                {config.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
              {id.slice(0, 8)}...
            </p>
            {lastMessage && (
              <p className="text-sm mt-2 truncate text-muted-foreground">
                {lastMessage}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
