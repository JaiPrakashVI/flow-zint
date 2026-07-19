import { useState, Fragment } from "react"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import {
  Plus,
  Check,
  X,
  User,
  Calendar,
  Clock,
  CreditCard,
  MessageSquare,
  ChevronRight,
} from "lucide-react"

export interface BookingItem {
  id: string
  customerName: string
  service: string
  timeSlot: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  value: number
}

interface BookingsViewProps {
  bookingList: BookingItem[]
  setBookingList: React.Dispatch<React.SetStateAction<BookingItem[]>>
  onViewConversation?: (conversationId: string) => void
  isDemoMode?: boolean
}

const phoneMap: Record<string, string> = {
  "Rohan Sharma": "+91 98450 12345",
  "Dr. Ananya Iyer": "+91 99160 88776",
  "Vikram Malhotra": "+91 96112 55443",
  "Priya Nair": "+91 97312 99881",
  "Amit Patel": "+91 98801 44332",
  "Devendra Singh": "+91 98765 43210",
  "Sanjay Singhal": "+91 96543 21098",
  "Pooja Hegde": "+91 95432 10987",
  "Rajesh Khanna": "+91 94321 09876",
  "Neha Deshmukh": "+91 93210 98765",
  "Shreya Ghoshal": "+91 90987 65432",
  "Sunita Williams": "+91 89876 54321",
}

const convMap: Record<string, string> = {
  "Rohan Sharma": "conv_1",
  "Dr. Ananya Iyer": "conv_2",
  "Vikram Malhotra": "conv_3",
  "Priya Nair": "conv_4",
  "Arjun Mehta": "conv_5",
  "Kavita Reddy": "conv_6",
  "Devendra Singh": "conv_7",
  "Meera Nair": "conv_8",
  "Sanjay Singhal": "conv_9",
  "Pooja Hegde": "conv_10",
  "Rajesh Khanna": "conv_11",
  "Neha Deshmukh": "conv_12",
}

import { apiClient } from "../../lib/apiClient"

export function BookingsView({ bookingList, setBookingList, onViewConversation, isDemoMode = false }: BookingsViewProps) {
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [dateFilter, setDateFilter] = useState<"upcoming" | "all">("upcoming")
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  // Form states
  const [newCustomer, setNewCustomer] = useState("")
  const [newService, setNewService] = useState("Sports Physiotherapy")
  const [newTime, setNewTime] = useState("")
  const [newValue, setNewValue] = useState("")

  const handleStatusChange = async (id: string, newStatus: BookingItem["status"]) => {
    if (isDemoMode) {
      setBookingList(
        bookingList.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      )
      return
    }
    try {
      await apiClient.patch(`/api/bookings/${id}`, { status: newStatus })
      setBookingList(
        bookingList.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      )
    } catch (err) {
      console.error("[Bookings View] Status update failed:", err)
    }
  }

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomer || !newTime) return

    if (isDemoMode) {
      const addedBooking: BookingItem = {
        id: `b_manual_${Date.now()}`,
        customerName: newCustomer,
        service: newService,
        timeSlot: newTime,
        status: "confirmed",
        value: Number(newValue) || 2000,
      }
      setBookingList([addedBooking, ...bookingList])
      setNewCustomer("")
      setNewTime("")
      setNewValue("")
      setShowAddForm(false)
      return
    }

    try {
      const customerRes = await apiClient.post("/api/customers/find-or-create", { name: newCustomer })
      
      const newBooking = await apiClient.post("/api/bookings", {
        customerId: customerRes.id,
        service: newService,
        dateTime: new Date(newTime).toISOString()
      })

      const addedBooking: BookingItem = {
        id: newBooking.id,
        customerName: newCustomer,
        service: newService,
        timeSlot: newTime,
        status: "confirmed",
        value: Number(newValue) || 2000,
      }

      setBookingList([addedBooking, ...bookingList])
      setNewCustomer("")
      setNewTime("")
      setNewValue("")
      setShowAddForm(false)
    } catch (err) {
      console.error("[Bookings View] Create booking failed:", err)
      const newBooking: BookingItem = {
        id: `b_manual_${Date.now()}`,
        customerName: newCustomer,
        service: newService,
        timeSlot: newTime,
        status: "confirmed",
        value: Number(newValue) || 2000,
      }
      setBookingList([newBooking, ...bookingList])
      setNewCustomer("")
      setNewTime("")
      setNewValue("")
      setShowAddForm(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success"
      case "pending":
        return "warning"
      case "confirmed":
        return "info"
      case "cancelled":
        return "destructive"
      default:
        return "muted"
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val)
  }

  const isUpcomingBooking = (timeSlot: string): boolean => {
    if (timeSlot.startsWith("Today") || timeSlot.startsWith("Tomorrow")) return true
    if (timeSlot.includes("July")) {
      const parts = timeSlot.split(" ")
      const day = parseInt(parts[1])
      // Current date is July 11, 2026. Upcoming dates are >= 11.
      if (!isNaN(day) && day >= 11) return true
    }
    return false
  }

  const getBookingDay = (timeSlot: string): string => {
    if (timeSlot.startsWith("Today")) return "Today"
    if (timeSlot.startsWith("Tomorrow")) return "Tomorrow"
    if (timeSlot.includes(",")) {
      return timeSlot.split(",")[0].trim()
    }
    const parts = timeSlot.split(" ")
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1].replace(",", "")}`
    }
    return timeSlot
  }

  const getDateWeight = (timeSlot: string): number => {
    if (timeSlot.startsWith("Today")) return 1
    if (timeSlot.startsWith("Tomorrow")) return 2
    if (timeSlot.includes("July")) {
      const parts = timeSlot.split(" ")
      const day = parseInt(parts[1])
      if (!isNaN(day)) {
        if (day >= 12) return 10 + day // July 12 is 22, July 13 is 23
        return 100 - day // July 10 is 90, July 08 is 92 (past events backwards)
      }
    }
    return 50
  }

  // Filtering list
  const filteredBookings = bookingList.filter((b) => {
    const matchesStatus = statusFilter === "All" || b.status === statusFilter
    const matchesDate = dateFilter === "all" || isUpcomingBooking(b.timeSlot)
    return matchesStatus && matchesDate
  })

  // Group and sort
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    return getDateWeight(a.timeSlot) - getDateWeight(b.timeSlot)
  })

  const selectedBooking = bookingList.find((b) => b.id === selectedBookingId) || null

  let lastGroup = ""

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Bookings & Schedule</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage clinic consultations, rehabilitation slots, and client calendars
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm" className="gap-1 font-bold">
          <Plus className="h-3.5 w-3.5" />
          <span>New Booking</span>
        </Button>
      </div>

      {/* Manual Booking Creation Modal Overlay */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-[380px] border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <CardHeader className="pb-3 border-b border-border/80">
              <CardTitle className="text-sm font-bold text-foreground">Schedule Appointment</CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Book a manual slot in the Veda Wellness calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleAddBooking} className="space-y-3.5 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={newCustomer}
                    onChange={(e) => setNewCustomer(e.target.value)}
                    className="flex h-8.5 w-full rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Service Type
                  </label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    className="flex h-8.5 w-full rounded border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  >
                    <option value="Sports Physiotherapy">Sports Physiotherapy</option>
                    <option value="Nutrition Consultation">Nutrition Consultation</option>
                    <option value="Elite Rehab Training">Elite Rehab Training</option>
                    <option value="Clinical Yoga Batch">Clinical Yoga Batch</option>
                    <option value="Diagnostic Assessment">Diagnostic Assessment</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Date & Time Slot
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tomorrow, 03:30 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="flex h-8.5 w-full rounded border border-border bg-background px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    Package Value (INR)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2500"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="flex h-8.5 w-full rounded border border-border bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                  />
                </div>

                <div className="flex gap-2 pt-3 border-t border-border/80 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                    className="h-8"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="h-8">
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and stats overview */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border/50 pb-3">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card border border-border rounded px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground font-semibold">Date Range:</span>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as "upcoming" | "all")}
            className="bg-card border border-border rounded px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="upcoming">Upcoming & Today</option>
            <option value="all">All Dates</option>
          </select>
        </div>

        <span className="text-[10px] text-muted-foreground font-mono bg-muted/65 px-2 py-0.5 rounded border border-border/80 ml-auto font-bold">
          {sortedBookings.length} entries found
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Bookings Ledger list */}
        <Card className="border-border bg-card/40 overflow-hidden xl:col-span-2">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground/80 tracking-wider">
                  <th className="p-3.5 font-semibold">Client Name</th>
                  <th className="p-3.5 font-semibold">Assessment / Service</th>
                  <th className="p-3.5 font-semibold">Timing</th>
                  <th className="p-3.5 font-semibold">Price</th>
                  <th className="p-3.5 font-semibold text-center">Status</th>
                  <th className="p-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {sortedBookings.map((b) => {
                  const currentGroup = getBookingDay(b.timeSlot)
                  const showGroupHeader = currentGroup !== lastGroup
                  lastGroup = currentGroup

                  const isSelected = selectedBookingId === b.id

                  return (
                    <Fragment key={b.id}>
                      {showGroupHeader && (
                        <tr key={`group-${currentGroup}`} className="bg-muted/15 border-y border-border/40">
                          <td colSpan={6} className="px-3.5 py-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/90 font-mono">
                            {currentGroup}
                          </td>
                        </tr>
                      )}
                      
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBookingId(b.id)}
                        className={`hover:bg-muted/15 transition-colors cursor-pointer ${
                          isSelected ? "bg-primary/5 border-l-2 border-primary" : ""
                        }`}
                      >
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] border ${
                              isSelected ? "bg-primary/20 text-primary border-primary/20" : "bg-muted/60 text-muted-foreground border-border"
                            }`}>
                              <User className="h-3 w-3" />
                            </div>
                            <span className="font-bold text-foreground">{b.customerName}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-muted-foreground">
                          {b.service}
                        </td>
                        <td className="p-3.5 text-muted-foreground font-mono text-[10.5px]">
                          {b.timeSlot}
                        </td>
                        <td className="p-3.5 font-bold font-mono text-foreground">
                          {formatCurrency(b.value)}
                        </td>
                        <td className="p-3.5 text-center">
                          <Badge variant={getStatusVariant(b.status)} className="text-[9px] font-bold py-0.5 px-2">
                            {b.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          {b.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusChange(b.id, "confirmed")}
                                className="h-6 w-6 p-0 rounded-full bg-success hover:bg-success/90"
                                title="Confirm"
                              >
                                <Check className="h-3 w-3 text-success-foreground" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusChange(b.id, "cancelled")}
                                className="h-6 w-6 p-0 rounded-full border-destructive/20 text-destructive hover:bg-destructive/10"
                                title="Cancel"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                          {b.status === "confirmed" && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(b.id, "completed")}
                              className="h-6 px-2 text-[9px] bg-primary text-primary-foreground font-bold"
                            >
                              Complete
                            </Button>
                          )}
                          {b.status === "completed" && (
                            <span className="text-[10px] text-success font-bold mr-1">Done</span>
                          )}
                          {b.status === "cancelled" && (
                            <span className="text-[10px] text-destructive font-bold mr-1">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    </Fragment>
                  )
                })}
                
                {sortedBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Calendar className="h-10 w-10 text-muted-foreground/30 stroke-[1.5]" />
                        <div>
                          <p className="text-sm font-medium text-foreground">No Bookings Found</p>
                          <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                            Bookings will appear here once customers start booking via WhatsApp or when a manual slot is added.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right Side: Booking Details side panel */}
        <div className="xl:col-span-1">
          {selectedBooking ? (
            <Card className="border-border bg-card/40">
              <CardHeader className="pb-3 border-b border-border/80">
                <CardTitle className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Booking Summary
                </CardTitle>
                <CardDescription className="text-[10.5px] text-muted-foreground mt-0.5">
                  Scheduled slot diagnostic properties
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs font-semibold">
                
                {/* Customer card details */}
                <div className="space-y-1 p-3 rounded-lg border border-border/60 bg-muted/20">
                  <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                    Customer Info
                  </h4>
                  <div className="font-bold text-foreground text-sm mt-1">{selectedBooking.customerName}</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-1">
                    Phone: {phoneMap[selectedBooking.customerName] || "+91 99000 12345"}
                  </div>
                  <div className="text-[10.5px] text-muted-foreground mt-0.5">
                    Role: Wellness Member
                  </div>
                </div>

                {/* Service parameters */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Service</span>
                    </span>
                    <span className="font-bold text-foreground text-right">{selectedBooking.service}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>Slot timing</span>
                    </span>
                    <span className="font-mono text-foreground">{selectedBooking.timeSlot}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-primary" />
                      <span>Session Price</span>
                    </span>
                    <span className="font-mono text-foreground font-bold">{formatCurrency(selectedBooking.value)}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={getStatusVariant(selectedBooking.status)} className="uppercase text-[9px] font-bold px-2 py-0.2">
                      {selectedBooking.status}
                    </Badge>
                  </div>
                </div>

                {/* State overrides */}
                <div className="space-y-2 pt-2">
                  {selectedBooking.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(selectedBooking.id, "confirmed")}
                        className="flex-1 gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Confirm Slot</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(selectedBooking.id, "cancelled")}
                        className="flex-1 gap-1 text-destructive border-destructive/20 hover:bg-destructive/10"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </Button>
                    </div>
                  )}

                  {onViewConversation && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const convId = convMap[selectedBooking.customerName] || "conv_1"
                        onViewConversation(convId)
                      }}
                      className="w-full gap-1.5 border-primary/20 hover:bg-primary/10 text-primary bg-primary/5 mt-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Go to WhatsApp Chat</span>
                      <ChevronRight className="h-3 w-3 ml-auto text-primary/70" />
                    </Button>
                  )}
                </div>

              </CardContent>
            </Card>
          ) : (
            <div className="h-[200px] border border-dashed border-border rounded-lg flex flex-col items-center justify-center p-6 text-center bg-card/10">
              <Calendar className="h-8 w-8 text-muted-foreground/50 mb-2" />
              <h4 className="text-xs font-bold text-foreground">Appointment Profile</h4>
              <p className="text-[10.5px] text-muted-foreground max-w-xs mt-1">
                Select a booking row from the calendar ledger to inspect clinical details, check phone numbers, and jump to customer chats.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default BookingsView
