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
  default: { border: "border-brand-sand", iconBg: "bg-brand-terracotta/10" },
  success: { border: "border-brand-sage/30", iconBg: "bg-brand-sage/10" },
  warning: { border: "border-brand-gold/40", iconBg: "bg-brand-gold/10" },
  danger: { border: "border-red-200", iconBg: "bg-red-50" },
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
        "rounded-2xl border bg-white/80 backdrop-blur-sm p-5 transition-all hover:shadow-sm",
        styles.border
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-[28px] font-semibold text-brand-bark leading-none tracking-tight">
            {prefix && <span className="text-lg">{prefix}</span>}
            {value}
          </p>
          <p className="mt-2 text-sm text-brand-charcoal/50 font-body">{title}</p>
          {trend !== undefined && (
            <p
              className={cn(
                "mt-1 text-xs font-medium font-body",
                trend >= 0 ? "text-brand-sage" : "text-red-500"
              )}
            >
              {trend >= 0 ? "+" : ""}
              {trend}%
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            styles.iconBg
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
