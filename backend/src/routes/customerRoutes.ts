import { Router } from "express"
import { listCustomers, findOrCreateCustomer } from "../controllers/customerController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

router.use(authenticateToken as any)

router.get("/", listCustomers)
router.post("/find-or-create", findOrCreateCustomer)

export default router
