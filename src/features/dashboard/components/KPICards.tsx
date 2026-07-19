import type { KPICardData } from "../types"
import { Card, CardContent } from "../../../components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function Sparkline({ data, trend }: { data: number[]; trend: "up" | "down" | "neutral" }) {
  if (!data || data.length === 0) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const height = 28
  const width = 80
  const points = data
    .map((val, index) => {
      const x = (index / (data.length - 1)) * width
      // Leave padding at top/bottom of sparkline
      const y = (height - 4) - ((val - min) / range) * (height - 8) + 2
      return `${x},${y}`
    })
    .join(" ")

  const colorClass = 
    trend === "up" 
      ? "text-success" 
      : trend === "down" 
      ? "text-destructive" 
      : "text-muted-foreground"

  return (
    <svg className={`h-7 w-20 overflow-visible ${colorClass}`} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

const kpiTooltips: Record<string, string> = {
  "Revenue Opportunity": "Total estimated pipeline value from active leads",
  "Hot Leads": "Leads scored 80+ with high booking probability",
  "Conversion Rate": "Percentage of engaged leads that converted to bookings",
  "AI Confidence": "Average confidence score of AI-generated responses",
}

export function KPICards({ kpis }: { kpis: KPICardData[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((card) => {
        const isUp = card.trend === "up"
        const isDown = card.trend === "down"

        return (
          <Card
            key={card.id}
            title={kpiTooltips[card.label] || ""}
            className="border-border bg-card/40 hover:bg-card/75 transition-all duration-300 cursor-help"
          >
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <span className="db-title font-semibold text-muted-foreground uppercase tracking-wider">
                  {card.label}
                </span>
                <div
                  className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 db-subtext font-bold ${
                    isUp
                      ? "text-success bg-success/10 border border-success/15"
                      : isDown
                      ? "text-destructive bg-destructive/10 border border-destructive/15"
                      : "text-muted-foreground bg-muted border border-border"
                  }`}
                >
                  {isUp && <TrendingUp className="h-3 w-3" />}
                  {isDown && <TrendingDown className="h-3 w-3" />}
                  {!isUp && !isDown && <Minus className="h-3 w-3" />}
                  <span>{isUp ? "+" : ""}{card.change}%</span>
                </div>
              </div>
              
              <div className="flex items-end justify-between mt-4">
                <div>
                  <h3 className="db-value font-bold tracking-tight text-foreground">
                    {card.value}
                  </h3>
                  <p className="db-subtext text-muted-foreground mt-0.5">
                    {card.subtext}
                  </p>
                </div>
                <div className="pb-1">
                  <Sparkline data={card.sparkline} trend={card.trend} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
export default KPICards
