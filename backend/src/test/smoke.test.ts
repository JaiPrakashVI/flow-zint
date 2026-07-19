import test from "node:test"
import assert from "node:assert"
import http from "http"
import app from "../app"
import { prisma } from "../lib/prisma"

test("FlowPilot Backend Smoke Tests", async (t) => {
  let server: http.Server
  let port: number
  let token: string

  t.before(() => {
    return new Promise<void>((resolve) => {
      server = http.createServer(app)
      server.listen(0, () => {
        const address = server.address() as any
        port = address.port
        console.log(`[Test Server] Listening on port ${port}`)
        resolve()
      })
    })
  })

  t.after(() => {
    return new Promise<void>((resolve) => {
      server.close(() => {
        console.log("[Test Server] Closed.")
        resolve()
      })
    })
  })

  await t.test("1. Database Connection & Basic Prisma Query", async () => {
    // Attempt to query the database.
    const business = await prisma.business.findFirst()
    assert.ok(business, "Database connection failed or business table is empty")
    assert.strictEqual(typeof business.id, "string", "Business ID should be a string")
  })

  await t.test("2. Boot check & health route", async () => {
    const res = await fetch(`http://localhost:${port}/health`)
    assert.strictEqual(res.status, 200)
    const json = await res.json() as any
    assert.strictEqual(json.status, "healthy")
  })

  await t.test("3. Auth Route (/api/auth/login)", async () => {
    const res = await fetch(`http://localhost:${port}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@vedawellness.com",
        password: "admin123"
      })
    })
    
    assert.strictEqual(res.status, 200, `Login failed with status ${res.status}`)
    const json = await res.json() as any
    assert.ok(json.token, "Login should return a JWT token")
    token = json.token
  })

  await t.test("4. Core Dashboard Route (/api/dashboard/kpis) - Authorized", async () => {
    assert.ok(token, "Skipping dashboard check because token is not available")
    const res = await fetch(`http://localhost:${port}/api/dashboard/kpis`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    assert.strictEqual(res.status, 200, `KPIs request failed with status ${res.status}`)
    const json = await res.json() as any
    assert.ok(json, "KPI response should be populated")
  })

  await t.test("5. Core Customers Route (/api/customers) - Authorized", async () => {
    assert.ok(token, "Skipping customers check because token is not available")
    const res = await fetch(`http://localhost:${port}/api/customers`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    assert.strictEqual(res.status, 200, `Customers request failed with status ${res.status}`)
    const json = await res.json() as any
    assert.ok(Array.isArray(json), "Customers response should be an array")
  })
})
