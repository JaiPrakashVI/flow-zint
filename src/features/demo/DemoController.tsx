import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Sparkles, RefreshCw, X, PlayCircle, Info } from "lucide-react"

interface DemoControllerProps {
  currentStep: number
  onExecuteStep: (step: number) => void
  onReset: () => void
}

export function DemoController({ currentStep, onExecuteStep, onReset }: DemoControllerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const steps = [
    {
      number: 1,
      title: "Inbound Msg",
      desc: "Simulate Rohan Sharma asking: 'Hi, what are your gym membership prices?'",
    },
    {
      number: 2,
      title: "AI RAG Reply",
      desc: "AI answers automatically on WhatsApp grounded in indexed membership pricing.",
    },
    {
      number: 3,
      title: "Lead Scoring",
      desc: "AI background job scores Rohan (92/100) and writes detailed reasoning.",
    },
    {
      number: 4,
      title: "Confirm Booking",
      desc: "Rohan requests 'tomorrow at 6PM'. AI books slot and updates Conversion Rate & Revenue KPIs.",
    },
    {
      number: 5,
      title: "Follow-up & Recs",
      desc: "Sends follow-up nudge to Amit Patel, appends to Activity, updates Recommendations list.",
    },
  ]

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {isOpen ? (
        <Card className="w-80 border-primary/30 bg-card shadow-2xl border-2">
          <CardHeader className="pb-2 border-b border-border/80 flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span>Live Demo Simulator</span>
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground mt-0.5">
                Trigger script events sequentially for the judges
              </CardDescription>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </CardHeader>
          <CardContent className="p-3 space-y-3">
            {/* Step list */}
            <div className="space-y-2">
              {steps.map((step) => {
                const isCompleted = currentStep >= step.number
                const isNext = currentStep + 1 === step.number

                return (
                  <div
                    key={step.number}
                    className={`p-2 rounded border text-xs font-medium transition-all ${
                      isCompleted
                        ? "border-success/20 bg-success/5 text-success/90"
                        : isNext
                        ? "border-primary/20 bg-primary/5 text-foreground cursor-pointer hover:border-primary/45"
                        : "border-border/60 bg-muted/20 text-muted-foreground"
                    }`}
                    onClick={() => isNext && onExecuteStep(step.number)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">
                        Step {step.number}: {step.title}
                      </span>
                      {isCompleted ? (
                        <span className="text-[9px] font-bold text-success uppercase">Done</span>
                      ) : isNext ? (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase">
                          <span>Trigger</span>
                          <PlayCircle className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <span className="text-[9px] text-muted-foreground font-semibold">Locked</span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-0.5 leading-normal ${
                      isCompleted ? "text-success/75" : isNext ? "text-muted-foreground" : "text-muted-foreground/60"
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Reset control */}
            <div className="flex items-center justify-between pt-2 border-t border-border/80">
              <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                <Info className="h-3 w-3" />
                Step {Math.min(5, currentStep)} of 5 active
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={onReset}
                className="h-6 text-[10px] font-bold px-2 gap-1 border-border/80 bg-background"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Demo</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-105 transition-all border border-primary-foreground/10"
          title="Open Demo Controller"
        >
          <Sparkles className="h-5 w-5 animate-pulse" />
        </button>
      )}
    </div>
  )
}
export default DemoController
