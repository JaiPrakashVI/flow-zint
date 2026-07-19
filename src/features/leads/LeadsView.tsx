import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import {
  Search,
  ArrowUpDown,
  UserCheck,
  Brain,
  CheckCircle,
} from "lucide-react"

export interface LeadItem {
  id: string
  name: string
  phoneNumber: string
  status: "New" | "Engaged" | "Qualified" | "Booked" | "Converted" | "Churned"
  leadScore: number
  bookingProbability: number
  intent: "high-intent" | "follow-up" | "support" | "cold"
  urgency: "Immediate" | "Within 48h" | "Medium" | "Low"
  sentiment: "Positive" | "Neutral" | "Inquisitive" | "Frustrated"
  reasoning: string
  lastContact: string
}

interface LeadsViewProps {
  leads: LeadItem[]
  setLeads: React.Dispatch<React.SetStateAction<LeadItem[]>>
  onViewConversation?: (customerId: string) => void
  selectedLeadId?: string | null
  setSelectedLeadId?: (id: string | null) => void
  isDemoMode?: boolean
}

export function LeadsView({
  leads,
  setLeads,
  onViewConversation,
  selectedLeadId,
  setSelectedLeadId,
}: LeadsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0)
  
  const [localSelectedLeadId, setLocalSelectedLeadId] = useState<string | null>(null)
  const currentSelectedId = selectedLeadId !== undefined ? selectedLeadId : localSelectedLeadId
  const currentSetSelectedId = setSelectedLeadId !== undefined ? setSelectedLeadId : setLocalSelectedLeadId

  const selectedLead = leads.find((l) => l.id === currentSelectedId) || null
  const [sortField, setSortField] = useState<"leadScore" | "bookingProbability" | "name">("leadScore")
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = (field: "leadScore" | "bookingProbability" | "name") => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  const handleStatusChange = (id: string, newStatus: LeadItem["status"]) => {
    setLeads(
      leads.map((lead) =>
        lead.id === id ? { ...lead, status: newStatus, leadScore: newStatus === "Converted" ? 100 : lead.leadScore } : lead
      )
    )
  }

  // Filter and sort logic
  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phoneNumber.includes(searchTerm)
      const matchesStatus = statusFilter === "All" || lead.status === statusFilter
      const matchesScore = lead.leadScore >= minScoreFilter
      return matchesSearch && matchesStatus && matchesScore
    })
    .sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]

      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
      } else {
        return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number)
      }
    })

  const getIntentVariant = (intent: string) => {
    switch (intent) {
      case "high-intent":
        return "success"
      case "follow-up":
        return "warning"
      case "support":
        return "info"
      default:
        return "muted"
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return "text-success bg-success/10 border-success/15"
      case "Inquisitive":
        return "text-info bg-info/10 border-info/15"
      case "Frustrated":
        return "text-destructive bg-destructive/10 border-destructive/15"
      default:
        return "text-muted-foreground bg-muted border-border"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Lead Intelligence Manager</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time AI-scored business pipeline and intent summaries
        </p>
      </div>

      {/* Filters and Search toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-2 max-w-sm w-full relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-9 w-full rounded-md border border-border bg-card/40 px-9 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">All Stages</option>
              <option value="New">New</option>
              <option value="Engaged">Engaged</option>
              <option value="Qualified">Qualified</option>
              <option value="Booked">Booked</option>
              <option value="Converted">Converted</option>
              <option value="Churned">Churned</option>
            </select>
          </div>

          {/* Min score slider */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-semibold">Min Score:</span>
            <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border">
              {minScoreFilter}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="h-1 w-20 accent-primary bg-muted rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Main Leads Table */}
        <Card className="border-border bg-card/40 xl:col-span-2 overflow-x-auto">
          <CardContent className="p-0">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                  <th className="p-3 font-semibold">Lead Details</th>
                  <th className="p-3 font-semibold text-center">Status</th>
                  <th
                    className="p-3 font-semibold cursor-pointer select-none hover:text-foreground text-center"
                    onClick={() => handleSort("leadScore")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Score</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th
                    className="p-3 font-semibold cursor-pointer select-none hover:text-foreground text-center"
                    onClick={() => handleSort("bookingProbability")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Booking Prob</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="p-3 font-semibold">Intent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {filteredLeads.map((lead) => {
                  const isSelected = selectedLead?.id === lead.id
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => currentSetSelectedId(lead.id)}
                      className={`cursor-pointer transition-colors hover:bg-muted/20 ${
                        isSelected ? "bg-primary/5 border-l-2 border-primary" : ""
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-foreground">{lead.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {lead.phoneNumber}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            lead.status === "Converted"
                              ? "success"
                              : lead.status === "Churned"
                              ? "destructive"
                              : lead.status === "Booked"
                              ? "info"
                              : "secondary"
                          }
                          className="text-[9px] font-bold px-1.5 py-0"
                        >
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`font-bold font-mono text-sm ${
                              lead.leadScore >= 80
                                ? "text-success"
                                : lead.leadScore >= 50
                                ? "text-warning"
                                : "text-muted-foreground"
                            }`}
                          >
                            {lead.leadScore}
                          </span>
                          <span className={`text-[8px] font-bold uppercase tracking-wider ${
                            lead.leadScore >= 80
                              ? "text-success"
                              : lead.leadScore >= 50
                              ? "text-warning"
                              : "text-muted-foreground"
                          }`}>
                            {lead.leadScore >= 80 ? "Hot" : lead.leadScore >= 50 ? "Warm" : "Cold"}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono">
                        {lead.bookingProbability}%
                      </td>
                      <td className="p-3">
                        <Badge variant={getIntentVariant(lead.intent)} className="text-[9px] font-bold py-0">
                          {lead.intent}
                        </Badge>
                        <div className="text-[9px] text-muted-foreground font-medium mt-0.5">
                          Contact: {lead.lastContact}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No leads match the active search and filter constraints.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Lead Intelligence Details Panel (Right Column) */}
        <div className="xl:col-span-1">
          {selectedLead ? (
            <Card className="border-border bg-card/65 sticky top-20 shadow-md">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground">
                    {selectedLead.name}
                  </CardTitle>
                  <span className="text-[9px] text-muted-foreground font-mono font-semibold">
                    ID: {selectedLead.id}
                  </span>
                </div>
                <CardDescription className="text-xs font-semibold text-muted-foreground font-mono">
                  {selectedLead.phoneNumber}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                {/* Scoring Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="p-2.5 rounded-lg border border-border bg-card/40 flex flex-col justify-between cursor-help"
                    title="AI-calculated lead qualification rating based on engagement history and prompt answers"
                  >
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center justify-between">
                      <span>Lead Score</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        selectedLead.leadScore >= 80
                          ? "text-success"
                          : selectedLead.leadScore >= 50
                          ? "text-warning"
                          : "text-destructive"
                      }`}>
                        {selectedLead.leadScore >= 80 ? "Hot" : selectedLead.leadScore >= 50 ? "Warm" : "Cold"}
                      </span>
                    </span>
                    <span className={`text-2xl font-black font-mono mt-1 ${
                      selectedLead.leadScore >= 80
                        ? "text-success"
                        : selectedLead.leadScore >= 50
                        ? "text-warning"
                        : "text-destructive"
                    }`}>
                      {selectedLead.leadScore}/100
                    </span>
                  </div>
                  <div
                    className="p-2.5 rounded-lg border border-border bg-card/40 flex flex-col justify-between cursor-help"
                    title="AI-estimated likelihood of scheduling a booking based on conversion indicators"
                  >
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      Booking Prob
                    </span>
                    <span className="text-2xl font-black text-primary font-mono mt-1">
                      {selectedLead.bookingProbability}%
                    </span>
                  </div>
                </div>

                {/* Qualifiers */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    AI Qualifiers
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <div
                      className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase cursor-help ${getSentimentColor(selectedLead.sentiment)}`}
                      title="AI-detected sentiment from client messages"
                    >
                      Sentiment: {selectedLead.sentiment}
                    </div>
                    <div className="px-2 py-0.5 rounded border border-border bg-muted/30 text-muted-foreground text-[9px] font-bold uppercase">
                      Urgency: {selectedLead.urgency}
                    </div>
                  </div>
                </div>

                {/* Visible Reasoning (CRITICAL RULE IN DATABASE SPEC) */}
                <div className="space-y-1.5 p-3 rounded-lg border border-primary/10 bg-primary/5">
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="h-3.5 w-3.5" />
                    AI Core Reasoning
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-semibold">
                    {selectedLead.reasoning}
                  </p>
                </div>

                {/* manual override controller */}
                <div className="space-y-2 pt-2 border-t border-border/80">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Manual Operations
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.status !== "Converted" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(selectedLead.id, "Converted")}
                        className="w-full gap-1 h-7"
                      >
                        <UserCheck className="h-3 w-3" />
                        <span>Convert Lead (Mark Won)</span>
                      </Button>
                    )}
                    {selectedLead.status !== "Churned" && selectedLead.status !== "Converted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(selectedLead.id, "Churned")}
                        className="w-full gap-1 h-7 text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <span>Mark Churned</span>
                      </Button>
                    )}
                    {onViewConversation && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const convMap: Record<string, string> = {
                            'l_1': 'conv_1',
                            'l_2': 'conv_2',
                            'l_3': 'conv_4',
                            'l_5': 'conv_3',
                            'l_6': 'conv_5',
                          }
                          const convId = convMap[selectedLead.id] || 'conv_1'
                          onViewConversation(convId)
                        }}
                        className="w-full gap-1 h-7 border-primary/20 hover:bg-primary/10 text-primary font-bold bg-primary/5"
                      >
                        <span>Jump to Conversation</span>
                      </Button>
                    )}
                    {selectedLead.status === "Converted" && (
                      <div className="flex items-center gap-1.5 text-success font-bold text-[10px] bg-success/15 border border-success/20 rounded-md p-2 w-full justify-center">
                        <CheckCircle className="h-4 w-4" />
                        <span>Deal Converted & Concluded</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-[250px] border border-dashed border-border rounded-lg flex flex-col items-center justify-center p-6 text-center bg-card/10">
              <Brain className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <h4 className="text-xs font-bold text-foreground">Lead Profile Details</h4>
              <p className="text-[10.5px] text-muted-foreground max-w-xs mt-1">
                Select a lead row from the directory to inspect AI qualifiers, score reasoning, and trigger manually overriding actions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default LeadsView
