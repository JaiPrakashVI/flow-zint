import { Router } from "express"
import { verifyWebhook, handleInboundMessage } from "../controllers/webhookController"
import { verifyWhatsAppSignature } from "../middleware/signature"

const router = Router()

router.get("/whatsapp", verifyWebhook)
router.post("/whatsapp", verifyWhatsAppSignature, handleInboundMessage)

export default router
