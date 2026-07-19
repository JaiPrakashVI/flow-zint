import { Router } from "express"
import { listConversations, getConversationDetails, sendStaffMessage } from "../controllers/conversationController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

router.use(authenticateToken as any)

router.get("/", listConversations)
router.get("/:id", getConversationDetails)
router.post("/:id/messages", sendStaffMessage)

export default router
