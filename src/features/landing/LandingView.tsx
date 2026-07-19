import { Logo } from "../../components/Logo"
import { MessageSquare, ShieldCheck, Sparkles, Calendar, ArrowRight, Zap, CheckCircle2 } from "lucide-react"
import { ThemeToggle } from "../../components/ThemeToggle"

interface LandingViewProps {
  onNavigate: (path: string) => void
}

export function LandingView({ onNavigate }: LandingViewProps) {
  const steps = [
    {
      icon: MessageSquare,
      title: "1. WhatsApp Inbound",
      desc: "Client initiates query or booking request on WhatsApp.",
      color: "text-info",
      bg: "bg-info/10"
    },
    {
      icon: ShieldCheck,
      title: "2. Vector Grounding",
      desc: "FlowPilot searches indexed KnowledgeDocuments to retrieve correct context.",
      color: "text-success",
      bg: "bg-success/10"
    },
    {
      icon: Zap,
      title: "3. AI Reply Delivered",
      desc: "Formulates a grounded response and automatically dispatches back on WhatsApp.",
      color: "text-warning",
      bg: "bg-warning/10"
    },
    {
      icon: Sparkles,
      title: "4. Lead Intelligence",
      desc: "Extracts structured qualification data, intent, and booking probability.",
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      icon: Calendar,
      title: "5. Conflict-Free Booking",
      desc: "Schedules slots directly, resolving overlaps dynamically.",
      color: "text-primary",
      bg: "bg-primary/10"
    }
  ]

  const highlights = [
    {
      title: "100% Grounded Context",
      desc: "Say goodbye to hallucinated figures. Custom cosine-similarity thresholds prevent answers outside your official knowledge documents, defaulting safely to staff handover."
    },
    {
      title: "Background Lead Scoring",
      desc: "No latency bottlenecks. Lead analysis and urgency classifications run entirely out of the customer's critical reply path, keeping messaging instant."
    },
    {
      title: "Live Evaluation auditing",
      desc: "We measure our own reliability. Rollup dashboards audit average latency, response confidence, grounded rates, and escalations in real-time."
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* 1. Header Navigation */}
      <header className="border-b border-border bg-card/25 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size={28} />
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => onNavigate("/demo")}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Demo Preview
            </button>
            <button
              onClick={() => onNavigate("/login")}
              className="px-4 py-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded border border-primary/20 transition-all duration-200 active:scale-[0.98] shadow-md focus:outline-none"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24 border-b border-border">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        {/* Subtle ambient orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            <span>FlowPilot Platform v1.0</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-3xl mx-auto">
            The Autonomous AI Employee for Local Businesses
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Connect FlowPilot directly to your WhatsApp business gateway. Ground customer inquiries in your vector knowledge base, qualify leads, schedule bookings, and audit response health in real-time.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("/demo")}
              className="w-full sm:w-auto px-7 py-3 text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground rounded shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>View Live Demo</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={() => onNavigate("/login")}
              className="w-full sm:w-auto px-7 py-3 text-xs font-bold bg-card hover:bg-card-hover text-foreground rounded border border-border hover:border-muted-foreground/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center cursor-pointer"
            >
              Portal Login
            </button>
          </div>
        </div>
      </section>

      {/* 3. Product Flow ("How it Works") */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Complete Autonomous Flow</h2>
          <p className="text-xs text-muted-foreground font-medium max-w-lg mx-auto">
            See how FlowPilot processes inbound customer messages and updates your dashboard seamlessly
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="bg-card border border-border/80 rounded-xl p-5 hover:border-primary/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`h-8 w-8 rounded-lg ${step.bg} ${step.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-foreground mb-1.5">{step.title}</h3>
                  <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* 4. Feature Highlights */}
      <section className="py-16 bg-card/20 border-t border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((hl) => (
            <div key={hl.title} className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4.5 w-4.5" />
                <h3 className="text-xs font-bold uppercase tracking-wider">{hl.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-medium">{hl.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Footer Closing Pitch */}
      <footer className="mt-auto border-t border-border bg-card/10 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <Logo size={24} />
          
          <p className="text-[10px] text-muted-foreground italic max-w-sm sm:text-right">
            "This isn't a chatbot demo — it's the beginning of an AI employee a business could deploy tomorrow."
          </p>
        </div>
      </footer>
    </div>
  )
}
