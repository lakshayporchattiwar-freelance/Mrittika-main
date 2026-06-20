import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  trend?: number
  prefix?: string
  colorScheme?: "default" | "success" | "warning" | "danger"
}

const schemeStyles = {
  default: { border: "border-brand-sand", iconBg: "bg-brand-terracotta/15" },
  success: { border: "border-brand-sage/40", iconBg: "bg-brand-sage/15" },
  warning: { border: "border-amber-300", iconBg: "bg-amber-100" },
  danger: { border: "border-red-300", iconBg: "bg-red-100" },
}

export default function StatCard({
  title,
  value,
  icon,
  trend,
  prefix,
  colorScheme = "default",
}: StatCardProps) {
  const styles = schemeStyles[colorScheme]

  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm",
        styles.border
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-[28px] font-bold text-brand-charcoal leading-none">
            {prefix && <span className="text-lg">{prefix}</span>}
            {value}
          </p>
          <p className="mt-2 text-sm text-brand-charcoal/60">{title}</p>
          {trend !== undefined && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trend >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {trend >= 0 ? "+" : ""}
              {trend}%
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            styles.iconBg
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
