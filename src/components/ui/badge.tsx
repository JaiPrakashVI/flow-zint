import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "muted" | "info"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors border",
        {
          "border-transparent bg-primary text-primary-foreground": variant === "default",
          "border-transparent bg-secondary/80 text-secondary-foreground": variant === "secondary",
          "border-transparent bg-destructive/15 text-destructive": variant === "destructive",
          "border-border bg-transparent text-foreground": variant === "outline",
          "border-success/20 bg-success/10 text-success": variant === "success",
          "border-warning/20 bg-warning/10 text-warning": variant === "warning",
          "border-border bg-muted/40 text-muted-foreground": variant === "muted",
          "border-info/20 bg-info/10 text-info": variant === "info",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
