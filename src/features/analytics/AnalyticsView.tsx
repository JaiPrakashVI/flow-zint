import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Zap, ShieldCheck, HeartPulse } from "lucide-react"
import { useQuery } from "../../lib/apiClient"
import { useChartColors } from "../../lib/useChartColors"

// Mock dataset for intent categories
const intentData = [
  { name: "Hot Lead", count: 42, color: "hsl(var(--success))" },
  { name: "Follow Up", count: 28, color: "hsl(var(--warning))" },
  { name: "Support", count: 18, color: "hsl(var(--primary))" },
  { name: "Cold / General", count: 32, color: "hsl(var(--muted-foreground) / 0.5)" },
]

// Mock dataset for daily latency and accuracy
const modelPerformanceData = [
  { date: "Jul 01", latency: 1.62, accuracy: 96 },
  { date: "Jul 02", latency: 1.45, accuracy: 98 },
  { date: "Jul 03", latency: 1.58, accuracy: 97 },
  { date: "Jul 04", latency: 1.32, accuracy: 99 },
  { date: "Jul 05", latency: 1.40, accuracy: 98 },
  { date: "Jul 06", latency: 1.55, accuracy: 96 },
  { date: "Jul 07", latency: 1.42, accuracy: 99 },
  { date: "Jul 08", latency: 1.38, accuracy: 98 },
  { date: "Jul 09", latency: 1.48, accuracy: 97 },
  { date: "Jul 10", latency: 1.45, accuracy: 98.5 },
]

export function AnalyticsView({ isDemoMode = false }: { isDemoMode?: boolean }) {
  const colors = useChartColors()
  const { data: dbMetrics } = useQuery<any[]>("/api/dashboard/evaluation-metrics", { refetchInterval: 5000, enabled: !isDemoMode })
  const { data: dbLeads } = useQuery<any[]>("/api/customers", { refetchInterval: 5000, enabled: !isDemoMode })

  let avgLatency = "1.45s"
  let hallucinationRate = "0.00%"
  let groundedRate = "98.5%"

  if (dbMetrics && dbMetrics.length > 0) {
    const total = dbMetrics.length
    const totalLatency = dbMetrics.reduce((sum, m) => sum + m.latencyMs, 0)
    const groundedCount = dbMetrics.filter(m => m.grounded).length
    const hallucinationCount = dbMetrics.filter(m => m.hallucinationFlag).length

    avgLatency = ((totalLatency / total) / 1000).toFixed(2) + "s"
    hallucinationRate = ((hallucinationCount / total) * 100).toFixed(2) + "%"
    groundedRate = ((groundedCount / total) * 100).toFixed(1) + "%"
  }

  let hotCount = 0
  let followUpCount = 0
  let supportCount = 0
  let coldCount = 0

  if (dbLeads) {
    dbLeads.forEach(l => {
      const intent = l.intent?.toLowerCase()
      if (intent === "high-intent" || intent === "pricing_inquiry" || intent === "booking_request") {
        hotCount++
      } else if (intent === "follow-up" || intent === "general_question") {
        followUpCount++
      } else if (intent === "support" || intent === "complaint") {
        supportCount++
      } else {
        coldCount++
      }
    })
  }

  const intentChartData = dbLeads && dbLeads.length > 0
    ? [
        { name: "Hot Lead", count: hotCount, color: "hsl(var(--success))" },
        { name: "Follow Up", count: followUpCount, color: "hsl(var(--warning))" },
        { name: "Support", count: supportCount, color: "hsl(var(--primary))" },
        { name: "Cold / General", count: coldCount, color: "hsl(var(--muted-foreground) / 0.5)" },
      ]
    : intentData

  const performanceData = dbMetrics && dbMetrics.length > 0
    ? dbMetrics.slice(-10).map((m, idx) => ({
        date: `Turn ${idx + 1}`,
        latency: Number((m.latencyMs / 1000).toFixed(2)),
        accuracy: Number((m.confidence * 100).toFixed(1))
      }))
    : modelPerformanceData
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Advanced Analytics & Audits</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Deep diagnostic statistics for revenue conversion, vector search, and model efficiency
        </p>
      </div>

      {/* Highlights summary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Avg Latency</span>
              <h3 className="text-lg font-bold text-foreground font-mono mt-0.5">{avgLatency}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-success/10 border border-success/20 flex items-center justify-center text-success shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Hallucination Rate</span>
              <h3 className="text-lg font-bold text-success font-mono mt-0.5">{hallucinationRate}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center text-info shrink-0">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Grounded Response Rate</span>
              <h3 className="text-lg font-bold text-foreground font-mono mt-0.5">{groundedRate}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Intent Distribution Bar Chart */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lead Intent Classification
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Breakdown of incoming WhatsApp enquiries classified by AI models
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intentChartData} margin={{ left: -20, right: 5, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis
                  dataKey="name"
                  stroke={colors.tick}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke={colors.tick}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.15)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-md border border-border bg-card/95 p-2 shadow-md text-[10px] font-sans">
                          <p className="font-bold text-foreground">{payload[0].name}: {payload[0].value} leads</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="count" fill={colors.primary} radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Model Accuracy vs. Latency Line Chart */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              LLM Performance Turnaround
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              10-day trending analytics for inference latency and RAG accuracy
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ left: -20, right: 5, top: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis
                  dataKey="date"
                  stroke={colors.tick}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  stroke={colors.tick}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  dx={-5}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-md border border-border bg-card/95 p-2.5 shadow-md text-[10px] space-y-1">
                          <p className="font-bold text-foreground mb-1">{payload[0].payload.date}</p>
                          <p className="text-warning font-semibold">Latency: {payload[0].value}s</p>
                          <p className="text-primary font-semibold">Accuracy: {payload[1].value}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: "10px", fontWeight: "semibold" }}
                />
                <Line
                  name="Latency (sec)"
                  type="monotone"
                  dataKey="latency"
                  stroke={colors.warning}
                  strokeWidth={1.8}
                  dot={{ r: 2 }}
                />
                <Line
                  name="Accuracy (%)"
                  type="monotone"
                  dataKey="accuracy"
                  stroke={colors.primary}
                  strokeWidth={1.8}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
export default AnalyticsView
