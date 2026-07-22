# FlowPilot

### Autonomous Revenue Intelligence Platform for Small Businesses

*Built for FlowZint AI Hackathon 2026 — Open Innovation*

---

Most AI hackathon submissions are a chatbot wrapped around an LLM call. FlowPilot isn't that.

It's an AI employee: a system that answers customers on WhatsApp, scores every lead with visible reasoning, books appointments through real function calling, follows up automatically when a customer goes quiet, and reports on its own reliability — all while the business owner watches it happen live on a dashboard, not a demo mockup.

**[→ Try the live demo — no login required](https://flow-zint.vercel.app/)** — click "View Live Demo" on the landing page

---

## Why This Is Different

| | Typical hackathon chatbot | FlowPilot |
|---|---|---|
| **Answering** | LLM answers from general knowledge, may guess | Strictly RAG-grounded — if it's not in the business's uploaded docs, it says so and escalates, never invents pricing or availability |
| **Lead data** | A raw score, if any | Every lead score ships with human-readable reasoning ("asked pricing twice, positive sentiment, returning customer") — the owner sees *why*, not just a number |
| **Reliability** | Unmeasured | A dedicated Evaluation Engine tracks latency, confidence, grounded-response rate, and hallucination rate on every AI turn, visible in the dashboard |
| **Architecture** | Usually synchronous, blocking | Customer only ever waits on the reply itself — scoring, dashboard updates, recommendations, and follow-ups all run async in the background |
| **Judge access** | Sign up, wait for approval, or a broken demo account | One click, fully seeded, realistic data, zero friction |
| **Booking** | Often faked or just a form | Real function-calling: the LLM calls `bookAppointment()`, the backend checks actual availability, the booking is real before the confirmation is ever sent |
| **Build process** | Single long AI-generated blob | Built in 9 disciplined phases against a written system design doc (`/docs`) — plumbing before AI, AI before polish |

---

## See It Live

**Demo (no login):** [flow-zint.vercel.app](https://flow-zint.vercel.app/) — click "View Live Demo"
**Full account:** `/login`

Watch the actual loop this product is built around:

```
WhatsApp message → grounded AI reply → dashboard updates live
   → lead scored with visible reasoning → booking created via function call
   → revenue/KPIs update → AI surfaces a recommendation
```

No step in that sequence is scripted or faked for the demo — it's the same pipeline running against real seeded data. Full walkthrough in `/docs/demo-script.md`.

---

## Core Features

- **WhatsApp AI Assistant** — RAG-grounded, never hallucinates pricing or availability, escalates honestly when it doesn't know
- **Lead Intelligence** — intent, urgency, sentiment, budget, booking probability, and *reasoning* — always visible, never a black box
- **Booking via Function Calling** — real availability checks, real double-booking protection, no LLM-fabricated confirmations
- **Follow-up Engine** — automatic, personalized re-engagement for inactive customers
- **Live Dashboard** — revenue opportunity, hot leads, conversion rate, AI confidence, lead funnel, live AI activity feed
- **Evaluation Engine** — the system reports on its own latency, confidence, groundedness, and hallucination rate
- **No-login demo mode** with fully realistic seeded data
- **Light + dark theme**, collapsible sidebar navigation, built to feel like production software, not a prototype

---

## Tech Stack

**Frontend:** React · Vite · TypeScript · Tailwind CSS · shadcn/ui · Recharts · Framer Motion
**Backend:** Node.js · Express · Prisma · PostgreSQL
**AI:** OpenAI/Claude · `text-embedding-3-small` · Chroma (vector search)
**Messaging:** WhatsApp Cloud API
**Auth:** JWT · **Deployment:** Vercel (frontend), Docker / Render / Railway (backend)

---

## System Design

FlowPilot was designed before it was built. The full system design lives in [`/docs`](./docs):

- [`vision.md`](./docs/vision.md) — product philosophy and explicit non-goals
- [`architecture.md`](./docs/architecture.md) — system flow, async latency model, phase-by-phase build order
- [`database.md`](./docs/database.md) — full 13-table data model
- [`api.md`](./docs/api.md) — endpoint specification
- [`ui.md`](./docs/ui.md) — design system and page-by-page UI spec
- [`demo-script.md`](./docs/demo-script.md) — the exact live demo flow and fallback plan

### The One Rule That Shaped Everything
> The customer should only wait for document retrieval and the LLM reply. Everything else — lead scoring, dashboard updates, recommendations, follow-ups, evaluation logging — runs in the background.

This single constraint is why the product feels instant instead of janky, and it's enforced end-to-end, not just claimed.

---

## Build Order

Built in 9 phases, deterministic plumbing before AI, AI before polish — full detail in `architecture.md`:

1. Design system + UI shell (mock data)
2. Database schema
3. Backend APIs
4. WhatsApp webhook (message persistence only — no AI yet)
5. RAG pipeline (embeddings, vector search, grounded replies)
6. Lead intelligence (structured scoring + reasoning)
7. Booking via function calling
8. Wire frontend to real APIs
9. Evaluation engine + demo polish

---

## Local Setup

### Prerequisites
Node.js 18+, PostgreSQL (e.g., Neon), a WhatsApp Business Cloud API test number, and an OpenAI API key (optional; mocked if empty).

```bash
# 1. Setup Backend
cd backend
npm install
cp .env.example .env   # Configure DATABASE_URL, JWT_SECRET, etc.
npx prisma migrate dev
npm run db:seed        # Seeds default business and admin (admin@vedawellness.com / admin123)
npm run dev

# 2. Setup Frontend (from the root directory in a new terminal)
npm install
cp .env.example .env   # Configure VITE_API_URL
npm run dev
```

**Backend env:** `DATABASE_URL`, `JWT_SECRET`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `OPENAI_API_KEY`
**Frontend env:** `VITE_API_URL`

---

## Verification & Tests

### 1. Code Quality & Linting
Verify code conformity and linter compliance using Oxlint:
```bash
npm run lint
```

### 2. Automated Smoke Tests
Validate server booting, database connection, login auth APIs, and core dashboard endpoints:
```bash
cd backend
npm run test
```

### 3. Production Build Validation
Confirm the React frontend compiles cleanly:
```bash
npm run build
```

---

## What's Deliberately Not Here

No CRM/Email/Instagram integrations, no multi-agent visualizer, no 3D graphics, no fake or hardcoded AI responses. Every one of these was a conscious scope decision, not a missed feature — see `/docs/vision.md` for the reasoning. Small, sharp, and real beats broad and fake.

---

## Author

Built solo by Jai Prakash for FlowZint AI Hackathon 2026 (Open Innovation)
[GitHub](https://github.com/JaiPrakashVI) · [LinkedIn](https://linkedin.com/in/jai-prakash-/)
