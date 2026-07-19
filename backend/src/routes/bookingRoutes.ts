import { Router } from "express"
import { listBookings, getAvailability, createBooking, updateBookingStatus } from "../controllers/bookingController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

router.use(authenticateToken as any)

router.get("/", listBookings)
router.get("/availability", getAvailability)
router.post("/", createBooking)
router.patch("/:id", updateBookingStatus)

export default router
