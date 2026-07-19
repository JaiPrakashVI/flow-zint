import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { revenueData } from "../mockData"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { useChartColors } from "../../../lib/useChartColors"

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border border-border bg-card/95 p-3 shadow-xl text-[11px] font-sans backdrop-blur-sm z-50">
        <p className="font-semibold text-foreground mb-1.5">{label}</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-6">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Actual:
            </span>
            <span className="font-mono font-bold text-foreground">
              ₹{payload[0].value.toLocaleString("en-IN")}
            </span>
          </div>
          {payload[1] && (
            <div className="flex items-center justify-between gap-6">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
                Forecasted:
              </span>
              <span className="font-mono font-semibold text-muted-foreground">
                ₹{payload[1].value.toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>
      </div>
    )
  }
  return null
}

export function RevenueChart() {
  const colors = useChartColors()

  const formatYAxis = (tickItem: number) => {
    if (tickItem >= 1000) {
      return `₹${(tickItem / 1000).toFixed(0)}k`
    }
    return `₹${tickItem}`
  }

  return (
    <Card className="border-border bg-card/40 flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="db-title font-semibold uppercase tracking-wider text-muted-foreground">
              Revenue Analytics
            </CardTitle>
            <CardDescription className="db-text text-muted-foreground mt-0.5">
              Comparison of actual receipts vs. AI forecast projections
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 db-subtext font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-foreground">Actual Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 border border-dashed border-muted-foreground/60" />
              <span className="text-muted-foreground">Forecasted</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[250px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueData}
            margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.primary} stopOpacity={0.18} />
                <stop offset="95%" stopColor={colors.primary} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.mutedForeground} stopOpacity={0.05} />
                <stop offset="95%" stopColor={colors.mutedForeground} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={colors.grid}
            />
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
              tickFormatter={formatYAxis}
              dx={-5}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: colors.border, strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="actual"
              stroke={colors.primary}
              strokeWidth={1.8}
              fillOpacity={1}
              fill="url(#colorActual)"
            />
            <Area
              type="monotone"
              dataKey="forecasted"
              stroke={colors.mutedForeground}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorForecast)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
export default RevenueChart
