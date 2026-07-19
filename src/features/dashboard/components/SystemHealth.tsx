import { systemStatus } from "../mockData"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { ShieldCheck } from "lucide-react"

export function SystemHealth() {
  return (
    <Card className="border-border bg-card/40 flex flex-col h-full">
      <CardHeader className="pb-2.5">
        <CardTitle className="db-title font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>System Integrity</span>
        </CardTitle>
        <CardDescription className="db-text text-muted-foreground mt-0.5">
          Real-time integration channels health report
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 font-medium">
        {/* WhatsApp Channel status */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card/50">
          <div className="space-y-0.5">
            <h4 className="db-subtext font-bold text-foreground">WhatsApp API Gateway</h4>
            <p className="db-subtext text-muted-foreground">FlowPilot automation pipeline</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <Badge variant="success" className="db-label font-bold py-0.5 px-1.5">
              Online
            </Badge>
          </div>
        </div>

        {/* RAG Knowledge base status */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card/50">
          <div className="space-y-0.5">
            <h4 className="db-subtext font-bold text-foreground">RAG Vector Index</h4>
            <p className="db-subtext text-muted-foreground">Knowledge Base context vectors</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <Badge variant="success" className="db-label font-bold py-0.5 px-1.5">
              Synced
            </Badge>
          </div>
        </div>

        {/* API Latencies */}
        <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card/50">
          <div className="space-y-0.5">
            <h4 className="db-subtext font-bold text-foreground">API Latency Gateway</h4>
            <p className="db-subtext text-muted-foreground">HTTP request turnaround</p>
          </div>
          <span className="db-subtext font-bold text-foreground font-mono bg-muted/65 px-2 py-0.5 rounded border border-border/80">
            {systemStatus.apiLatencyMs}ms
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
export default SystemHealth
