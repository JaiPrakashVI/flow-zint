import type { Recommendation } from "../types"
import { Badge } from "../../../components/ui/badge"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { Sparkles, ArrowRight } from "lucide-react"

export function Recommendations({ recommendations }: { recommendations: Recommendation[] }) {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      default:
        return "muted"
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "High Priority"
      case "medium":
        return "Medium Action"
      default:
        return "Suggestion"
    }
  }

  return (
    <Card className="border-border bg-card/40 flex flex-col h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="db-title font-semibold uppercase tracking-wider text-muted-foreground">
            AI Opportunity Engine
          </CardTitle>
          <CardDescription className="db-text text-muted-foreground mt-0.5">
            Prescriptive alerts and recommended quick-actions
          </CardDescription>
        </div>
        <Badge variant="outline" className="db-subtext border-primary/20 text-primary font-bold bg-primary/5 gap-1 shrink-0">
          <Sparkles className="h-3 w-3" />
          <span>3 Insights</span>
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2">
        {recommendations.slice(0, 2).map((rec) => {
          return (
            <div
              key={rec.id}
              className="flex flex-col justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-muted-foreground/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="db-subtext font-bold text-foreground leading-normal">
                  {rec.title}
                </h4>
                <Badge variant={getPriorityVariant(rec.priority)} className="db-label font-bold tracking-wider uppercase shrink-0 py-0 px-1">
                  {getPriorityLabel(rec.priority)}
                </Badge>
              </div>
              <p className="db-subtext text-muted-foreground mt-1 leading-relaxed font-medium">
                {rec.description}
              </p>
              
              <div className="mt-3 flex items-center justify-end">
                <Button size="sm" variant="outline" className="gap-1 db-subtext h-6 py-0 px-2 font-bold bg-background">
                  <span>{rec.actionLabel}</span>
                  <ArrowRight className="h-2.5 w-2.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
export default Recommendations
