import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-brand-sand pb-4">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-charcoal">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-sm text-brand-charcoal/60">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
