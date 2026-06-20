export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-64 animate-pulse rounded-lg bg-brand-sand/40" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-brand-sand/30" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-brand-sand bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-8 w-24 animate-pulse rounded bg-brand-sand/40" />
                <div className="mt-2 h-4 w-20 animate-pulse rounded bg-brand-sand/30" />
              </div>
              <div className="h-10 w-10 animate-pulse rounded-full bg-brand-sand/30" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-brand-sand bg-white">
          <div className="px-5 py-4 border-b border-brand-sand">
            <div className="h-5 w-32 animate-pulse rounded bg-brand-sand/40" />
          </div>
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-4 w-20 animate-pulse rounded bg-brand-sand/30" />
                <div className="h-4 w-28 animate-pulse rounded bg-brand-sand/30" />
                <div className="h-4 w-16 animate-pulse rounded bg-brand-sand/30" />
                <div className="h-4 w-12 animate-pulse rounded bg-brand-sand/30" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-brand-sand bg-white p-5">
          <div className="h-5 w-32 animate-pulse rounded bg-brand-sand/40 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-brand-sand/20" />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-brand-sand bg-white p-5">
        <div className="h-5 w-48 animate-pulse rounded bg-brand-sand/40 mb-4" />
        <div className="h-64 animate-pulse rounded bg-brand-sand/20" />
      </div>
    </div>
  )
}
