import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  "Order Confirmed": "bg-blue-50 text-blue-700 border border-blue-100",
  Processing: "bg-amber-50 text-amber-700 border border-amber-100",
  Shipped: "bg-indigo-50 text-indigo-700 border border-indigo-100",
  Delivered: "bg-green-50 text-green-700 border border-green-100",
  Cancelled: "bg-red-50 text-red-700 border border-red-100",
  Refunded: "bg-purple-50 text-purple-700 border border-purple-100",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-brand-sand/30 text-brand-bark/60 border border-brand-sand/50"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-medium font-body",
        style,
        className
      )}
    >
      {status}
    </span>
  )
}

export { statusStyles }
