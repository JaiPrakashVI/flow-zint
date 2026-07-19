import { Sun, Moon } from "lucide-react"
import { useTheme } from "./ThemeProvider"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300 cursor-pointer"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 transition-transform duration-300 rotate-0" />
      ) : (
        <Sun className="h-4 w-4 transition-transform duration-300 rotate-180 text-warning" />
      )}
    </button>
  )
}
