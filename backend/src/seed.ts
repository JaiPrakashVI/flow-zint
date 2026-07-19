import { prisma } from "./lib/prisma"

async function runSeed() {
  console.log("[Seed] Starting FlowPilot seed script...")

  // Clear existing records first to avoid duplicates or key constraints
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
  const biz = await prisma.business.create({
    data: {
      name: "Veda Wellness & Performance",
      category: "Clinic & Fitness Centre",
      whatsappNumber: "+91 99160 55442"
    }
  })
  console.log("Created Business:", biz)

  // 2. Create User/Admin
  const admin = await prisma.user.create({
    data: {
      businessId: biz.id,
      email: "admin@vedawellness.com",
      name: "Veda Admin",
      passwordHash: "$2b$10$8Cvj8iHTcEq3IMpFWC9hOegmwgufs72lyxjlcZdh254RUdD.7g8Gu" // admin123 hash
    }
  })
  console.log("Created User Admin:", admin)

  // 3. Create KnowledgeDocuments (pricing, service, faq)
  const doc1 = await prisma.knowledgeDocument.create({
    data: {
      businessId: biz.id,
      title: "Premium Gym Memberships",
      type: "pricing",
      content: `Veda Wellness gym pricing and membership tiers:
- Monthly Membership: ₹2,500
- Quarterly Membership: ₹6,500
- Semi-Annual Membership: ₹12,000
- Annual Performance Package: ₹18,000 (best value)
All memberships grant access to the medical gym, steam rooms, lockers, and 2 diagnostic body scans.`
    }
  })

  const doc2 = await prisma.knowledgeDocument.create({
    data: {
      businessId: biz.id,
      title: "Physiotherapy & Rehab",
      type: "service",
      content: `Physiotherapy and rehabilitation programs:
- Sports Physiotherapy (Dry needling, recovery): ₹1,800 per session.
- Lower Body Spine & Joint Rehab: ₹2,000 per session.
- Senior Mobility Clinic: ₹1,500 per session.
Sessions must be booked at least 24 hours in advance.`
    }
  })

  const doc3 = await prisma.knowledgeDocument.create({
    data: {
      businessId: biz.id,
      title: "Nutrition & Diet Coaching",
      type: "service",
      content: `Clinical diet coaching & nutrition assessments:
- Initial Metabolic Scan + Diet Chart: ₹2,200.
- Monthly Ongoing Plan (with Dr. Ananya Iyer): ₹4,000.
Clinic hours: Monday to Saturday from 8:00 AM to 8:00 PM.`
    }
  })

  // Insert mock embeddings
  const mockChunks = [
    { doc: doc1, content: "Monthly Membership: ₹2,500", idx: 0 },
    { doc: doc1, content: "Quarterly Membership: ₹6,500", idx: 1 },
    { doc: doc1, content: "Semi-Annual Membership: ₹12,000", idx: 2 },
    { doc: doc1, content: "Annual Performance Package: ₹18,000", idx: 3 },
    { doc: doc2, content: "Sports Physiotherapy session: ₹1,800", idx: 0 },
    { doc: doc2, content: "Lower Body Spine Joint Rehab session: ₹2,000", idx: 1 },
    { doc: doc3, content: "Initial Metabolic Scan Diet Chart: ₹2,200", idx: 0 }
  ]

  for (const chunk of mockChunks) {
    await prisma.embedding.create({
      data: {
        knowledgeDocumentId: chunk.doc.id,
        chunkText: chunk.content,
        chunkIndex: chunk.idx,
        vectorRefId: `vec_${Math.random().toString(36).substring(7)}`
      }
    })
  }
  console.log("KnowledgeBase seeded and chunked.")

  // 5. Seed Inactive Warm Customer (Priya Nair)
  const priya = await prisma.customer.create({
    data: {
      businessId: biz.id,
      name: "Priya Nair",
      phoneNumber: "+919731299881",
      status: "engaged",
      firstContactAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastActiveAt: new Date(Date.now() - 50 * 60 * 60 * 1000) // 50 hours ago
    }
  })

  const priyaConv = await prisma.conversation.create({
    data: {
      customerId: priya.id,
      businessId: biz.id,
      status: "active",
      lastMessageAt: new Date(Date.now() - 50 * 60 * 60 * 1000)
    }
  })

  await prisma.message.createMany({
    data: [
      {
        conversationId: priyaConv.id,
        sender: "customer",
        content: "Hi, I am interested in the annual performance membership package",
        messageType: "text",
        timestamp: new Date(Date.now() - 51 * 60 * 60 * 1000)
      },
      {
        conversationId: priyaConv.id,
        sender: "ai",
        content: "Hello Priya! The Annual Performance Package is ₹18,000. Would you like to proceed?",
        messageType: "text",
        timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000)
      }
    ]
  })

  await prisma.leadScore.create({
    data: {
      customerId: priya.id,
      conversationId: priyaConv.id,
      intent: "pricing_inquiry",
      budget: "18,000 INR",
      urgency: "medium",
      sentiment: "positive",
      bookingProbability: 0.85,
      leadScore: 84,
      reasoning: "Inquired about annual packages, waiting on confirmation.",
    }
  })

  // 6. Seed a Second Customer/Business pair as fallback (Amit Patel)
  const amit = await prisma.customer.create({
    data: {
      businessId: biz.id,
      name: "Amit Patel",
      phoneNumber: "+919880144332",
      status: "qualified",
      firstContactAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastActiveAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  })

  const amitConv = await prisma.conversation.create({
    data: {
      customerId: amit.id,
      businessId: biz.id,
      status: "active",
      lastMessageAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  })

  await prisma.message.createMany({
    data: [
      {
        conversationId: amitConv.id,
        sender: "customer",
        content: "How much does a Sports Physiotherapy session cost?",
        messageType: "text",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        conversationId: amitConv.id,
        sender: "ai",
        content: "A Sports Physiotherapy session is ₹1,800. We can book this for you.",
        messageType: "text",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      }
    ]
  })

  await prisma.leadScore.create({
    data: {
      customerId: amit.id,
      conversationId: amitConv.id,
      intent: "pricing_inquiry",
      budget: "1,800 INR",
      urgency: "medium",
      sentiment: "neutral",
      bookingProbability: 0.72,
      leadScore: 78,
      reasoning: "Interested in physiotherapy session pricing details.",
    }
  })

  // 7. Seed active booking for Amit Patel
  await prisma.booking.create({
    data: {
      customerId: amit.id,
      businessId: biz.id,
      service: "Sports Physiotherapy",
      dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      status: "confirmed"
    }
  })

  // 8. Seed Historical EvaluationMetrics (Past 10 days) linked to conversations
  for (let i = 0; i < 15; i++) {
    const timestamp = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
    // We alternate linking metrics to Amit and Priya's conversations
    const targetConvId = i % 2 === 0 ? amitConv.id : priyaConv.id
    await prisma.evaluationMetric.create({
      data: {
        conversationId: targetConvId,
        latencyMs: Math.floor(Math.random() * 500) + 1100, // 1.1s - 1.6s
        confidence: 0.90 + Math.random() * 0.08,
        grounded: Math.random() > 0.1, // 90% grounded
        escalated: Math.random() > 0.9,
        hallucinationFlag: false,
        createdAt: timestamp
      }
    })
  }
  console.log("Evaluation metrics seeded.")

  // 9. Generate Recommendation Alert directly to database
  await prisma.recommendation.create({
    data: {
      businessId: biz.id,
      text: "Lead Priya Nair has been inactive for 48h. Tap to review follow-up reminders.",
      category: "follow_up"
    }
  })

  console.log("✅ Seed completed successfully!")
}

runSeed()
  .catch(err => console.error("❌ Seed failed:", err))
  .finally(() => prisma.$disconnect())
