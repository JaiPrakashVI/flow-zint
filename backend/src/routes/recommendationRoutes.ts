import { Router } from "express"
import { listRecommendations, scanRecommendations } from "../controllers/recommendationController"

const router = Router()

router.get("/recommendations", listRecommendations)
router.post("/recommendations/scan", scanRecommendations)

export default router
