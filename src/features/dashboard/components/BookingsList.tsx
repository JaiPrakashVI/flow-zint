import type { Booking } from "../types"
import { Badge } from "../../../components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { User } from "lucide-react"

export function BookingsList({ bookings, onViewAll }: { bookings: Booking[]; onViewAll?: () => void }) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "success"
      case "pending":
        return "warning"
      case "confirmed":
        return "info"
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

  return (
    <Card className="border-border bg-card/40 flex flex-col h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="db-title font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming Bookings
          </CardTitle>
          <CardDescription className="db-text text-muted-foreground mt-0.5">
            Scheduled clinic assessments and training slots
          </CardDescription>
        </div>
        <Badge variant="outline" className="db-subtext border-border font-semibold bg-card/50">
          Today & Tomorrow
        </Badge>
      </CardHeader>
      <CardContent className="flex-1 overflow-x-auto min-h-[220px]">
        <table className="w-full text-left border-collapse db-text">
          <thead>
            <tr className="border-b border-border/80 db-subtext uppercase font-bold text-muted-foreground/80 tracking-wider">
              <th className="pb-2 font-semibold">Customer</th>
              <th className="pb-2 font-semibold">Service</th>
              <th className="pb-2 font-semibold">Scheduled</th>
              <th className="pb-2 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {bookings.slice(0, 4).map((booking) => (
              <tr key={booking.id} className="hover:bg-muted/30 transition-colors">
                <td className="py-2.5 pr-2 font-bold text-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-muted-foreground/80" />
                    <span className="truncate max-w-[120px]">{booking.customerName}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-2 text-muted-foreground truncate max-w-[140px]">
                  {booking.service}
                </td>
                <td className="py-2.5 pr-2 text-muted-foreground font-mono db-subtext">
                  {booking.timeSlot}
                </td>
                <td className="py-2.5 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={getStatusVariant(booking.status)} className="db-label font-bold px-1.5 py-0">
                      {booking.status}
                    </Badge>
                    <span className="db-label text-muted-foreground/80 font-semibold font-mono">
                      {formatCurrency(booking.value)}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
      {onViewAll && bookings.length > 4 && (
        <div className="px-6 pb-4 pt-1 flex justify-end border-t border-border/40">
          <button
            onClick={onViewAll}
            className="db-subtext font-bold text-primary hover:text-primary/80 transition-all cursor-pointer flex items-center gap-1"
          >
            View all bookings &rarr;
          </button>
        </div>
      )}
    </Card>
  )
}
export default BookingsList
