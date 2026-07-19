# FlowPilot

**Autonomous Revenue Intelligence Platform for Small Businesses**

Built for FlowZint AI Hackathon 2026 — Open Innovation category.

FlowPilot isn't a chatbot. It's an AI employee that helps small business owners earn more revenue through intelligent WhatsApp conversations, automatic lead qualification, booking automation, follow-ups, and live business insights — without stopping after it answers a question.

---

## What It Does

A customer messages the business on WhatsApp. FlowPilot:

1. Understands the question and retrieves accurate answers from the business's own knowledge base (RAG — never hallucinates pricing or availability)
2. Scores the lead automatically (intent, urgency, sentiment, booking probability) with visible, human-readable reasoning
3. Books appointments directly via function calling when the customer is ready
4. Follows up automatically if the customer goes quiet
5. Surfaces everything live on a dashboard the business owner can actually use

Everything except the customer's reply happens asynchronously in the background — lead scoring, dashboard updates, and recommendations never slow down the chat response.

---

## Tech Stack

**Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion
**Backend:** Node.js, Express, Prisma, PostgreSQL
**AI:** OpenAI/Claude for chat + structured extraction, `text-embedding-3-small` for embeddings, Chroma for vector search
**Messaging:** WhatsApp Cloud API
**Auth:** JWT
**Deployment:** Docker, Render/Railway/VPS

---

## Core Features

- **WhatsApp AI Assistant** — RAG-grounded replies, no hallucinated pricing or availability
- **Lead Intelligence** — structured scoring (intent, budget, urgency, sentiment, booking probability) with visible reasoning per lead, not just a bare number
- **Booking Automation** — LLM function-calling triggers real availability checks and confirmed bookings
- **Follow-up Engine** — automatic, personalized re-engagement for inactive customers
- **Live Dashboard** — revenue opportunity, hot leads, conversion rate, AI confidence, lead funnel, AI activity feed
- **Evaluation Engine** — tracks its own latency, confidence, grounded-response rate, and hallucination rate
- **No-login Demo Mode** — full product experience with realistic seeded data, no signup required
- **Light + dark theme**, collapsible sidebar navigation

---

## Project Structure

```
/docs                   → Project Bible (read these before making changes)
  vision.md              → product vision, philosophy, non-goals
  architecture.md         → system flow, stack, latency principles, build order
  database.md             → full data model reference
  api.md                  → endpoint specification
  ui.md                   → design system + page-by-page UI spec
  demo-script.md          → the live demo flow and fallback plan

/src (frontend)
  features/               → feature-based structure (dashboard, leads, conversations, bookings, analytics, settings, auth)
  components/ui/          → shared primitives (Card, Badge, StatusPill, TrendIndicator, Logo)
  lib/                    → API client, mock data, utilities

/server (backend)
  features/               → auth, business, customers, conversations, bookings, dashboard, webhooks
  prisma/                 → schema.prisma, migrations, seed.ts
```

---

## Database

13 core tables: Business, Users, Customers, Conversations, Messages, KnowledgeDocuments, Embeddings, Bookings, LeadScores, Recommendations, FollowUps, EvaluationMetrics, Settings. Full schema and relations documented in `/docs/database.md`.

---

## Build Order

This project was built in strict phase order — deterministic plumbing first, AI last:

1. Design system + Dashboard UI (mock data)
2. Remaining pages: Login, Leads, Conversations, Bookings, Analytics, Settings (mock data)
3. Database schema (Prisma)
4. Backend APIs (Auth → Business → Customers → Conversations → Bookings → Dashboard)
5. WhatsApp webhook (message persistence only, no AI)
6. RAG pipeline (embeddings, vector search, grounded LLM replies)
7. Lead intelligence (structured scoring + reasoning)
8. Booking via function calling
9. Wire frontend to real APIs
10. Evaluation engine + demo polish

Full detail on each phase is in `/docs/architecture.md`.

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- A WhatsApp Business Cloud API test number (Meta developer account)
- OpenAI or Claude API key

### Install

```bash
# Backend
cd server
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, WHATSAPP_*, LLM API key
npx prisma migrate dev
npx prisma db seed
npm run dev

# Frontend
cd ../client
npm install
cp .env.example .env   # fill in API base URL
npm run dev
```

### Environment Variables

**Backend:** `DATABASE_URL`, `JWT_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `OPENAI_API_KEY` (or equivalent LLM key), `CHROMA_URL`

**Frontend:** `VITE_API_BASE_URL`

---

## Demo

- **Live demo (no login required):** `/demo` — click "View Live Demo" from the landing page
- **Full account login:** `/login`

The demo flow: a WhatsApp message comes in, AI replies grounded in the business's real knowledge base, the dashboard updates live, a lead score appears with visible reasoning, a booking gets created via function calling, and revenue/KPIs update — all in one continuous, unscripted sequence. Full walkthrough and fallback plan in `/docs/demo-script.md`.

---

## Non-Goals (by design, not oversight)

No generic chatbot UX, no CRM/Email/Instagram integrations, no multi-agent visualizer, no fake or hardcoded AI responses. See `/docs/vision.md` for the full list and reasoning.

---

## Hackathon

Built solo for FlowZint AI Hackathon 2026 (Open Innovation category). Submission via [flowzint.in/2026/ai/hackothon](https://flowzint.in/2026/ai/hackothon).
