import { cn } from "@/lib/utils"
import { Leaf, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  emptyAction?: { label: string; onClick: () => void }
  error?: string | null
  onRetry?: () => void
  getRowKey: (row: T) => string
  striped?: boolean
}

function SkeletonRow() {
  return (
    <tr className="border-b border-brand-sand/50">
      {Array.from({ length: 4 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-brand-sand/40" style={{ width: `${60 + Math.random() * 40}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "No data found",
  emptyAction,
  error,
  onRetry,
  getRowKey,
  striped = true,
}: DataTableProps<T>) {
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm text-red-700 mb-3">{error}</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Try again
          </Button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-brand-sand bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-sand bg-brand-mist/30">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-medium uppercase text-brand-charcoal/50">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-brand-sand bg-white p-12 text-center">
        <Leaf className="mx-auto h-12 w-12 text-brand-charcoal/20" />
        <p className="mt-4 font-display text-lg font-medium text-brand-charcoal/40">
          {emptyMessage}
        </p>
        {emptyAction && (
          <Button onClick={emptyAction.onClick} className="mt-4 bg-brand-sage hover:bg-brand-sage/90 text-white">
            {emptyAction.label}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="hidden md:block rounded-xl border border-brand-sand bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-sand bg-brand-mist/30 text-left text-xs font-medium uppercase text-brand-charcoal/50">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={getRowKey(row)}
                className={cn(
                  "border-b border-brand-sand/50 hover:bg-brand-mist/30 transition-colors",
                  striped && i % 2 === 1 ? "bg-brand-mist/20" : "bg-white"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
