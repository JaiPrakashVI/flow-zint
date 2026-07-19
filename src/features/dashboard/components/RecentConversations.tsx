import type { Conversation } from "../types"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { MessageSquare } from "lucide-react"

export function RecentConversations({ conversations, onViewAll }: { conversations: Conversation[]; onViewAll?: () => void }) {
  const getIntentVariant = (intent: string) => {
    switch (intent) {
      case "high-intent":
        return "success"
      case "follow-up":
        return "warning"
      case "support":
        return "info"
      default:
        return "muted"
    }
  }

  const getIntentLabel = (intent: string) => {
    switch (intent) {
      case "high-intent":
        return "Hot Lead"
      case "follow-up":
        return "Follow Up"
      case "support":
        return "Support"
      default:
        return "General"
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <Card className="border-border bg-card/40 flex flex-col h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="db-title font-semibold uppercase tracking-wider text-muted-foreground">
            Recent Conversations
          </CardTitle>
          <CardDescription className="db-text text-muted-foreground mt-0.5">
            Active customer interactions and automated scoring
          </CardDescription>
        </div>
        <Badge variant="outline" className="db-subtext font-semibold border-border gap-1 bg-card/50">
          <MessageSquare className="h-3 w-3 text-primary" />
          <span>6 Active</span>
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto max-h-[380px] pr-2 space-y-3">
        {conversations.slice(0, 4).map((conv) => {
          return (
            <div
              key={conv.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/60 bg-card/30 hover:bg-card/80 hover:border-border transition-all duration-200 cursor-pointer group"
            >
              {/* Avatar circle */}
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-muted/65 border border-border/80 flex items-center justify-center text-xs font-bold text-foreground">
                {conv.avatar}
              </div>

              {/* Chat details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="db-text font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {conv.customerName}
                  </span>
                  <span className="db-subtext text-muted-foreground font-medium shrink-0">
                    {conv.timestamp}
                  </span>
                </div>

                <p className="db-subtext text-muted-foreground line-clamp-1 mt-0.5 leading-relaxed font-medium">
                  {conv.lastMessage}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={getIntentVariant(conv.intent)} className="db-label font-bold px-1.5 py-0.5">
                    {getIntentLabel(conv.intent)}
                  </Badge>

                  {conv.unread && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-info" title="Unread" />
                  )}
                  {conv.pendingAI && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" title="AI processing" />
                  )}
                  
                  <span className="db-subtext text-muted-foreground/80 font-mono ml-auto font-semibold">
                    Est: {formatCurrency(conv.value)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
      {onViewAll && conversations.length > 4 && (
        <div className="px-6 pb-4 pt-1 flex justify-end">
          <button
            onClick={onViewAll}
            className="db-subtext font-bold text-primary hover:text-primary/80 transition-all cursor-pointer flex items-center gap-1"
          >
            View all conversations &rarr;
          </button>
        </div>
      )}
    </Card>
  )
}
export default RecentConversations
