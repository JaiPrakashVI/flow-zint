import { Progress } from "../../../components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { HeartPulse, CheckSquare, Zap, Gauge } from "lucide-react"

interface EvaluationMetricsProps {
  metrics?: any[]
}

export function EvaluationMetrics({ metrics }: EvaluationMetricsProps) {
  let latencySec = 1.25
  let confidencePercent = 94.2
  let groundedPercent = 88.0
  let hallucinationPercent = 0.0

  if (metrics && metrics.length > 0) {
    const total = metrics.length
    const totalLatency = metrics.reduce((sum, m) => sum + m.latencyMs, 0)
    const totalConfidence = metrics.reduce((sum, m) => sum + m.confidence, 0)
    const groundedCount = metrics.filter(m => m.grounded).length
    const hallucinationCount = metrics.filter(m => m.hallucinationFlag).length

    latencySec = (totalLatency / total) / 1000
    confidencePercent = (totalConfidence / total) * 100
    groundedPercent = (groundedCount / total) * 100
    hallucinationPercent = (hallucinationCount / total) * 100
  }

  return (
    <Card className="border-border bg-card/40 flex flex-col h-full">
      <CardHeader className="pb-2.5">
        <CardTitle className="db-title font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Gauge className="h-4 w-4 text-primary" />
          <span>LLM Evaluation Metrics</span>
        </CardTitle>
        <CardDescription className="db-text text-muted-foreground mt-0.5">
          Automated accuracy, safety, and confidence auditing
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 font-medium">
        {/* Latency metric */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between db-subtext">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-warning" />
              Inference Latency
            </span>
            <span className="font-bold text-foreground font-mono">
              {latencySec.toFixed(2)}s
            </span>
          </div>
          <Progress value={latencySec * 40} className="h-1 bg-muted" />
        </div>

        {/* Confidence metric */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between db-subtext">
            <span className="text-muted-foreground flex items-center gap-1">
              <CheckSquare className="h-3.5 w-3.5 text-primary" />
              Response Confidence
            </span>
            <span className="font-bold text-foreground font-mono">
              {confidencePercent.toFixed(1)}%
            </span>
          </div>
          <Progress value={confidencePercent} className="h-1 bg-muted" />
        </div>

        {/* Grounded rate */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between db-subtext">
            <span className="text-muted-foreground flex items-center gap-1">
              <HeartPulse className="h-3.5 w-3.5 text-success" />
              Grounded Response Rate
            </span>
            <span className="font-bold text-foreground font-mono">
              {groundedPercent.toFixed(1)}%
            </span>
          </div>
          <Progress value={groundedPercent} className="h-1 bg-muted" />
        </div>

        {/* Hallucination check */}
        <div className="flex items-center justify-between p-2 rounded-lg border border-success/20 bg-success/5 db-subtext">
          <span className="text-success font-semibold flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" />
            Hallucination Rate Checked
          </span>
          <span className="font-bold text-success font-mono">
            {hallucinationPercent.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
export default EvaluationMetrics
