import { Request, Response, NextFunction } from "express"
import * as crypto from "crypto"

export interface AuthenticatedRequest extends Request {
  rawBody?: Buffer
}

export function verifyWhatsAppSignature(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const signature = req.headers["x-hub-signature-256"] as string
  const appSecret = process.env.WHATSAPP_APP_SECRET

  if (!appSecret) {
    console.error("[Signature Middleware] WHATSAPP_APP_SECRET is not configured.")
    return res.status(500).json({ error: "Server signature configuration missing" })
  }

  if (!signature) {
    console.warn("[Signature Middleware] Rejecting unsigned payload.")
    return res.status(401).json({ error: "Missing signature header" })
  }

  const parts = signature.split("=")
  if (parts.length !== 2 || parts[0] !== "sha256") {
    console.warn("[Signature Middleware] Malformed signature format.")
    return res.status(401).json({ error: "Malformed signature header" })
  }

  const expectedHash = parts[1]
  const rawBody = req.rawBody

  if (!rawBody) {
    console.error("[Signature Middleware] Raw body buffer is missing in request context.")
    return res.status(500).json({ error: "Raw body buffer unavailable for verification" })
  }

  const hmac = crypto.createHmac("sha256", appSecret)
  hmac.update(rawBody)
  const actualHash = hmac.digest("hex")

  const expectedBuffer = Buffer.from(expectedHash, "hex")
  const actualBuffer = Buffer.from(actualHash, "hex")

  if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    console.warn("[Signature Middleware] Signature hash mismatch.")
    return res.status(401).json({ error: "Invalid signature hash" })
  }

  next()
}
