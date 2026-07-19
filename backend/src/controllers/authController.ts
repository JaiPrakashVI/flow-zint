import { Request, Response } from "express"
import { prisma } from "../lib/prisma"
import * as bcrypt from "bcrypt"
import * as jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "flowpilot_super_secret_jwt_key_2026"

export async function registerUser(req: Request, res: Response) {
  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields (name, email, password)" })
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: "User already exists with this email" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Locate default business tenant
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

    const user = await prisma.user.create({
      data: {
        businessId: business.id,
        name,
        email,
        passwordHash,
        role: "admin" as any
      }
    })

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error: any) {
    console.error("[Auth Controller] Register error:", error)
    return res.status(500).json({ error: error.message || "Registration failed" })
  }
}

export async function loginUser(req: Request, res: Response) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error: any) {
    console.error("[Auth Controller] Login error:", error)
    return res.status(500).json({ error: error.message || "Login failed" })
  }
}
