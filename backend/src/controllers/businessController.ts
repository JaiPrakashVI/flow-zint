import { Request, Response } from "express"
import { prisma } from "../lib/prisma"

export async function getBusinessProfile(req: Request, res: Response) {
  try {
    let business = await prisma.business.findFirst()
    if (!business) {
      business = await prisma.business.create({
        data: {
          name: "Veda Wellness & Performance",
          category: "Clinic & Fitness Centre",
          whatsappNumber: "+91 99160 55442"
        }
      })
    }
    return res.status(200).json(business)
  } catch (error: any) {
    console.error("[Business Controller] Failed to fetch profile:", error)
    return res.status(500).json({ error: error.message || "Failed to fetch profile" })
  }
}

export async function updateBusinessProfile(req: Request, res: Response) {
  const { name, category, whatsappNumber, timezone } = req.body

  try {
    const business = await prisma.business.findFirst()
    if (!business) {
      return res.status(404).json({ error: "Business profile not found" })
    }

    const updated = await prisma.business.update({
      where: { id: business.id },
      data: {
        name,
        category,
        whatsappNumber,
        timezone
      }
    })

    console.log("[Business Controller] Updated profile details:", updated)
    return res.status(200).json(updated)

  } catch (error: any) {
    console.error("[Business Controller] Failed to update profile:", error)
    return res.status(500).json({ error: error.message || "Failed to update profile" })
  }
}
