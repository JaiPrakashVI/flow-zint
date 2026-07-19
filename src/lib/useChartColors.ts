import { useMemo, useEffect, useState } from "react"
import { useTheme } from "../components/ThemeProvider"

export function useChartColors() {
  const { theme } = useTheme()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    // A small delay to ensure DOM is updated and getComputedStyle reads the active theme attributes
    const timer = setTimeout(() => {
      setTick((t) => t + 1)
    }, 50)
    return () => clearTimeout(timer)
  }, [theme])

  return useMemo(() => {
    const root = document.documentElement
    const style = getComputedStyle(root)

    const getVar = (name: string) => {
      const val = style.getPropertyValue(name).trim()
      if (!val) return ""
      return `hsl(${val})`
    }

    return {
      primary: getVar("--primary"),
      success: getVar("--success"),
      warning: getVar("--warning"),
      destructive: getVar("--destructive"),
      info: getVar("--info"),
      grid: getVar("--chart-grid"),
      tick: getVar("--chart-tick"),
      tooltipBg: getVar("--tooltip-bg"),
      tooltipBorder: getVar("--tooltip-border"),
      tooltipText: getVar("--tooltip-text"),
      border: getVar("--border"),
      foreground: getVar("--foreground"),
      card: getVar("--card"),
      muted: getVar("--muted"),
      mutedForeground: getVar("--muted-foreground"),
      background: getVar("--background"),
    }
  }, [theme, tick])
}
