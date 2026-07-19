import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { sendWhatsAppMessage } from "../services/whatsapp"

export async function listConversations(req: Request, res: Response) {
  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(200).json([])
    }

    const conversations = await prisma.conversation.findMany({
      where: { businessId: business.id },
      include: {
        customer: true,
        messages: {
          orderBy: { timestamp: "desc" },
          take: 1
        }
      },
      orderBy: { lastMessageAt: "desc" }
    })

    const data = conversations.map(c => {
      const lastMsg = c.messages?.[0]
      return {
        id: c.id,
        customerName: c.customer.name,
        phoneNumber: c.customer.phoneNumber,
        lastMessage: lastMsg ? lastMsg.content : "Opened conversation",
        timestamp: c.lastMessageAt.toISOString(),
        intent: "active",
        status: c.status,
        unread: false,
        value: 12000
      }
    })

    return res.status(200).json(data)

  } catch (error: any) {
    console.error("[Conversation Controller] Failed to list conversations:", error)
    return res.status(500).json({ error: error.message || "Failed to list conversations" })
  }
}

export async function getConversationDetails(req: Request, res: Response) {
  const { id } = req.params

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        customer: true,
        messages: {
          orderBy: { timestamp: "asc" }
        }
      }
    })

    if (!conversation) {
      return res.status(404).json({ error: "Conversation thread not found" })
    }

    // Format structure matching the frontend thread bubbles expect
    const messages = conversation.messages.map(m => ({
      id: m.id,
      sender: m.sender, // customer, ai, staff
      content: m.content,
      timestamp: m.timestamp.toISOString()
    }))

    const detailData = {
      id: conversation.id,
      customerName: conversation.customer.name,
      phoneNumber: conversation.customer.phoneNumber,
      status: conversation.status,
      messages
    }

    return res.status(200).json(detailData)

  } catch (error: any) {
    console.error("[Conversation Controller] Failed to fetch thread details:", error)
    return res.status(500).json({ error: error.message || "Failed to fetch thread details" })
  }
}

export async function sendStaffMessage(req: Request, res: Response) {
  const { id } = req.params
  const { content } = req.body

  if (!content) {
    return res.status(400).json({ error: "Missing message content" })
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: { customer: true }
    })

    if (!conversation) {
      return res.status(404).json({ error: "Conversation thread not found" })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        sender: "staff",
        content,
        messageType: "text",
        timestamp: new Date()
      }
    })

    await sendWhatsAppMessage(conversation.customer.phoneNumber, content)

    await prisma.conversation.update({
      where: { id },
      data: { lastMessageAt: new Date() }
    })

    return res.status(201).json(message)

  } catch (error: any) {
    console.error("[Conversation Controller] Failed to send staff message:", error)
    return res.status(500).json({ error: error.message || "Failed to send staff message" })
  }
}
