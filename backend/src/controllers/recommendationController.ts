import { Request, Response } from "express"
import { prisma } from "../lib/prisma"

export async function listRecommendations(req: Request, res: Response) {
  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(200).json([])
    }

    const recommendations = await prisma.recommendation.findMany({
      where: {
        businessId: business.id,
        dismissed: false
      },
      orderBy: { createdAt: "desc" }
    })

    return res.status(200).json(recommendations)
  } catch (error: any) {
    console.error("[Recommendations Controller] Failed to list recommendations:", error)
    return res.status(500).json({ error: error.message || "Failed to list recommendations" })
  }
}

export async function scanRecommendations(req: Request, res: Response) {
  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(400).json({ error: "No active business configuration registered" })
    }

    const businessId = business.id
    const now = new Date()
    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

    const createdRecs = []

    // Rule 1: High Booking Probability (>0.70) but no bookings in database
    const customers = await prisma.customer.findMany({
      where: { businessId },
      include: {
        bookings: true,
        leadScores: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })

    for (const customer of customers) {
      const latestScore = customer.leadScores?.[0]
      const hasActiveBooking = customer.bookings.some(b => b.status === "confirmed" || b.status === "pending")

      if (latestScore && latestScore.bookingProbability > 0.70 && !hasActiveBooking) {
        const recText = `${customer.name} has a high booking probability (${Math.round(latestScore.bookingProbability * 100)}%) but no active appointment. Send a booking link.`
        
        // Check if duplicate recommendation already exists
        const exists = await prisma.recommendation.findFirst({
          where: {
            businessId,
            text: recText,
            dismissed: false
          }
        })

        if (!exists) {
          const rec = await prisma.recommendation.create({
            data: {
              businessId,
              text: recText,
              category: "follow_up"
            }
          })
          createdRecs.push(rec)
        }
      }

      // Rule 2: Inactive engaged/qualified leads for 48h
      const isInactive = customer.lastActiveAt.getTime() < fortyEightHoursAgo.getTime()
      const isWarmLead = ["engaged", "qualified"].includes(customer.status)

      if (isInactive && isWarmLead) {
        const recText = `Lead ${customer.name} has been inactive for 48h. Tap to review follow-up reminders.`

        const exists = await prisma.recommendation.findFirst({
          where: {
            businessId,
            text: recText,
            dismissed: false
          }
        })

        if (!exists) {
          const rec = await prisma.recommendation.create({
            data: {
              businessId,
              text: recText,
              category: "follow_up"
            }
          })
          createdRecs.push(rec)
        }
      }
    }

    console.log(`[Recommendations Controller] Scanned for alerts. Created: ${createdRecs.length} notifications.`)
    return res.status(200).json({ status: "success", created: createdRecs.length })

  } catch (error: any) {
    console.error("[Recommendations Controller] Failed to run recommendations scanner:", error)
    return res.status(500).json({ error: error.message || "Failed to scan recommendations" })
  }
}
