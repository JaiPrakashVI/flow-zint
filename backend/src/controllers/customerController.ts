import { Request, Response } from "express"
import { prisma } from "../lib/prisma"

export async function listCustomers(req: Request, res: Response) {
  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(200).json([])
    }

    const customers = await prisma.customer.findMany({
      where: { businessId: business.id },
      include: {
        leadScores: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      },
      orderBy: { lastActiveAt: "desc" }
    })

    const data = customers.map(c => {
      const latestScore = c.leadScores?.[0]
      return {
        id: c.id,
        name: c.name,
        phoneNumber: c.phoneNumber,
        status: c.status,
        firstContact: c.firstContactAt.toISOString(),
        lastActive: c.lastActiveAt.toISOString(),
        leadScore: latestScore ? latestScore.leadScore : 0,
        bookingProbability: latestScore ? latestScore.bookingProbability : 0,
        intent: latestScore ? latestScore.intent : "unknown",
        reasoning: latestScore ? latestScore.reasoning : "No scoring indicators logged yet."
      }
    })

    return res.status(200).json(data)

  } catch (error: any) {
    console.error("[Customer Controller] Failed to list customers:", error)
    return res.status(500).json({ error: error.message || "Failed to list customers" })
  }
}

export async function findOrCreateCustomer(req: Request, res: Response) {
  const { name } = req.body
  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(400).json({ error: "No active business configuration registered" })
    }

    let customer = await prisma.customer.findFirst({
      where: { name, businessId: business.id }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          businessId: business.id,
          name,
          phoneNumber: `+9198450${Math.floor(Math.random() * 900000 + 100000)}`,
          status: "new"
        }
      })
    }

    return res.status(200).json(customer)
  } catch (error: any) {
    console.error("[Customer Controller] findOrCreate failed:", error)
    return res.status(500).json({ error: error.message })
  }
}
