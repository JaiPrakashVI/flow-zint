import { useState, useRef, useEffect, type FormEvent } from "react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { apiClient } from "../../lib/apiClient"
import {
  MessageSquare,
  Sparkles,
  Send,
  User,
  UserCheck,
  Search,
  CheckCircle,
} from "lucide-react"
import type { Conversation } from "../dashboard/types"

interface ConversationsViewProps {
  conversations: Conversation[]
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
  selectedId: string
  setSelectedId: (id: string) => void
  onViewLead?: (customerId: string) => void
  isDemoMode?: boolean
}

export function ConversationsView({
  conversations,
  setConversations,
  selectedId,
  setSelectedId,
  onViewLead,
  isDemoMode = false,
}: ConversationsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [replyText, setReplyText] = useState("")
  const [activeConvDetails, setActiveConvDetails] = useState<any>(null)

  const activeConv = activeConvDetails || conversations.find((c) => c.id === selectedId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (!selectedId || isDemoMode) return

    const fetchDetails = async () => {
      try {
        const res = await apiClient.get(`/api/conversations/${selectedId}`)
        setActiveConvDetails(res)
      } catch (err) {
        console.error("Failed to load thread details:", err)
      }
    }

    fetchDetails()
    const interval = setInterval(fetchDetails, 3000)
    return () => clearInterval(interval)
  }, [selectedId, isDemoMode])

  useEffect(() => {
    scrollToBottom()
  }, [selectedId, activeConv?.messages?.length])

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedId) return

    const messageText = replyText
    setReplyText("")

    if (isDemoMode) {
      const newMessage = {
        id: `m_manual_${Date.now()}`,
        sender: "staff" as const,
        content: messageText,
        timestamp: "Just now"
      }
      if (activeConvDetails) {
        setActiveConvDetails({
          ...activeConvDetails,
          messages: [...activeConvDetails.messages, newMessage]
        })
      } else {
        setConversations(
          conversations.map((c) => {
            if (c.id === selectedId) {
              return {
                ...c,
                lastMessage: messageText,
                timestamp: "Just now",
                status: "active" as const,
                unread: false,
                messages: c.messages ? [...c.messages, newMessage] : [newMessage]
              }
            }
            return c
          })
        )
      }
      return
    }

    try {
      const res = await apiClient.post(`/api/conversations/${selectedId}/messages`, { content: messageText })
      
      if (activeConvDetails && activeConvDetails.id === selectedId) {
        setActiveConvDetails({
          ...activeConvDetails,
          messages: [...activeConvDetails.messages, {
            id: res.id,
            sender: "staff",
            content: messageText,
            timestamp: new Date().toISOString()
          }]
        })
      }

      setConversations(
        conversations.map((c) => {
          if (c.id === selectedId) {
            return {
              ...c,
              lastMessage: messageText,
              timestamp: "Just now",
              status: "active" as const,
              unread: false,
              messages: c.messages ? [...c.messages, res] : [res]
            }
          }
          return c
        })
      )
    } catch (err) {
      console.error("[Conversations View] Failed to send staff message:", err)
      const newMessage = {
        id: `m_manual_${Date.now()}`,
        sender: "staff" as const,
        content: messageText,
        timestamp: "Just now"
      }
      if (activeConvDetails) {
        setActiveConvDetails({
          ...activeConvDetails,
          messages: [...activeConvDetails.messages, newMessage]
        })
      }
    }
  }

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

  const getMessageDay = (timestamp: string): string => {
    if (timestamp.includes("ago")) return "Today"
    if (timestamp.includes("Today")) return "Today"
    if (timestamp.includes("Yesterday")) return "Yesterday"
    if (timestamp.includes(",")) {
      return timestamp.split(",")[0].trim()
    }
    return timestamp
  }

  const filteredConvs = conversations.filter((c) =>
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Conversations Control Center</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review WhatsApp streams, monitor AI automations, and send manual overrides
        </p>
      </div>

      <div className="flex-1 flex gap-5 min-h-0">
        {/* Left Side: Threads List */}
        <div className="w-80 flex flex-col border border-border bg-card/20 rounded-lg overflow-hidden shrink-0">
          <div className="p-3 border-b border-border bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Inbox Channels
              </span>
              <Badge variant="outline" className="text-[9px] font-mono bg-card/50 px-1.5 py-0">
                {filteredConvs.length} Threads
              </Badge>
            </div>
            
            {/* Search customer box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-background border border-border/80 rounded px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary pl-8 placeholder:text-muted-foreground/50 font-medium"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredConvs.map((conv) => {
              const isActive = conv.id === selectedId
              const hasUnread = conv.unread
              const isPendingAI = conv.pendingAI

              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full flex items-start gap-2.5 p-2.5 rounded-md text-left transition-all border ${
                    isActive
                      ? "bg-primary/5 border-primary"
                      : "bg-transparent border-transparent hover:bg-card-hover/40"
                  }`}
                >
                  {/* Initials circle */}
                  <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border ${
                    isActive ? "bg-primary text-primary-foreground border-transparent" : "bg-muted text-foreground border-border"
                  }`}>
                    {conv.avatar}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`text-[11.5px] font-bold truncate ${isActive ? "text-primary" : "text-foreground"}`}>
                        {conv.customerName}
                      </span>
                      <span className="text-[9px] text-muted-foreground shrink-0 font-medium font-mono">
                        {conv.timestamp}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">
                      {conv.lastMessage}
                    </p>

                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={getIntentVariant(conv.intent)} className="text-[8px] font-bold px-1.5 py-0">
                          {getIntentLabel(conv.intent)}
                        </Badge>
                        <Badge
                          variant={
                            conv.status === "active"
                              ? "success"
                              : conv.status === "inactive"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-[8px] font-bold px-1.5 py-0 uppercase tracking-wide border-border bg-card/60"
                        >
                          {conv.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {hasUnread && (
                          <span className="h-1.5 w-1.5 rounded-full bg-info" title="Unread" />
                        )}
                        {isPendingAI && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" title="AI pending" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
            
            {filteredConvs.length === 0 && (
              <div className="p-4 text-center text-[11px] text-muted-foreground font-semibold">
                No threads found
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Message Thread View */}
        <div className="flex-1 flex flex-col border border-border bg-card/20 rounded-lg overflow-hidden min-w-0">
          {activeConv ? (
            <>
              {/* Active Header */}
              <div className="p-3 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {activeConv.avatar}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground leading-none">{activeConv.customerName}</h3>
                    <p className="text-[9.5px] text-muted-foreground font-mono mt-1">{activeConv.phoneNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={getIntentVariant(activeConv.intent)} className="text-[9px] font-bold">
                    {getIntentLabel(activeConv.intent)}
                  </Badge>
                  <Badge
                    variant={
                      activeConv.status === "active"
                        ? "success"
                        : activeConv.status === "inactive"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-[9px] font-bold uppercase"
                  >
                    {activeConv.status}
                  </Badge>

                  {onViewLead && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewLead(activeConv.id)}
                      className="text-[9px] font-bold h-6 border-primary/20 hover:bg-primary/10 text-primary gap-1 bg-primary/5 ml-1"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>View Lead Score</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card/10">
                {activeConv.messages.map((msg: any, index: number) => {
                  const isAI = msg.sender === "ai"
                  const isStaff = msg.sender === "staff"
                  
                  // Day grouping logic
                  const currentDay = getMessageDay(msg.timestamp)
                  const prevMsg = index > 0 ? activeConv.messages[index - 1] : null
                  const prevDay = prevMsg ? getMessageDay(prevMsg.timestamp) : ""
                  const showDayDivider = currentDay !== prevDay

                  // Booking detection logic
                  const isBookingConfirm = msg.content.includes("booked your") || msg.content.includes("scheduled your")

                  return (
                    <div key={msg.id} className="space-y-3">
                      {showDayDivider && (
                        <div className="flex items-center justify-center my-3.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border px-2.5 py-0.5 rounded-full font-mono">
                            {currentDay}
                          </span>
                        </div>
                      )}

                      <div className={`flex ${isAI || isStaff ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[70%] space-y-1">
                          {/* Sender tag */}
                          <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground ${
                            isAI || isStaff ? "justify-end" : "justify-start"
                          }`}>
                            {isAI && (
                              <>
                                <Sparkles className="h-2.5 w-2.5 text-primary animate-pulse" />
                                <span>AI Automation</span>
                              </>
                            )}
                            {isStaff && (
                              <>
                                <UserCheck className="h-2.5 w-2.5 text-info" />
                                <span>Staff Override</span>
                              </>
                            )}
                            {!isAI && !isStaff && (
                              <>
                                <User className="h-2.5 w-2.5 text-muted-foreground" />
                                <span>Customer</span>
                              </>
                            )}
                          </div>

                          {/* Speech Bubble */}
                          <div className={`rounded-lg px-3 py-2 text-xs font-medium leading-relaxed border ${
                            isAI
                              ? "bg-primary/5 border-primary/20 text-foreground"
                              : isStaff
                              ? "bg-muted/40 border-border text-foreground"
                              : "bg-card border-border text-foreground"
                          }`}>
                            {msg.content}
                          </div>

                          {/* Timestamp */}
                          <div className={`text-[8px] text-muted-foreground/60 font-mono ${
                            isAI || isStaff ? "text-right" : "text-left"
                          }`}>
                            {msg.timestamp}
                          </div>
                        </div>
                      </div>

                      {/* System Inline Booking Card */}
                      {isBookingConfirm && (
                        <div className="flex justify-center my-3">
                          <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-lg p-3 text-[11px] max-w-sm">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-success/20 text-success">
                              <CheckCircle className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-success">Appointment Confirmed</div>
                              <p className="text-muted-foreground mt-0.5 font-medium">
                                {msg.content.includes("7 AM") ? "Sports Physiotherapy — Tomorrow, 07:00 AM" : "Sports Physiotherapy — Tomorrow, 06:00 PM"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t border-border bg-muted/20 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a manual override message to send on WhatsApp..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                  <Button type="submit" size="icon" className="shrink-0 h-9 w-9">
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mb-3 stroke-[1.5]" />
              <h3 className="text-sm font-medium text-muted-foreground">Select a conversation</h3>
              <p className="text-xs text-muted-foreground/60 max-w-sm mt-1">
                Choose a thread from the left to view messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default ConversationsView
