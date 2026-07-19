import { funnelStages } from "../mockData"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Clock, ArrowRight } from "lucide-react"

export function LeadFunnel() {
  const formatINR = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)}L`
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  // Calculate total pipeline value dynamically
  const totalPipeline = funnelStages.reduce((sum, s) => sum + s.value, 0)

  // Find max count to scale visual bar heights/widths relatively
  const maxCount = funnelStages[0]?.count || 100

  return (
    <Card className="border-border bg-card/40 flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="db-title font-semibold uppercase tracking-wider text-muted-foreground">
              Lead Funnel Status
            </CardTitle>
            <CardDescription className="db-text text-muted-foreground mt-0.5">
              Lifecycle stages, pipeline value, and average velocity
            </CardDescription>
          </div>
          <span className="db-subtext text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
            Total Pipeline: {formatINR(totalPipeline)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        {/* Responsive layout: Grid on tablet+, list on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {funnelStages.map((stage, idx) => {
            const pctOfMax = (stage.count / maxCount) * 100
            const isLast = idx === funnelStages.length - 1

            return (
              <div key={stage.stage} className="relative flex flex-col justify-between group">
                <div className="border border-border/80 bg-card/50 rounded-lg p-3 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between h-full relative z-10">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="db-text font-bold text-foreground">{stage.stage}</span>
                      <span className="db-subtext text-muted-foreground font-mono">
                        {stage.stage !== "New" ? `${stage.conversionRate.toFixed(0)}%` : "100%"}
                      </span>
                    </div>

                    <div className="mt-2.5 flex items-baseline gap-1.5">
                      <span className="db-mid-value font-bold tracking-tight text-foreground">
                        {stage.count}
                      </span>
                      <span className="db-subtext text-muted-foreground">leads</span>
                    </div>

                    <p className="db-subtext font-semibold text-primary mt-1 font-mono">
                      {formatINR(stage.value)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2">
                    {/* Visual filled bar represent size relation */}
                    <div className="h-1 w-full bg-muted/65 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/75 rounded-full transition-all duration-500" 
                        style={{ width: `${pctOfMax}%` }} 
                      />
                    </div>

                    <div className="flex items-center gap-1 db-subtext text-muted-foreground font-medium">
                      <Clock className="h-3 w-3 text-muted-foreground/75" />
                      <span>{stage.avgTime} avg</span>
                    </div>
                  </div>
                </div>

                {/* Connector Arrow (Desktop only, between stages) */}
                {!isLast && (
                  <div className="hidden md:flex absolute top-1/2 -right-2.5 -translate-y-1/2 z-20 items-center justify-center bg-background border border-border rounded-full h-5 w-5 text-muted-foreground shadow-sm">
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
export default LeadFunnel
