import dotenv from "dotenv"
import app from "./app"
import { prisma } from "./lib/prisma"
import * as crypto from "crypto"
import { searchKnowledgeBase } from "./services/rag"
import { checkSlotAvailability } from "./services/booking"

dotenv.config()

process.env.WHATSAPP_VERIFY_TOKEN = "test_verify_token"
process.env.WHATSAPP_APP_SECRET = "test_app_secret"

const PORT = 5002

const server = app.listen(PORT, async () => {
  console.log(`[Test Server] Started on port ${PORT}`)

  try {
    // Ensure we start with a clean database for the flowpilot schema
    console.log("\n[Setup] Cleaning database tables...")
    await prisma.recommendation.deleteMany()
    await prisma.booking.deleteMany()
    await prisma.leadScore.deleteMany()
    await prisma.evaluationMetric.deleteMany()
    await prisma.message.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.embedding.deleteMany()
    await prisma.knowledgeDocument.deleteMany()
    await prisma.user.deleteMany()
    await prisma.business.deleteMany()

    // 1. Create Business
    console.log("\n[Test 1] Creating Business tenant...")
    const biz = await prisma.business.create({
      data: {
        name: "Veda Wellness & Performance",
        category: "Clinic & Fitness Centre",
        whatsappNumber: "+91 99160 55442"
      }
    })
    console.log("Created Business:", biz)
    console.log("✅ Test 1 Passed!")

    // 2. Upload and Index KnowledgeDocument (Phase 5)
    console.log("\n[Test 2] Uploading and indexing KnowledgeDocument (RAG)...")
    const uploadRes = await fetch(`http://localhost:${PORT}/api/business/knowledge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Premium Gym Memberships",
        type: "PRICING",
        content: `Veda Wellness offers premium gym memberships:
- Monthly: ₹2,500
- Quarterly: ₹6,500
- Semi-Annual: ₹12,000
- Annual Performance Package: ₹18,000

All packages include access to the medical gym, lockers, and 2 general physical fitness assessments.`
      })
    })

    console.log(`Upload Status: ${uploadRes.status}`)
    const uploadJson = (await uploadRes.json()) as any
    console.log("Uploaded Document:", uploadJson)

    // Check database chunks
    const chunks = await prisma.embedding.findMany({
      where: { knowledgeDocumentId: uploadJson.id }
    })
    console.log("Generated Chunks in DB count:", chunks.length)

    if (uploadRes.status === 201 && chunks.length > 0) {
      console.log("✅ Test 2 Passed! Document indexed and chunked in PostgreSQL!")
    } else {
      console.error("❌ Test 2 Failed!")
    }

    // 3. Search Vector Store (Phase 5)
    console.log("\n[Test 3] Performing semantic vector search on KnowledgeBase...")
    const query = "what are the monthly gym prices?"
    const searchResults = await searchKnowledgeBase(biz.id, query, 3)
    console.log("Search Results:", searchResults)
    if (searchResults.length > 0 && searchResults[0].score > 0.40) {
      console.log("✅ Test 3 Passed! Vector search returned matching grounded chunks!")
    } else {
      console.error("❌ Test 3 Failed!")
    }

    // 4. Inbound WhatsApp Message -> RAG Reply Flow (Phase 5 & 7)
    console.log("\n[Test 4] Sending inbound message to trigger AI Reply pipeline...")
    const body = {
      entry: [{
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "+91 99160 55442" },
            contacts: [{ profile: { name: "Rohan Sharma" }, wa_id: "919845012345" }],
            messages: [{
              from: "919845012345",
              id: "wamid.test_msg_rag_1",
              timestamp: "1659918234",
              text: { body: "what are your monthly gym prices?" },
              type: "text"
            }]
          }
        }]
      }]
    }
    const rawBodyStr = JSON.stringify(body)
    const hmac = crypto.createHmac("sha256", "test_app_secret")
    hmac.update(rawBodyStr)
    const validHash = hmac.digest("hex")

    const postRes = await fetch(`http://localhost:${PORT}/api/webhooks/whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": `sha256=${validHash}`
      },
      body: rawBodyStr
    })
    console.log(`Webhook Post Response: ${postRes.status}`)

    console.log("Polling for async RAG pipeline completion...")
    let customer = null
    let messages: any[] = []
    let metrics: any[] = []

    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      customer = await prisma.customer.findUnique({
        where: { phoneNumber: "+919845012345" }
      })
      messages = await prisma.message.findMany({
        orderBy: { timestamp: "asc" }
      })
      metrics = await prisma.evaluationMetric.findMany()
      if (messages.length >= 2 && metrics.length > 0) {
        break
      }
    }

    console.log("Saved Messages:", messages)
    console.log("Grounded Metrics logged:", metrics)

    if (messages.length >= 2 && metrics.length > 0) {
      console.log("✅ Test 4 Passed! RAG pipeline responded, logged metrics, and updated DB!")
    } else {
      console.error("❌ Test 4 Failed!")
    }

    // 5. Verify Lead Score & Debounce (Phase 6)
    console.log("\n[Test 5] Verifying LeadScore extraction & debounce check...")
    let leadScores: any[] = []

    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      leadScores = await prisma.leadScore.findMany({
        orderBy: { createdAt: "desc" }
      })
      if (leadScores.length > 0) {
        break
      }
    }

    console.log("Lead Scores in DB:", leadScores)

    if (leadScores.length > 0 && customer) {
      console.log(`Saved Lead Score: ${leadScores[0].leadScore}/100, Reason: ${leadScores[0].reasoning}`)
      console.log(`Customer Status updated to: ${customer.status}`)
      console.log("✅ Test 5 Passed!")
    } else {
      console.error("❌ Test 5 Failed!")
    }

    // 6. Test Function Calling Booking Tool (Phase 7)
    console.log("\n[Test 6] Sending message expressing booking intent to trigger bookAppointment()...")
    const bookBody = {
      entry: [{
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "+91 99160 55442" },
            contacts: [{ profile: { name: "Rohan Sharma" }, wa_id: "919845012345" }],
            messages: [{
              from: "919845012345",
              id: "wamid.test_msg_book_1",
              timestamp: "1659918239",
              text: { body: "I want to book a Sports Physiotherapy slot tomorrow at 6pm" },
              type: "text"
            }]
          }
        }]
      }]
    }
    const bookRawBodyStr = JSON.stringify(bookBody)
    const bookHmac = crypto.createHmac("sha256", "test_app_secret")
    bookHmac.update(bookRawBodyStr)
    const bookHash = bookHmac.digest("hex")

    const bookPostRes = await fetch(`http://localhost:${PORT}/api/webhooks/whatsapp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": `sha256=${bookHash}`
      },
      body: bookRawBodyStr
    })
    console.log(`Webhook Book Response: ${bookPostRes.status}`)

    console.log("Polling for background function calling booking completion...")
    let activeBookings: any[] = []
    let updatedCustomer = null

    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      activeBookings = await prisma.booking.findMany()
      updatedCustomer = await prisma.customer.findUnique({
        where: { phoneNumber: "+919845012345" }
      })
      if (activeBookings.length > 0 && updatedCustomer?.status === "booked") {
        break
      }
    }

    console.log("Active Bookings created:", activeBookings)
    console.log("Customer status updated:", updatedCustomer?.status)

    if (activeBookings.length > 0 && updatedCustomer?.status === "booked") {
      console.log("✅ Test 6 Passed! Booking created successfully and customer marked as 'booked'!")
    } else {
      console.error("❌ Test 6 Failed!")
    }

    // 7. Test Double-Booking Protection (Phase 7)
    console.log("\n[Test 7] Testing double-booking slot availability protection...")
    const slotTimeStr = activeBookings[0].dateTime.toISOString()
    const isAvailable = await checkSlotAvailability(biz.id, slotTimeStr)
    console.log(`Is booked slot available? ${isAvailable}`)
    if (!isAvailable) {
      console.log("✅ Test 7 Passed! Conflict check correctly blocks double-booking!")
    } else {
      console.error("❌ Test 7 Failed!")
    }

    // 8. Test Recommendation scanner periodic run (Phase 6)
    console.log("\n[Test 8] Triggering background recommendation periodic scanner...")

    // Create an inactive warm customer to trigger Rule 2
    await prisma.customer.create({
      data: {
        businessId: biz.id,
        name: "Amit Patel",
        phoneNumber: "+919845099999",
        status: "engaged",
        lastActiveAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    })

    const scanRes = await fetch(`http://localhost:${PORT}/api/dashboard/recommendations/scan`, {
      method: "POST"
    })
    const scanJson = (await scanRes.json()) as any
    console.log("Scan Result:", scanJson)

    const recs = await prisma.recommendation.findMany()
    console.log("Surfaced Recommendations:", recs)

    if (scanRes.status === 200 && recs.length > 0) {
      console.log("✅ Test 8 Passed! Surfaced recommendations for high-intent unbooked leads successfully!")
    } else {
      console.error("❌ Test 8 Failed!")
    }

  } catch (err) {
    console.error("Error executing integration tests:", err)
  } finally {
    server.close(() => {
      console.log("\n[Test Server] Closed.")
      process.exit(0)
    })
  }
})
