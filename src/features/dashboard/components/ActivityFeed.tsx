import type { ActivityEvent } from "../types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import {
  MessageSquare,
  Compass,
  Calendar,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react"

export function ActivityFeed({ activities }: { activities: ActivityEvent[] }) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "message_sent":
        return <MessageSquare className="h-3.5 w-3.5 text-primary" />
      case "lead_scored":
        return <Compass className="h-3.5 w-3.5 text-success" />
      case "booking_created":
        return <Calendar className="h-3.5 w-3.5 text-info" />
      case "follow_up":
        return <Clock className="h-3.5 w-3.5 text-warning" />
      case "lead_converted":
        return <CheckCircle2 className="h-3.5 w-3.5 text-success" />
      case "revenue_updated":
        return <TrendingUp className="h-3.5 w-3.5 text-foreground" />
      default:
        return <Activity className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  const getStatusBorder = (status: string) => {
    switch (status) {
      case "success":
        return "border-success/30 bg-success/5"
      case "warning":
        return "border-warning/30 bg-warning/5"
      case "info":
        return "border-info/30 bg-info/5"
      default:
        return "border-border/80 bg-muted/40"
    }
  }

  return (
    <Card className="border-border bg-card/40 flex flex-col h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="db-title font-semibold uppercase tracking-wider text-muted-foreground">
            AI Agent Activity Log
          </CardTitle>
          <CardDescription className="db-text text-muted-foreground mt-0.5">
            Real-time diagnostic events and background actions
          </CardDescription>
        </div>
        <Badge variant="secondary" className="db-subtext bg-muted font-bold border-border/80">
          Live stream
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-[380px] pr-2">
        <div className="relative border-l border-border/80 pl-4 ml-2 space-y-5 py-1">
          {activities.map((event, idx) => {
            return (
              <div key={event.id} className="relative group">
                {/* Timeline node icon */}
                <div className={`absolute -left-7 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm z-10 ${getStatusBorder(event.status)} ${idx === 0 ? "ring-2 ring-primary/40 animate-pulse" : ""}`}>
                  {getEventIcon(event.type)}
                </div>

                {/* Event details */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="db-subtext font-bold text-foreground">
                      {event.title}
                    </h4>
                    <span className="db-subtext text-muted-foreground/80 font-medium">
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="db-subtext text-muted-foreground leading-relaxed font-medium">
                    {event.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
export default ActivityFeed
