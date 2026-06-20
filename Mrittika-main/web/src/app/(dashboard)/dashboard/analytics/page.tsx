"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/utils/supabase/client"
import { format, subDays } from "date-fns"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { IndianRupee, ShoppingBag, TrendingUp, Users, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  "Order Confirmed": "#3b82f6",
  Processing: "#f59e0b",
  Shipped: "#6366f1",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
  Refunded: "#a855f7",
}

interface DailyRevenue {
  date: string
  revenue: number
}

interface StatusCount {
  status: string
  count: number
}

interface PaymentSplit {
  method: string
  count: number
}

interface ProductPerf {
  name: string
  units: number
  revenue: number
}

export default function AnalyticsPage() {
  const [preset, setPreset] = useState<string>("30d")
  const [customStart, setCustomStart] = useState("")
  const [customEnd, setCustomEnd] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  const [revenueData, setRevenueData] = useState<DailyRevenue[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [orderCount, setOrderCount] = useState(0)

  const [statusData, setStatusData] = useState<StatusCount[]>([])
  const [paymentData, setPaymentData] = useState<PaymentSplit[]>([])

  const [productData, setProductData] = useState<ProductPerf[]>([])
  const [totalProductRevenue, setTotalProductRevenue] = useState(0)

  const [newCustomers, setNewCustomers] = useState(0)
  const [returningCustomers, setReturningCustomers] = useState(0)
  const [customerGrowth, setCustomerGrowth] = useState<{ date: string; count: number }[]>([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    let start: Date
    if (preset === "7d") start = subDays(now, 7)
    else if (preset === "30d") start = subDays(now, 30)
    else if (preset === "90d") start = subDays(now, 90)
    else if (preset === "custom" && customStart) start = new Date(customStart)
    else start = subDays(now, 30)

    const end = preset === "custom" && customEnd ? new Date(customEnd) : now
    setDateRange({ start: start.toISOString(), end: end.toISOString() })
  }, [preset, customStart, customEnd])

  useEffect(() => {
    if (!dateRange.start) return
    setLoading(true)

    const supabase = createClient()
    const startStr = dateRange.start
    const endStr = dateRange.end

    supabase
      .from("orders")
      .select("created_at, total, status, payment_method, items, customer_email")
      .gte("created_at", startStr)
      .lte("created_at", endStr)
      .neq("status", "Cancelled")
      .then(({ data }) => {
        if (!data) { setLoading(false); return }

        const dailyRev: Record<string, number> = {}
        let totalRev = 0
        const statusMap: Record<string, number> = {}
        const paymentMap: Record<string, number> = {}
        const prodMap: Record<string, { units: number; revenue: number }> = {}
        const customerSet = new Set<string>()
        const customerFirstOrder: Record<string, string> = {}
        const dailyCustomers: Record<string, Set<string>> = {}

        for (const o of data) {
          const day = format(new Date(o.created_at), "dd MMM")
          dailyRev[day] = (dailyRev[day] || 0) + (o.total || 0)
          totalRev += o.total || 0

          statusMap[o.status] = (statusMap[o.status] || 0) + 1
          paymentMap[o.payment_method || "COD"] = (paymentMap[o.payment_method || "COD"] || 0) + 1

          if (o.items && Array.isArray(o.items)) {
            for (const item of o.items) {
              const name = item.name || "Unknown"
              if (!prodMap[name]) prodMap[name] = { units: 0, revenue: 0 }
              prodMap[name].units += item.qty || 0
              prodMap[name].revenue += (item.price || 0) * (item.qty || 0)
            }
          }

          if (o.customer_email) {
            customerSet.add(o.customer_email)
            const dayKey = format(new Date(o.created_at), "yyyy-MM-dd")
            if (!dailyCustomers[dayKey]) dailyCustomers[dayKey] = new Set()
            dailyCustomers[dayKey].add(o.customer_email)
            if (!customerFirstOrder[o.customer_email] || o.created_at < customerFirstOrder[o.customer_email]) {
              customerFirstOrder[o.customer_email] = o.created_at
            }
          }
        }

        const sortedDays = Object.entries(dailyRev).map(([date, revenue]) => ({ date, revenue }))
        setRevenueData(sortedDays)
        setTotalRevenue(totalRev)
        setOrderCount(data.length)

        setStatusData(
          Object.entries(statusMap).map(([status, count]) => ({ status, count }))
        )
        setPaymentData(
          Object.entries(paymentMap).map(([method, count]) => ({ method, count }))
        )

        const sortedProducts = Object.entries(prodMap)
          .map(([name, v]) => ({ name, units: v.units, revenue: v.revenue }))
          .sort((a, b) => b.revenue - a.revenue)
        setProductData(sortedProducts)
        setTotalProductRevenue(sortedProducts.reduce((s, p) => s + p.revenue, 0))

        const rangeStart = new Date(startStr)
        let newCust = 0
        let retCust = 0
        for (const email of customerSet) {
          if (customerFirstOrder[email] && new Date(customerFirstOrder[email]) >= rangeStart) {
            newCust++
          } else {
            retCust++
          }
        }
        setNewCustomers(newCust)
        setReturningCustomers(retCust)

        const growthEntries = Object.entries(dailyCustomers)
          .sort(([a], [b]) => a.localeCompare(b))
        let cumulative = 0
        const growthData = growthEntries.map(([date, emails]) => {
          cumulative += emails.size
          return { date: format(new Date(date), "dd MMM"), count: cumulative }
        })
        setCustomerGrowth(growthData)

        setLoading(false)
      })
  }, [dateRange.start, dateRange.end])

  const avgDailyRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0
  const repeatRate = (newCustomers + returningCustomers) > 0
    ? ((returningCustomers / (newCustomers + returningCustomers)) * 100).toFixed(1)
    : "0"

  const CHART_COLORS = ["#22c55e", "#f59e0b"]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-brand-charcoal">Analytics</h1>
        <div className="flex flex-wrap items-center gap-2">
          {["7d", "30d", "90d", "custom"].map((p) => (
            <Button
              key={p}
              variant={preset === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPreset(p)}
              className={cn(preset === p && "bg-brand-terracotta hover:bg-brand-terracotta/90 text-white", "min-h-[40px]")}
            >
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : "Custom"}
            </Button>
          ))}
        </div>
      </div>

      {preset === "custom" && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full sm:w-[180px]" />
          <span className="text-brand-charcoal/40">to</span>
          <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full sm:w-[180px]" />
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-brand-charcoal/40">Loading analytics...</div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">Revenue Analytics</h2>
            <div className="rounded-xl border border-brand-sand bg-white p-5">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C4714A" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#C4714A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD4" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6B5E54" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B5E54" }} tickLine={false} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E8DDD4" }} />
                  <Area type="monotone" dataKey="revenue" stroke="#C4714A" strokeWidth={2} fill="url(#analyticsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-brand-sand bg-white p-4">
                <p className="text-sm text-brand-charcoal/60">Total Revenue</p>
                <p className="font-display text-2xl font-bold text-brand-charcoal">₹{totalRevenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl border border-brand-sand bg-white p-4">
                <p className="text-sm text-brand-charcoal/60">Orders in Period</p>
                <p className="font-display text-2xl font-bold text-brand-charcoal">{orderCount}</p>
              </div>
              <div className="rounded-xl border border-brand-sand bg-white p-4">
                <p className="text-sm text-brand-charcoal/60">Avg Daily Revenue</p>
                <p className="font-display text-2xl font-bold text-brand-charcoal">₹{Math.round(avgDailyRevenue).toLocaleString("en-IN")}</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">Orders Analytics</h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-brand-sand bg-white p-5">
                <h3 className="text-sm font-medium text-brand-charcoal/60 mb-4">By Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD4" vertical={false} />
                    <XAxis dataKey="status" tick={{ fontSize: 10, fill: "#6B5E54" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#6B5E54" }} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E8DDD4" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry, idx) => (
                        <Cell key={idx} fill={statusColors[entry.status] || "#C4714A"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-xl border border-brand-sand bg-white p-5">
                <h3 className="text-sm font-medium text-brand-charcoal/60 mb-4">By Payment Method</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={paymentData} dataKey="count" nameKey="method" cx="50%" cy="50%" outerRadius={80} label>
                      {paymentData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E8DDD4" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">Product Performance</h2>
            <div className="hidden md:block rounded-xl border border-brand-sand bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-sand bg-brand-mist/30 text-left text-xs font-medium uppercase text-brand-charcoal/50">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Units Sold</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.slice(0, 10).map((p) => (
                    <tr key={p.name} className="border-b border-brand-sand/50 hover:bg-brand-mist/30">
                      <td className="px-4 py-3 font-medium text-brand-charcoal">{p.name}</td>
                      <td className="px-4 py-3">{p.units}</td>
                      <td className="px-4 py-3 font-semibold">₹{p.revenue.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-brand-charcoal/60">
                        {totalProductRevenue > 0 ? ((p.revenue / totalProductRevenue) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-2">
              {productData.slice(0, 10).map((p) => (
                <div key={p.name} className="rounded-xl border border-brand-sand bg-white p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-brand-charcoal text-sm">{p.name}</p>
                    <p className="font-semibold text-sm">₹{p.revenue.toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-charcoal/60">
                    <span>{p.units} units</span>
                    <span>{totalProductRevenue > 0 ? ((p.revenue / totalProductRevenue) * 100).toFixed(1) : 0}% of total</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-brand-sand bg-white p-5">
              <ResponsiveContainer width="100%" height={Math.max(200, Math.min(productData.length, 10) * 40)}>
                <BarChart data={productData.slice(0, 10)} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD4" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#6B5E54" }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: "#6B5E54" }} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E8DDD4" }} />
                  <Bar dataKey="revenue" fill="#C4714A" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal">Customer Analytics</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-brand-sand bg-white p-4">
                <p className="text-sm text-brand-charcoal/60">New Customers</p>
                <p className="font-display text-2xl font-bold text-brand-charcoal">{newCustomers}</p>
              </div>
              <div className="rounded-xl border border-brand-sand bg-white p-4">
                <p className="text-sm text-brand-charcoal/60">Returning Customers</p>
                <p className="font-display text-2xl font-bold text-brand-charcoal">{returningCustomers}</p>
              </div>
              <div className="rounded-xl border border-brand-sand bg-white p-4">
                <p className="text-sm text-brand-charcoal/60">Repeat Purchase Rate</p>
                <p className="font-display text-2xl font-bold text-brand-charcoal">{repeatRate}%</p>
              </div>
            </div>
            <div className="rounded-xl border border-brand-sand bg-white p-5">
              <h3 className="text-sm font-medium text-brand-charcoal/60 mb-4">Customer Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD4" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6B5E54" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B5E54" }} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E8DDD4" }} />
                  <Line type="monotone" dataKey="count" stroke="#4A6741" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
