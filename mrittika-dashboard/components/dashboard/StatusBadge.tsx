import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  "Order Confirmed": "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Refunded: "bg-purple-100 text-purple-700",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || "bg-brand-sand/50 text-brand-charcoal/60"
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        style,
        className
      )}
    >
      {status}
    </span>
  )
}

export { statusStyles }
