import dotenv from "dotenv"
import app from "./app"
import { prisma } from "./lib/prisma"
import * as crypto from "crypto"

dotenv.config()

process.env.WHATSAPP_VERIFY_TOKEN = "test_verify_token"
process.env.WHATSAPP_APP_SECRET = "test_app_secret"

const PORT = 5001

const server = app.listen(PORT, async () => {
  console.log(`[Test Server] Started on port ${PORT}`)

  try {
    // 1. Test GET Verification (Correct Token)
    console.log("\n[Test 1] Verifying GET challenge verification with correct token...")
    const getUrl = `http://localhost:${PORT}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=test_verify_token&hub.challenge=12345`
    const getRes = await fetch(getUrl)
    const getText = await getRes.text()
    console.log(`Response Code: ${getRes.status}`)
    console.log(`Response Challenge: ${getText}`)
    if (getRes.status === 200 && getText === "12345") {
      console.log("✅ Test 1 Passed!")
    } else {
      console.error("❌ Test 1 Failed!")
    }

    // 2. Test GET Verification (Incorrect Token)
    console.log("\n[Test 2] Verifying GET challenge with incorrect token...")
    const badGetUrl = `http://localhost:${PORT}/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=12345`
    const badGetRes = await fetch(badGetUrl)
    console.log(`Response Code: ${badGetRes.status}`)
    if (badGetRes.status === 403) {
      console.log("✅ Test 2 Passed!")
    } else {
      console.error("❌ Test 2 Failed!")
    }

    // 3. Test POST Inbound Message (No Signature)
    console.log("\n[Test 3] Sending inbound message without signature...")
    const postUrl = `http://localhost:${PORT}/api/webhooks/whatsapp`
    const body = {
      entry: [{
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "+91 99160 55442" },
            contacts: [{ profile: { name: "Rohan Sharma" }, wa_id: "919845012345" }],
            messages: [{
              from: "919845012345",
              id: "wamid.test_msg_1",
              timestamp: "1659918234",
              text: { body: "Hi, what are your gym membership prices?" },
              type: "text"
            }]
          }
        }]
      }]
    }
    const rawBodyStr = JSON.stringify(body)

    const noSigRes = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBodyStr
    })
    console.log(`Response Code: ${noSigRes.status}`)
    if (noSigRes.status === 401) {
      console.log("✅ Test 3 Passed!")
    } else {
      console.error("❌ Test 3 Failed!")
    }

    // 4. Test POST Inbound Message (Invalid Signature)
    console.log("\n[Test 4] Sending inbound message with invalid signature...")
    const badSigRes = await fetch(postUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": "sha256=invalid_hash_value"
      },
      method: "POST",
      body: rawBodyStr
    })
    console.log(`Response Code: ${badSigRes.status}`)
    if (badSigRes.status === 401) {
      console.log("✅ Test 4 Passed!")
    } else {
      console.error("❌ Test 4 Failed!")
    }

    // 5. Test POST Inbound Message (Valid Signature)
    console.log("\n[Test 5] Sending inbound message with valid signature...")
    const hmac = crypto.createHmac("sha256", "test_app_secret")
    hmac.update(rawBodyStr)
    const validHash = hmac.digest("hex")

    // Ensure business exists in DB
    let biz = await prisma.business.findFirst()
    if (!biz) {
      biz = await prisma.business.create({
        data: {
          name: "Veda Wellness & Performance",
          category: "Clinic & Fitness Centre",
          whatsappNumber: "+91 99160 55442"
        }
      })
    }

    const okRes = await fetch(postUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-Hub-Signature-256": `sha256=${validHash}`
      },
      method: "POST",
      body: rawBodyStr
    })
    console.log(`Response Code: ${okRes.status}`)
    const okJson = (await okRes.json()) as any
    console.log("Response JSON:", okJson)

    if (okRes.status === 200 && okJson.status === "received") {
      console.log("✅ Test 5 Passed!")
    } else {
      console.error("❌ Test 5 Failed!")
    }

    // 6. Verify database records are created
    console.log("\n[Test 6] Verifying database records...")
    const savedCustomer = await prisma.customer.findUnique({
      where: { phoneNumber: "+919845012345" }
    })
    console.log("Saved Customer:", savedCustomer)

    const savedMessage = await prisma.message.findFirst({
      where: { content: "Hi, what are your gym membership prices?" }
    })
    console.log("Saved Message:", savedMessage)

    if (savedCustomer && savedMessage) {
      console.log("✅ Test 6 Passed! Data persisted correctly in PostgreSQL database!")
    } else {
      console.error("❌ Test 6 Failed! Data was not persisted correctly.")
    }

  } catch (err) {
    console.error("Error running validation tests:", err)
  } finally {
    server.close(() => {
      console.log("\n[Test Server] Closed.")
      process.exit(0)
    })
  }
})
