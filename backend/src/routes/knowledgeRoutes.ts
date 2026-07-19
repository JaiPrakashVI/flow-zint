import { Router } from "express"
import {
  uploadKnowledgeDocument,
  listKnowledgeDocuments,
  deleteKnowledgeDocument
} from "../controllers/knowledgeController"
import { getBusinessProfile, updateBusinessProfile } from "../controllers/businessController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

router.use(authenticateToken as any)

router.get("/me", getBusinessProfile)
router.patch("/me", updateBusinessProfile)

router.post("/knowledge", uploadKnowledgeDocument)
router.get("/knowledge", listKnowledgeDocuments)
router.delete("/knowledge/:id", deleteKnowledgeDocument)

export default router
