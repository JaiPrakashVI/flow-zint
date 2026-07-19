import { prisma } from "../lib/prisma"

// Check availability: slot is open if no other booking falls within a 1-hour window
export async function checkSlotAvailability(businessId: string, dateTimeStr: string): Promise<boolean> {
  const targetTime = new Date(dateTimeStr)
  
  // Calculate a 1-hour buffer around requested slot
  const startTime = new Date(targetTime.getTime() - 59 * 60 * 1000)
  const endTime = new Date(targetTime.getTime() + 59 * 60 * 1000)

  const conflict = await prisma.booking.findFirst({
    where: {
      businessId,
      dateTime: {
        gte: startTime,
        lte: endTime
      },
      status: {
        in: ["pending", "confirmed", "completed"]
      }
    }
  })

  return !conflict
}

// Scans standard business hours on the target day to return alternative open slots
export async function getAlternativeSlots(businessId: string, baseDateTimeStr: string): Promise<string[]> {
  const baseTime = new Date(baseDateTimeStr)
  const slotsToCheck = ["09:00", "11:00", "14:00", "16:00", "18:00"]
  const availableAlternatives: string[] = []

  const datePrefix = baseTime.toISOString().split("T")[0] // e.g. 2026-07-12

  for (const slot of slotsToCheck) {
    const candidateStr = `${datePrefix}T${slot}:00`
    const isAvailable = await checkSlotAvailability(businessId, candidateStr)
    if (isAvailable && new Date(candidateStr).getTime() !== baseTime.getTime()) {
      availableAlternatives.push(candidateStr)
    }
  }

  return availableAlternatives.slice(0, 3)
}

export interface BookingResult {
  success: boolean
  booking?: any
  error?: string
  suggestedSlots?: string[]
}

// Executes booking inside a transaction, validating constraints and updating statuses
export async function executeBooking(
  businessId: string,
  customerId: string,
  service: string,
  dateTimeStr: string
): Promise<BookingResult> {
  try {
    const isAvailable = await checkSlotAvailability(businessId, dateTimeStr)

    if (!isAvailable) {
      const suggestedSlots = await getAlternativeSlots(businessId, dateTimeStr)
      return {
        success: false,
        error: "Slot is already booked. Please suggest alternatives.",
        suggestedSlots
      }
    }

    // Run transaction: Create booking and update customer status
    const result = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          customerId,
          businessId,
          service,
          dateTime: new Date(dateTimeStr),
          status: "confirmed"
        }
      })

      // Update customer status to booked
      const customer = await tx.customer.findUnique({ where: { id: customerId } })
      if (customer && ["new", "engaged", "qualified"].includes(customer.status)) {
        await tx.customer.update({
          where: { id: customerId },
          data: { status: "booked" }
        })
      }

      return newBooking
    })

    return {
      success: true,
      booking: result
    }
  } catch (error: any) {
    console.error("[Booking Service] Failed to process booking transaction:", error)
    return {
      success: false,
      error: error.message || "Failed to create booking"
    }
  }
}
