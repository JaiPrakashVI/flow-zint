import express from "express"
import cors from "cors"
import authRoutes from "./routes/authRoutes"
import webhookRoutes from "./routes/webhookRoutes"
import knowledgeRoutes from "./routes/knowledgeRoutes"
import recommendationRoutes from "./routes/recommendationRoutes"
import bookingRoutes from "./routes/bookingRoutes"
import customerRoutes from "./routes/customerRoutes"
import conversationRoutes from "./routes/conversationRoutes"
import dashboardRoutes from "./routes/dashboardRoutes"
import { AuthenticatedRequest } from "./middleware/signature"

const app = express()

app.use(cors())

app.use(
  express.json({
    verify: (req: AuthenticatedRequest, _res, buf) => {
      req.rawBody = buf
    },
  })
)

// Endpoint mappings
app.use("/api/auth", authRoutes)
app.use("/api/webhooks", webhookRoutes)
app.use("/api/business", knowledgeRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/dashboard", recommendationRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/customers", customerRoutes)
app.use("/api/conversations", conversationRoutes)

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "healthy" })
})

export default app
