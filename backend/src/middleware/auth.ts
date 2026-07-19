import { Request, Response, NextFunction } from "express"
import * as jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "flowpilot_super_secret_jwt_key_2026"

export interface UserRequest extends Request {
  userId?: string
  userEmail?: string
}

export function authenticateToken(req: UserRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    req.userId = decoded.userId
    req.userEmail = decoded.email
    next()
  } catch {
    return res.status(403).json({ error: "Invalid or expired token" })
  }
}
