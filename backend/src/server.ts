import dotenv from "dotenv"

// Load env variables
dotenv.config()

// Gracefully validate critical env variables at boot
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET"]
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key])

if (missingEnv.length > 0) {
  console.error("==================================================")
  console.error("[CRITICAL ERROR] Missing required environment variables:")
  missingEnv.forEach((key) => console.error(`  - ${key}`))
  console.error("\nPlease check your .env file or environment settings.")
  console.error("Refer to DEPLOYMENT.md or .env.example for details.")
  console.error("==================================================")
  process.exit(1)
}

import app from "./app"

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`[Server] FlowPilot Gateway running on port ${PORT}`)
})
