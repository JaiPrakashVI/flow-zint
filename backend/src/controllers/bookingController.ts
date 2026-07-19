import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import { checkSlotAvailability, executeBooking } from "../services/booking"

export async function listBookings(req: Request, res: Response) {
  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(200).json([])
    }

    const bookings = await prisma.booking.findMany({
      where: { businessId: business.id },
      include: { customer: true },
      orderBy: { dateTime: "asc" }
    })

    const data = bookings.map(b => ({
      id: b.id,
      customerName: b.customer.name,
      customerPhone: b.customer.phoneNumber,
      customerId: b.customerId,
      service: b.service,
      dateTime: b.dateTime.toISOString(),
      status: b.status
    }))

    return res.status(200).json(data)
  } catch (error: any) {
    console.error("[Booking Controller] Failed to list bookings:", error)
    return res.status(500).json({ error: error.message || "Failed to list bookings" })
  }
}

export async function getAvailability(req: Request, res: Response) {
  const { date } = req.query // expected format: YYYY-MM-DD
  if (!date || typeof date !== "string") {
    return res.status(400).json({ error: "Missing required date query parameter (YYYY-MM-DD)" })
  }

  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(200).json([])
    }

    const businessId = business.id
    const standardSlots = ["09:00", "11:00", "14:00", "16:00", "18:00"]
    const availableSlots = []

    for (const slot of standardSlots) {
      const dateTimeStr = `${date}T${slot}:00`
      const isAvailable = await checkSlotAvailability(businessId, dateTimeStr)
      if (isAvailable) {
        availableSlots.push(dateTimeStr)
      }
    }

    return res.status(200).json(availableSlots)

  } catch (error: any) {
    console.error("[Booking Controller] Failed to check availability:", error)
    return res.status(500).json({ error: error.message || "Failed to check availability" })
  }
}

export async function createBooking(req: Request, res: Response) {
  const { customerId, service, dateTime } = req.body

  if (!customerId || !service || !dateTime) {
    return res.status(400).json({ error: "Missing required fields (customerId, service, dateTime)" })
  }

  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(400).json({ error: "No active business configuration registered" })
    }

    const result = await executeBooking(business.id, customerId, service, dateTime)

    if (!result.success) {
      return res.status(409).json({
        error: result.error,
        suggestedSlots: result.suggestedSlots
      })
    }

    return res.status(201).json(result.booking)

  } catch (error: any) {
    console.error("[Booking Controller] Failed to create booking:", error)
    return res.status(500).json({ error: error.message || "Failed to create booking" })
  }
}

export async function updateBookingStatus(req: Request, res: Response) {
  const { id } = req.params
  const { status } = req.body // pending, confirmed, cancelled, completed

  if (!status) {
    return res.status(400).json({ error: "Missing status field" })
  }

  try {
    const booking = await prisma.booking.findUnique({ where: { id } })
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status }
    })

    console.log(`[Booking Controller] Updated booking ID: ${id} status to: ${status}`)
    return res.status(200).json(updated)

  } catch (error: any) {
    console.error("[Booking Controller] Failed to update booking status:", error)
    return res.status(500).json({ error: error.message || "Failed to update booking status" })
  }
}
