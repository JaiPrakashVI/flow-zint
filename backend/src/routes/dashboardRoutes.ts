import { Router } from "express"
import {
  getKPIs,
  getFunnel,
  getRevenueChart,
  getActivityFeed,
  getSystemHealth,
  getEvaluationMetrics
} from "../controllers/dashboardController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

router.use(authenticateToken as any)

router.get("/kpis", getKPIs)
router.get("/funnel", getFunnel)
router.get("/revenue-chart", getRevenueChart)
router.get("/activity-feed", getActivityFeed)
router.get("/system-health", getSystemHealth)
router.get("/evaluation-metrics", getEvaluationMetrics)

export default router
