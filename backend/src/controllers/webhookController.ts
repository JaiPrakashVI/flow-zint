import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { sendWhatsAppMessage } from "../services/whatsapp"
import { searchKnowledgeBase } from "../services/rag"
import { callChatCompletions, ChatMessageInput } from "../services/openai"
import { triggerLeadScoring } from "../services/leadScoring"
import { executeBooking } from "../services/booking"

const FALLBACK_MESSAGE = "I don't have that information. Let me connect you with the business owner."

// Rule-based hallucination check: flags if the reply mentions numbers not present in retrieved context
function detectHallucination(replyText: string, contextText: string): boolean {
  // Extract all numbers of length 2 or more from the reply
  const numbersInReply = replyText.match(/\b\d{2,}\b/g) || []
  for (const num of numbersInReply) {
    if (!contextText.includes(num)) {
      console.log(`[RAG Validator] Hallucination Flagged: Number "${num}" in reply is not grounded in context.`);
      return true
    }
  }
  return false
}

// Background job executor for RAG + AI Completions + Evaluation Logging + Lead Scoring
const runAIPipeline = async (
  messageId: string,
  customerId: string,
  businessId: string,
  conversationId: string,
  customerPhone: string,
  messageContent: string
) => {
  const startTime = Date.now()
  let grounded = false
  let escalated = false
  let hallucinationFlag = false
  let confidence = 0.9 // Default confidence metric
  let finalReplyText = FALLBACK_MESSAGE

  try {
    console.log(`[AI Pipeline] Starting RAG processing for message: "${messageContent}"`)

    // 1. Query the vector store for matching business context
    const matches = await searchKnowledgeBase(businessId, messageContent, 3)
    const topMatch = matches[0]

    let contextText = ""
    if (topMatch && topMatch.score >= 0.35) {
      grounded = true
      confidence = topMatch.score
      contextText = matches.map(m => m.chunkText).join("\n\n")
      console.log(`[AI Pipeline] Grounded context matched. Score: ${topMatch.score.toFixed(3)}`)
    } else {
      escalated = true
      console.log(`[AI Pipeline] Context similarity score below threshold (or no context). Triggering fallback reply.`);
    }

    // 2. Fetch the last 8 messages for context history
    const historyDb = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { timestamp: "asc" },
      take: 8
    })

    const apiMessages: ChatMessageInput[] = [
      {
        role: "system",
        content: `You are an automated support assistant for Veda Wellness & Performance.
Your goal is to answer client queries concisely and professionally.
Ground all replies strictly in the provided Context.
Rules:
1. Never invent or hallucinate information (especially prices, names, or hours).
2. If the Context does not contain the answer to the client's question, you MUST reply exactly with the following fallback text: "${FALLBACK_MESSAGE}"
3. Do not formulate confirmations for bookings unless the tool call has succeeded.

Context:
${contextText || "No context available."}`
      }
    ]

    // Append history
    for (const msg of historyDb) {
      apiMessages.push({
        role: msg.sender === "customer" ? "user" : "assistant",
        content: msg.content
      })
    }

    // 3. Request LLM Completion with booking tool enabled
    let llmResponse = await callChatCompletions(apiMessages, true)
    let choice = llmResponse.choices?.[0]
    let assistantMsg = choice?.message

    // 4. Handle Tool Calls
    if (assistantMsg?.tool_calls && assistantMsg.tool_calls.length > 0) {
      const toolCall = assistantMsg.tool_calls[0]
      if (toolCall.function.name === "bookAppointment") {
        const args = JSON.parse(toolCall.function.arguments)
        console.log(`[AI Pipeline] Tool Call Invoked: bookAppointment for ${args.service} at ${args.dateTime}`)

        // Execute deterministic booking
        const bookingResult = await executeBooking(businessId, customerId, args.service, args.dateTime)

        // Feed tool execution results back to the LLM to get a natural confirmation response
        apiMessages.push({
          role: "assistant",
          content: null,
          tool_calls: assistantMsg.tool_calls
        } as any)

        apiMessages.push({
          role: "tool",
          name: "bookAppointment",
          tool_call_id: toolCall.id,
          content: JSON.stringify(bookingResult)
        })

        // Second LLM Call to get final formatted reply text
        const secondLlmResponse = await callChatCompletions(apiMessages, false)
        finalReplyText = secondLlmResponse.choices?.[0]?.message?.content || FALLBACK_MESSAGE
        console.log(`[AI Pipeline] Final reply formatted: "${finalReplyText}"`)
      }
    } else {
      // Normal text response
      finalReplyText = assistantMsg?.content || FALLBACK_MESSAGE
    }

    // If escalated fallback is forced, override response
    if (escalated) {
      finalReplyText = FALLBACK_MESSAGE
    }

    // 5. Check for Hallucinations in the reply
    if (grounded && contextText) {
      hallucinationFlag = detectHallucination(finalReplyText, contextText)
    }

    // 6. Save AI Message in DB
    await prisma.message.create({
      data: {
        conversationId,
        sender: "ai",
        content: finalReplyText,
        messageType: "text",
        timestamp: new Date()
      }
    })

    // 7. Send reply back to client on WhatsApp
    await sendWhatsAppMessage(customerPhone, finalReplyText)

    // 8. Log Turn Evaluation Metrics
    const latencyMs = Date.now() - startTime
    await prisma.evaluationMetric.create({
      data: {
        conversationId,
        latencyMs,
        confidence,
        grounded,
        escalated,
        hallucinationFlag
      }
    })

    console.log(`[AI Pipeline] AI Reply successfully completed. Latency: ${latencyMs}ms. Metric logged.`)

    // 9. Trigger background Lead Scoring Analysis (debounced)
    await triggerLeadScoring(conversationId, customerId)

  } catch (error) {
    console.error("[AI Pipeline] Failed to execute background RAG flow:", error)
  }
}

export async function verifyWebhook(req: Request, res: Response) {
  const mode = req.query["hub.mode"]
  const token = req.query["hub.verify_token"]
  const challenge = req.query["hub.challenge"]

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

  if (!verifyToken) {
    console.error("[Webhook Verification] WHATSAPP_VERIFY_TOKEN env var is not configured.")
    return res.status(500).json({ error: "Verify token configuration missing" })
  }

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[Webhook Verification] Webhook challenge verified successfully!")
    return res.status(200).send(challenge)
  } else {
    console.warn("[Webhook Verification] Rejecting verification challenge mismatch.")
    return res.sendStatus(403)
  }
}

export async function handleInboundMessage(req: Request, res: Response) {
  res.status(200).json({ status: "received" })

  try {
    const entry = req.body?.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value
    
    if (!value || !value.messages || value.messages.length === 0) {
      return
    }

    const messageData = value.messages[0]
    const contactData = value.contacts?.[0]

    const fromPhone = messageData.from
    const contactName = contactData?.profile?.name || "WhatsApp Client"
    const rawTimestamp = messageData.timestamp ? parseInt(messageData.timestamp) : Math.floor(Date.now() / 1000)
    const displayPhoneNumber = value.metadata?.display_phone_number || ""

    const phoneNumber = fromPhone.startsWith("+") ? fromPhone : `+${fromPhone}`

    const incomingType = messageData.type
    let messageType: "text" | "voice" = "text"
    let messageContent = ""

    if (incomingType === "text") {
      messageContent = messageData.text?.body || ""
      messageType = "text"
    } else if (incomingType === "audio" || incomingType === "voice") {
      messageContent = "[Voice Note / Audio Clip]"
      messageType = "voice"
    } else {
      messageContent = `[Attachment: ${incomingType}]`
      messageType = "text"
    }

    let business = await prisma.business.findFirst({
      where: { whatsappNumber: displayPhoneNumber }
    })

    if (!business) {
      business = await prisma.business.findFirst()
    }

    if (!business) {
      console.error("[Webhook Inbound] No active business configuration registered.")
      return
    }

    const businessId = business.id

    let customer = await prisma.customer.findUnique({
      where: { phoneNumber }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          businessId,
          name: contactName,
          phoneNumber,
          status: "new"
        }
      })
      console.log(`[Webhook Inbound] Created new customer profile: ${customer.name} (${customer.phoneNumber})`)
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        customerId: customer.id,
        businessId,
        status: "active"
      },
      orderBy: { lastMessageAt: "desc" }
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerId: customer.id,
          businessId,
          status: "active"
        }
      })
      console.log(`[Webhook Inbound] Opened new conversation thread ID: ${conversation.id}`)
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: "customer",
        content: messageContent,
        messageType,
        timestamp: new Date(rawTimestamp * 1000)
      }
    })

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() }
    })

    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastActiveAt: new Date() }
    })

    console.log(`[Webhook Inbound] Saved customer message. Triggering async RAG + AI pipeline...`)

    // Enqueue RAG + Completions pipeline asynchronously
    setImmediate(() => {
      runAIPipeline(message.id, customer.id, businessId, conversation.id, phoneNumber, messageContent)
    })

  } catch (error) {
    console.error("[Webhook Inbound] Error persisting inbound message payload:", error)
  }
}
