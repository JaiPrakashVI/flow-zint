import { useState, useEffect } from "react"
import { KPICards } from "./components/KPICards"
import { LeadFunnel } from "./components/LeadFunnel"
import { RevenueChart } from "./components/RevenueChart"
import { RecentConversations } from "./components/RecentConversations"
import { ActivityFeed } from "./components/ActivityFeed"
import { BookingsList } from "./components/BookingsList"
import { Recommendations } from "./components/Recommendations"
import { SystemHealth } from "./components/SystemHealth"
import { EvaluationMetrics } from "./components/EvaluationMetrics"
import { Logo } from "../../components/Logo"
import { useQuery } from "../../lib/apiClient"
import { ThemeToggle } from "../../components/ThemeToggle"
import { useTheme } from "../../components/ThemeProvider"
import { CommandPalette } from "../../components/CommandPalette"

// Import views
import { LeadsView, type LeadItem } from "../leads/LeadsView"
import { ConversationsView } from "../conversations/ConversationsView"
import { BookingsView, type BookingItem } from "../bookings/BookingsView"
import { AnalyticsView } from "../analytics/AnalyticsView"
import { SettingsView } from "../settings/SettingsView"
import { DemoController } from "../demo/DemoController"

import {
  kpiCards,
  recentConversations,
  activityFeed,
  bookings,
  recommendations,
  initialLeads,
} from "./mockData"

import type {
  KPICardData,
  Conversation,
  ActivityEvent,
  Recommendation,
} from "./types"

import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Calendar,
  BarChart,
  Settings,
  Menu,
  X,
  Bell,
  ChevronDown,
  Building2,
  RefreshCw,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"

interface DashboardShellProps {
  onLogout?: () => void
  isDemoMode?: boolean
}

export function DashboardShell({ onLogout, isDemoMode = false }: DashboardShellProps) {
  const { toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem("flowpilot_sidebar_collapsed") === "true"
  })
  const [activeTab, setActiveTab] = useState("Dashboard")
  const [isSyncing, setIsSyncing] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem("flowpilot_sidebar_collapsed", String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Shared state default fallbacks
  const [kpis, setKpis] = useState<KPICardData[]>(kpiCards)
  const [conversations, setConversations] = useState<Conversation[]>(recentConversations)
  const [activities, setActivities] = useState<ActivityEvent[]>(activityFeed)
  const [bookingList, setBookingList] = useState<BookingItem[]>(bookings as BookingItem[])
  const [recs, setRecs] = useState<Recommendation[]>(recommendations)
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads)
  const [selectedConvId, setSelectedConvId] = useState<string>(recentConversations[0]?.id || "")
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  // Centralized polling queries (disabled in demo mode)
  const { data: dbKpis } = useQuery<KPICardData[]>("/api/dashboard/kpis", { refetchInterval: 5000, enabled: !isDemoMode })
  const { data: dbConversations } = useQuery<Conversation[]>("/api/conversations", { refetchInterval: 5000, enabled: !isDemoMode })
  const { data: dbActivities } = useQuery<ActivityEvent[]>("/api/dashboard/activity-feed", { refetchInterval: 5000, enabled: !isDemoMode })
  const { data: dbBookings } = useQuery<any[]>("/api/bookings", { refetchInterval: 5000, enabled: !isDemoMode })
  const { data: dbRecs } = useQuery<Recommendation[]>("/api/dashboard/recommendations", { refetchInterval: 5000, enabled: !isDemoMode })
  const { data: dbLeads } = useQuery<any[]>("/api/customers", { refetchInterval: 5000, enabled: !isDemoMode })
  const { data: dbMetrics } = useQuery<any[]>("/api/dashboard/evaluation-metrics", { refetchInterval: 5000, enabled: !isDemoMode })

  // Sync queries to React state dynamically
  useEffect(() => {
    if (dbKpis) setKpis(dbKpis)
  }, [dbKpis])

  useEffect(() => {
    if (dbConversations) setConversations(dbConversations)
  }, [dbConversations])

  useEffect(() => {
    if (dbActivities) setActivities(dbActivities)
  }, [dbActivities])

  useEffect(() => {
    if (dbBookings) {
      setBookingList(dbBookings.map((b: any) => ({
        id: b.id,
        customerName: b.customerName,
        service: b.service,
        timeSlot: b.dateTime.split("T")[0] + " at " + b.dateTime.split("T")[1].substring(0, 5),
        status: b.status,
        value: 2000
      })))
    }
  }, [dbBookings])

  useEffect(() => {
    if (dbRecs) {
      setRecs(dbRecs.map((r: any) => ({
        id: r.id,
        title: r.category === "follow_up" ? "Inactive Customer Alert" : "Booking Action Required",
        priority: "medium",
        description: r.text,
        actionLabel: "Review Thread"
      })))
    }
  }, [dbRecs])

  useEffect(() => {
    if (dbLeads) {
      setLeads(dbLeads.map((l: any) => ({
        ...l,
        status: (l.status.charAt(0).toUpperCase() + l.status.slice(1)) as any
      })))
    }
  }, [dbLeads])

  // Demo sequence step state tracker
  const [demoStep, setDemoStep] = useState(0)

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Conversations", icon: MessageSquare },
    { name: "Leads", icon: Users },
    { name: "Bookings", icon: Calendar },
    { name: "Analytics", icon: BarChart },
    { name: "Settings", icon: Settings },
  ]

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
    }, 1200)
  }

  // Live Demo Simulator script execution engine
  const handleExecuteDemoStep = (stepNumber: number) => {
    if (stepNumber === 1) {
      // Step 1: Simulate Inbound WhatsApp Msg
      const newMsg = {
        id: `m1_sim_1`,
        sender: "customer" as const,
        content: "Hi, what are your gym membership prices?",
        timestamp: "Just now",
      }

      setConversations(
        conversations.map((c) => {
          if (c.id === "conv_1") {
            return {
              ...c,
              lastMessage: "Hi, what are your gym membership prices?",
              timestamp: "Just now",
              status: "active" as const,
              unread: true,
              messages: [...c.messages, newMsg],
            }
          }
          return c
        })
      )

      setActivities([
        {
          id: `act_sim_${Date.now()}`,
          type: "message_sent",
          title: "Inbound Message Received",
          description: "WhatsApp inquiry from Rohan Sharma: 'Hi, what are your gym membership prices?'",
          timestamp: "Just now",
          status: "info",
        },
        ...activities,
      ])
      setDemoStep(1)
    } else if (stepNumber === 2) {
      // Step 2: AI Reply Grounded in KB
      const newMsg = {
        id: `m1_sim_2`,
        sender: "ai" as const,
        content: `Hi Rohan! Our premium gym membership packages at Veda Wellness are:
- Monthly: ₹2,500
- Quarterly: ₹6,500
- Semi-Annual: ₹12,000
- Annual Performance Package: ₹18,000

All packages include access to the medical gym, lockers, and 2 general physical fitness assessments. Would you like to schedule an assessment?`,
        timestamp: "Just now",
      }

      setConversations(
        conversations.map((c) => {
          if (c.id === "conv_1") {
            return {
              ...c,
              lastMessage: "All packages include access to the medical gym...",
              timestamp: "Just now",
              status: "active" as const,
              unread: false,
              pendingAI: false,
              messages: [...c.messages, newMsg],
            }
          }
          return c
        })
      )

      setActivities([
        {
          id: `act_sim_${Date.now()}`,
          type: "message_sent",
          title: "AI Response Dispatched",
          description: "Replied to Rohan Sharma on WhatsApp: Shared membership pricing structures.",
          timestamp: "Just now",
          status: "success",
        },
        ...activities,
      ])
      setDemoStep(2)
    } else if (stepNumber === 3) {
      // Step 3: Score Lead
      setLeads(
        leads.map((lead) => {
          if (lead.id === "l_1") {
            return {
              ...lead,
              leadScore: 92,
              bookingProbability: 85,
              reasoning: "Inquired about lower body rehab coaching slot. Responded instantly to pricing options and membership lists.",
            }
          }
          return lead
        })
      )

      setKpis(
        kpis.map((kpi) => {
          if (kpi.id === "hot_leads") {
            return {
              ...kpi,
              value: "43",
              change: 8.4,
            }
          }
          return kpi
        })
      )

      setActivities([
        {
          id: `act_sim_${Date.now()}`,
          type: "lead_scored",
          title: "Lead Scored: 92/100",
          description: "Rohan Sharma evaluated as Hot Lead based on pricing query and immediate interest.",
          timestamp: "Just now",
          status: "success",
        },
        ...activities,
      ])
      setDemoStep(3)
    } else if (stepNumber === 4) {
      // Step 4: Confirm Booking
      const customerMsg = {
        id: `m1_sim_3`,
        sender: "customer" as const,
        content: "Can I book tomorrow at 6PM?",
        timestamp: "Just now",
      }

      const aiMsg = {
        id: `m1_sim_4`,
        sender: "ai" as const,
        content: "I have scheduled your Sports Physiotherapy session for tomorrow at 6:00 PM. I am sending you a confirmation SMS. Looking forward to seeing you!",
        timestamp: "Just now",
      }

      setConversations(
        conversations.map((c) => {
          if (c.id === "conv_1") {
            return {
              ...c,
              lastMessage: "I have scheduled your Sports Physiotherapy session...",
              timestamp: "Just now",
              status: "active" as const,
              unread: false,
              pendingAI: false,
              messages: [...c.messages, customerMsg, aiMsg],
            }
          }
          return c
        })
      )

      const newBooking: BookingItem = {
        id: `b_sim_1`,
        customerName: "Rohan Sharma",
        service: "Sports Physiotherapy",
        timeSlot: "Tomorrow, 06:00 PM",
        status: "confirmed",
        value: 1800,
      }

      setBookingList([newBooking, ...bookingList])

      setLeads(
        leads.map((lead) => {
          if (lead.id === "l_1") {
            return { ...lead, status: "Booked", bookingProbability: 95 }
          }
          return lead
        })
      )

      setKpis(
        kpis.map((kpi) => {
          if (kpi.id === "revenue_opp") {
            return { ...kpi, value: "₹5,43,800", change: 12.8 }
          }
          if (kpi.id === "conv_rate") {
            return { ...kpi, value: "25.4%", change: 2.7 }
          }
          return kpi
        })
      )

      setActivities([
        {
          id: `act_sim_${Date.now()}`,
          type: "booking_created",
          title: "Booking Confirmed",
          description: "Rohan Sharma booked for Sports Physiotherapy tomorrow at 6:00 PM.",
          timestamp: "Just now",
          status: "info",
        },
        ...activities,
      ])
      setDemoStep(4)
    } else if (stepNumber === 5) {
      // Step 5: Follow-up & Recs
      setActivities([
        {
          id: `act_sim_${Date.now()}`,
          type: "follow_up",
          title: "Follow-up Dispatched",
          description: "Automated WhatsApp follow-up reminder sent to Vikram Malhotra regarding workout plans.",
          timestamp: "Just now",
          status: "warning",
        },
        ...activities,
      ])

      const newRec = {
        id: `rec_sim_1`,
        title: "Follow up with Priya Nair - 36h inactive",
        description: "Priya Nair hasn't responded to the annual membership price quote. Click to draft reminder.",
        priority: "medium" as const,
        actionLabel: "Draft Reminder",
      }

      setRecs([newRec, ...recs])
      setDemoStep(5)
    }
  }

  const handleResetDemo = () => {
    setKpis(kpiCards)
    setConversations(recentConversations)
    setActivities(activityFeed)
    setBookingList(bookings as BookingItem[])
    setRecs(recommendations)
    setLeads(initialLeads)
    setSelectedConvId(recentConversations[0]?.id || "")
    setSelectedLeadId(null)
    setDemoStep(0)
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* 1. Mobile navigation slide-out backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Left Sidebar (Persistent on large screens) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/25 backdrop-blur-md transition-all duration-300 lg:static ${
          sidebarCollapsed ? "lg:w-[68px] w-60" : "w-60"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand / Logo */}
        <div className={`flex h-14 items-center justify-between border-b border-border ${sidebarCollapsed ? "lg:px-3 lg:justify-center" : "px-5"}`}>
          <Logo size={20} iconOnly={sidebarCollapsed} />
          {!sidebarCollapsed && (
            <span className="text-[9px] font-bold bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.2 rounded shrink-0">
              v1.0
            </span>
          )}
          
          {/* Desktop collapse/expand toggler */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex text-muted-foreground hover:text-foreground cursor-pointer rounded p-1 hover:bg-muted/40"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.name
            const Icon = item.icon
            const hasUnread = item.name === "Conversations" && conversations.some((c) => c.unread)

            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name)
                  setSidebarOpen(false)
                }}
                className={`relative flex w-full items-center rounded-md px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  sidebarCollapsed ? "lg:justify-center lg:gap-0 lg:px-0" : "gap-3"
                } ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={`truncate ${sidebarCollapsed ? "lg:hidden" : ""}`}>{item.name}</span>
                {hasUnread && (
                  sidebarCollapsed ? (
                    <>
                      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-info hidden lg:block" />
                      <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-info lg:hidden" />
                    </>
                  ) : (
                    <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-info" />
                  )
                )}
              </button>
            )
          })}
        </nav>

        {/* Business Switcher / Account details at bottom */}
        <div className={`border-t border-border bg-muted/20 transition-all duration-300 ${sidebarCollapsed ? "lg:p-2 lg:space-y-1 p-4 space-y-2" : "p-4 space-y-2"}`}>
          <div
            className={`flex items-center rounded-lg border border-border/80 bg-card/40 p-2.5 hover:bg-card hover:border-border transition-all cursor-pointer ${
              sidebarCollapsed ? "lg:justify-center lg:p-2 gap-3 lg:gap-0" : "gap-3"
            }`}
            title={sidebarCollapsed ? "Veda Wellness - Indiranagar, BLR" : undefined}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 border border-primary/20 text-primary flex-shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div className={`min-w-0 flex-1 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
              <h4 className="text-[11px] font-bold text-foreground truncate">
                Veda Wellness
              </h4>
              <p className="text-[9px] text-muted-foreground truncate">
                Indiranagar, BLR
              </p>
            </div>
            <ChevronDown className={`h-3 w-3 text-muted-foreground shrink-0 ${sidebarCollapsed ? "lg:hidden" : ""}`} />
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className={`w-full text-left py-1.5 text-[10px] text-muted-foreground hover:text-destructive font-semibold transition-colors flex items-center ${
                sidebarCollapsed ? "lg:justify-center lg:px-0 px-2.5 gap-2 lg:gap-0" : "px-2.5 gap-2"
              }`}
              title={sidebarCollapsed ? "Sign out of panel" : undefined}
            >
              {sidebarCollapsed ? (
                <>
                  <LogOut className="h-4 w-4 hidden lg:block shrink-0" />
                  <span className="lg:hidden">Sign out of panel</span>
                </>
              ) : (
                <span>Sign out of panel</span>
              )}
            </button>
          )}
        </div>
      </aside>

      {/* 3. Main Dashboard Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-6 bg-card/10 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/40"
            >
              <Menu className="h-4 w-4" />
            </button>
            
            {/* Breadcrumb path */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-muted-foreground">FlowPilot</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">{activeTab}</span>
              {isDemoMode && (
                <span className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-warning/10 border border-warning/25 text-warning tracking-wide select-none">
                  <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                  <span>Viewing Demo Data</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Command Palette trigger search button */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 rounded-md border border-border bg-card/25 hover:bg-card-hover transition-colors px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Search className="h-3 w-3 text-muted-foreground" />
              <span>Search commands...</span>
              <kbd className="pointer-events-none inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground/60 leading-none">
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>
            {/* Sync diagnostics button */}
            <button
              onClick={handleSync}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card/40 hover:bg-card-hover transition-colors px-3 py-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? "animate-spin text-primary" : ""}`} />
              <span>{isSyncing ? "Refreshing..." : "Sync Logs"}</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notification alert bell */}
            <div className="relative">
              <button className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card/40 hover:bg-card-hover transition-colors text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
              </button>
               {conversations.some((c) => c.unread) && (
                <span className="absolute right-1 top-1 flex h-1.5 w-1.5 rounded-full bg-info" />
              )}
            </div>

            {/* Profile Avatar */}
            <div className="h-8 w-8 rounded-full border border-border overflow-hidden bg-primary/10 flex items-center justify-center text-xs font-bold text-foreground cursor-pointer">
              JD
            </div>
          </div>
        </header>

        {/* Dashboard Scrollable Area */}
        <main
          className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6"
          data-sidebar-collapsed={sidebarCollapsed}
        >
          {activeTab === "Dashboard" && (() => {
            const topRec = recs.find((r) => r.priority === "high") || recs[0];
            return (
              <>
                {/* TOP ZONE: KPI Cards Grid */}
                <KPICards kpis={kpis} />

                {topRec && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3.5 rounded-lg border border-primary/20 bg-primary/5 text-xs">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse shrink-0" />
                      <span>
                        <strong className="text-primary font-semibold">Priority Recommendation:</strong>{" "}
                        {topRec.title} &mdash; <span className="text-muted-foreground">{topRec.description}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("Leads")}
                      className="px-3 py-1 rounded bg-primary text-primary-foreground font-bold hover:bg-primary/90 text-[10px] uppercase tracking-wide shrink-0 transition-all cursor-pointer self-end sm:self-auto"
                    >
                      {topRec.actionLabel} &rarr;
                    </button>
                  </div>
                )}

                {/* MIDDLE ZONE: Funnel & Revenue Analysis */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LeadFunnel />
                <RevenueChart />
              </div>

              {/* MIDDLE ZONE 2: Conversations & Live Activities */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentConversations conversations={conversations} onViewAll={() => setActiveTab("Conversations")} />
                <ActivityFeed activities={activities} />
              </div>

              {/* BOTTOM ZONE: Three Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  {/* Active Bookings scheduling list */}
                  <BookingsList bookings={bookingList} onViewAll={() => setActiveTab("Bookings")} />
                </div>
                <div className="md:col-span-1">
                  {/* Smart follow up recommendations list */}
                  <Recommendations recommendations={recs} />
                </div>
                <div className="md:col-span-1 flex flex-col gap-6">
                  <SystemHealth />
                  <EvaluationMetrics metrics={dbMetrics || undefined} />
                </div>
              </div>
            </>
          )})()}

          {activeTab === "Leads" && (
            <LeadsView
              leads={leads}
              setLeads={setLeads}
              selectedLeadId={selectedLeadId}
              setSelectedLeadId={setSelectedLeadId}
              onViewConversation={(convId) => {
                setSelectedConvId(convId)
                setActiveTab("Conversations")
              }}
              isDemoMode={isDemoMode}
            />
          )}

          {activeTab === "Conversations" && (
            <ConversationsView
              conversations={conversations}
              setConversations={setConversations}
              selectedId={selectedConvId}
              setSelectedId={setSelectedConvId}
              onViewLead={(convId) => {
                const leadMap: Record<string, string> = {
                  'conv_1': 'l_1',
                  'conv_2': 'l_2',
                  'conv_3': 'l_5', // Vikram
                  'conv_4': 'l_3', // Priya
                  'conv_5': 'l_6', // Arjun
                  'conv_7': 'l_8', // Devendra
                  'conv_8': 'l_9', // Meera
                  'conv_9': 'l_10', // Sanjay
                  'conv_10': 'l_11', // Pooja
                  'conv_11': 'l_12', // Rajesh
                  'conv_12': 'l_13', // Neha
                }
                const leadId = leadMap[convId] || 'l_1'
                setSelectedLeadId(leadId)
                setActiveTab("Leads")
              }}
              isDemoMode={isDemoMode}
            />
          )}

          {activeTab === "Bookings" && (
            <BookingsView
              bookingList={bookingList}
              setBookingList={setBookingList}
              onViewConversation={(convId) => {
                setSelectedConvId(convId)
                setActiveTab("Conversations")
              }}
              isDemoMode={isDemoMode}
            />
          )}

          {activeTab === "Analytics" && (
            <AnalyticsView isDemoMode={isDemoMode} />
          )}

          {activeTab === "Settings" && (
            <SettingsView isDemoMode={isDemoMode} />
          )}
        </main>
      </div>

      {/* Floating Demo Simulator Panel */}
      <DemoController
        currentStep={demoStep}
        onExecuteStep={handleExecuteDemoStep}
        onReset={handleResetDemo}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={setActiveTab}
        onToggleTheme={toggleTheme}
        customers={(() => {
          const list: { name: string; id: string; type: "conversation" | "lead" }[] = []
          const seen = new Set<string>()
          conversations.forEach((c) => {
            if (!seen.has(c.customerName)) {
              seen.add(c.customerName)
              list.push({ name: c.customerName, id: c.id, type: "conversation" })
            }
          })
          leads.forEach((l) => {
            if (!seen.has(l.name)) {
              seen.add(l.name)
              list.push({ name: l.name, id: l.id, type: "lead" })
            }
          })
          return list
        })()}
      />
    </div>
  )
}
export default DashboardShell
