export interface KPICardData {
  id: string
  label: string
  value: string
  change: number
  trend: "up" | "down" | "neutral"
  sparkline: number[]
  subtext: string
}

export interface FunnelStageData {
  stage: "New" | "Engaged" | "Qualified" | "Booked" | "Converted"
  count: number
  value: number
  conversionRate: number
  avgTime: string
}

export interface RevenuePoint {
  date: string
  actual: number
  forecasted: number
}

export type IntentType = "high-intent" | "follow-up" | "support" | "cold"
export type ConversationStatus = "active" | "inactive" | "closed"

export interface Message {
  id: string
  sender: "customer" | "ai" | "staff"
  content: string
  timestamp: string
  type?: "text" | "voice"
}

export interface Conversation {
  id: string
  customerName: string
  phoneNumber: string
  avatar: string
  lastMessage: string
  timestamp: string
  intent: IntentType
  status: ConversationStatus
  unread?: boolean
  pendingAI?: boolean
  value: number
  messages: Message[]
}

export interface KnowledgeDocument {
  id: string
  title: string
  type: "SERVICE" | "PRICING" | "FAQ" | "POLICY" | "OFFER"
  content: string
  uploadedAt: string
}

export type ActivityEventType =
  | "message_sent"
  | "lead_scored"
  | "booking_created"
  | "follow_up"
  | "lead_converted"
  | "revenue_updated"

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  title: string
  description: string
  timestamp: string
  status: "success" | "warning" | "info" | "neutral"
}

export interface Booking {
  id: string
  customerName: string
  service: string
  timeSlot: string
  status: "confirmed" | "completed" | "pending" | "cancelled"
  value: number
}

export interface Recommendation {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  actionLabel: string
}

export interface SystemStatus {
  whatsappConnected: boolean
  ragIndexSynced: boolean
  apiLatencyMs: number
  whatsappLatencyMs: number
}

export interface EvaluationMetric {
  latencySec: number
  confidenceScore: number
  groundedRate: number
  hallucinationRate: number
}

export interface LeadItem {
  id: string
  name: string
  phoneNumber: string
  status: "New" | "Engaged" | "Qualified" | "Booked" | "Converted" | "Churned"
  leadScore: number
  bookingProbability: number
  intent: IntentType
  urgency: "Immediate" | "Within 48h" | "Medium" | "Low"
  sentiment: "Positive" | "Neutral" | "Inquisitive" | "Frustrated"
  reasoning: string
  lastContact: string
}

