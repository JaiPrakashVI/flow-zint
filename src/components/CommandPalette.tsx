import { useEffect, useState, useRef } from "react"
import {
  Search,
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  BarChart3,
  Settings,
  User,
  SunMoon,
} from "lucide-react"

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (tab: string) => void
  onToggleTheme?: () => void
  customers?: { name: string; id: string; type: "conversation" | "lead" }[]
}

interface CommandItem {
  id: string
  label: string
  category: "Pages" | "Customers" | "Actions"
  icon: any
  action: () => void
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onToggleTheme,
  customers = [],
}: CommandPaletteProps) {
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  // Register global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (isOpen) onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Reset search query and selection when palette opens/closes
  useEffect(() => {
    if (isOpen) {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [isOpen])


  // Define static commands
  const pages: CommandItem[] = [
    { id: "p-dash", label: "Dashboard", category: "Pages", icon: LayoutDashboard, action: () => onNavigate("Dashboard") },
    { id: "p-leads", label: "Leads", category: "Pages", icon: Users, action: () => onNavigate("Leads") },
    { id: "p-convs", label: "Conversations", category: "Pages", icon: MessageSquare, action: () => onNavigate("Conversations") },
    { id: "p-books", label: "Bookings", category: "Pages", icon: Calendar, action: () => onNavigate("Bookings") },
    { id: "p-analytics", label: "Analytics", category: "Pages", icon: BarChart3, action: () => onNavigate("Analytics") },
    { id: "p-settings", label: "Settings", category: "Pages", icon: Settings, action: () => onNavigate("Settings") },
  ]

  const actions: CommandItem[] = [
    {
      id: "a-theme",
      label: "Toggle Color Theme",
      category: "Actions",
      icon: SunMoon,
      action: () => {
        if (onToggleTheme) onToggleTheme()
      },
    },
  ]

  const customerItems: CommandItem[] = customers.map((c) => ({
    id: `c-${c.id}-${c.type}`,
    label: c.name,
    category: "Customers",
    icon: User,
    action: () => {
      onNavigate(c.type === "conversation" ? "Conversations" : "Leads")
    },
  }))

  const allItems = [...pages, ...customerItems, ...actions]

  // Filter items
  const filteredItems = allItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  )

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action()
        onClose()
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    }
  }

  // Auto-scroll selected item into view
  useEffect(() => {
    const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  // Group filtered items by category for rendering
  const itemsByCategory: Record<string, CommandItem[]> = {}
  filteredItems.forEach((item) => {
    if (!itemsByCategory[item.category]) {
      itemsByCategory[item.category] = []
    }
    itemsByCategory[item.category].push(item)
  })

  // Track absolute index across categories
  let absoluteIndex = 0

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search bar */}
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search for customers..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="w-full bg-transparent py-3.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border-none font-medium"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[9px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
          {filteredItems.length > 0 ? (
            Object.entries(itemsByCategory).map(([category, items]) => (
              <div key={category} className="mb-2 last:mb-0">
                <div className="px-3 pt-2 pb-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {category}
                </div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const currentIndex = absoluteIndex
                    absoluteIndex++
                    const isSelected = selectedIndex === currentIndex
                    const Icon = item.icon

                    return (
                      <div
                        key={item.id}
                        data-index={currentIndex}
                        onClick={() => {
                          item.action()
                          onClose()
                        }}
                        className={`px-3 py-2 flex items-center justify-between rounded-md cursor-pointer transition-colors text-xs font-semibold ${
                          isSelected
                            ? "bg-accent text-accent-foreground"
                            : "text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <span>{item.label}</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] text-muted-foreground font-medium">
                            Enter
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No commands or customers found matching &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
