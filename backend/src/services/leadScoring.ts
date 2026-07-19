import { prisma } from "../lib/prisma"
import { analyzeLeadScore } from "./openai"

// In-memory debounce cache: conversationId -> timestamp (ms)
const lastScoredCache = new Map<string, number>()
const DEBOUNCE_MS = 30000 // 30 seconds debounce

export async function triggerLeadScoring(
  conversationId: string,
  customerId: string,
  businessId: string
): Promise<void> {
  const now = Date.now()
  const lastScoredTime = lastScoredCache.get(conversationId) || 0

  if (now - lastScoredTime < DEBOUNCE_MS) {
    console.log(`[Lead Scoring] Skipping scoring for conversation ${conversationId} - debounced.`)
    return
  }

  // Update last scored timestamp immediately to prevent concurrent duplicate jobs
  lastScoredCache.set(conversationId, now)

  // Run lead scoring asynchronously in background
  setImmediate(async () => {
    try {
      console.log(`[Lead Scoring] Starting background lead analysis for conversation: ${conversationId}`)

      // 1. Fetch conversation message history
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { timestamp: "asc" }
      })

      if (messages.length === 0) return

      // Format history as dialog text
      const conversationText = messages
        .map(m => `${m.sender.toUpperCase()}: ${m.content}`)
        .join("\n")

      // 2. Call OpenAI JSON mode analyzer
      const analysis = await analyzeLeadScore(conversationText)

      console.log("[Lead Scoring] Extracted intelligence results:", analysis)

      // 3. Save LeadScore record
      const leadScore = await prisma.leadScore.create({
        data: {
          customerId,
          conversationId,
          intent: analysis.intent,
          budget: analysis.budget,
          urgency: analysis.urgency,
          sentiment: analysis.sentiment,
          bookingProbability: parseFloat(analysis.bookingProbability || 0.0),
          leadScore: parseInt(analysis.leadScore || 0),
          reasoning: analysis.reasoning
        }
      })

      // 4. Update Customer status based on score thresholds
      const score = leadScore.leadScore
      const prob = leadScore.bookingProbability

      let newStatus: "new" | "engaged" | "qualified" | "booked" | "converted" | "churned" | null = null

      // Check thresholds
      if (score >= 80 && prob >= 0.75) {
        newStatus = "qualified"
      } else if (score >= 50) {
        newStatus = "engaged"
      }

      if (newStatus) {
        const customer = await prisma.customer.findUnique({ where: { id: customerId } })
        
        // Only elevate status (don't downgrade from booked/converted/churned manually unless requested)
        if (customer && ["new", "engaged"].includes(customer.status) && customer.status !== newStatus) {
          await prisma.customer.update({
            where: { id: customerId },
            data: { status: newStatus as any }
          })
          console.log(`[Lead Scoring] Customer ${customer.name} status elevated to: ${newStatus}`)
        }
      }

      console.log(`[Lead Scoring] Saved lead score ID: ${leadScore.id}`)

    } catch (error) {
      console.error("[Lead Scoring] Error running background scoring analysis:", error)
    }
  })
}
