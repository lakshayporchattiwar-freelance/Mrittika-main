"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/utils/supabase/client"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Users, RefreshCw, IndianRupee, Search, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import StatusBadge from "@/components/dashboard/StatusBadge"
import { cn } from "@/lib/utils"

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  total: number
  status: string
  created_at: string
}

interface Customer {
  email: string
  name: string
  phone: string
  orderCount: number
  paidAmount: number
  cancelledAmount: number
  refundedAmount: number
  lifetimeValue: number
  avgOrderValue: number
  firstOrder: string
  lastOrder: string
}

const PAID_STATUSES = ["Order Confirmed", "Processing", "Shipped", "Delivered"]
const CANCELLED_STATUSES = ["Cancelled"]
const REFUNDED_STATUSES = ["Refunded"]

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState("all")

  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [sheetOpen, setSheetOpen] = useState(false)
  const [loadingOrders, setLoadingOrders] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("orders")
      .select("id, customer_name, customer_email, customer_phone, total, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) { setLoading(false); return }
        const grouped: Record<string, Customer> = {}
        for (const o of data as Order[]) {
          const email = o.customer_email || o.customer_name || "unknown"
          if (!grouped[email]) {
            grouped[email] = {
              email,
              name: o.customer_name || "Unknown",
              phone: o.customer_phone || "",
              orderCount: 0,
              paidAmount: 0,
              cancelledAmount: 0,
              refundedAmount: 0,
              lifetimeValue: 0,
              avgOrderValue: 0,
              firstOrder: o.created_at,
              lastOrder: o.created_at,
            }
          }
          grouped[email].orderCount++
          grouped[email].lifetimeValue += o.total || 0
          if (PAID_STATUSES.includes(o.status)) {
            grouped[email].paidAmount += o.total || 0
          } else if (CANCELLED_STATUSES.includes(o.status)) {
            grouped[email].cancelledAmount += o.total || 0
          } else if (REFUNDED_STATUSES.includes(o.status)) {
            grouped[email].refundedAmount += o.total || 0
          }
          if (o.created_at < grouped[email].firstOrder) grouped[email].firstOrder = o.created_at
          if (o.created_at > grouped[email].lastOrder) grouped[email].lastOrder = o.created_at
          grouped[email].name = o.customer_name || grouped[email].name
          grouped[email].phone = o.customer_phone || grouped[email].phone
        }
        Object.values(grouped).forEach((c) => {
          c.avgOrderValue = c.orderCount > 0 ? c.paidAmount / c.orderCount : 0
        })
        setCustomers(
          Object.values(grouped).sort((a, b) => b.paidAmount - a.paidAmount)
        )
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase()
      if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false
      if (filter === "repeat" && c.orderCount < 2) return false
      if (filter === "high-value" && c.paidAmount <= 1000) return false
      return true
    })
  }, [customers, search, filter])

  const totalCustomers = customers.length
  const repeatCustomers = customers.filter((c) => c.orderCount > 1).length
  const avgPaidValue = totalCustomers > 0
    ? customers.reduce((s, c) => s + c.paidAmount, 0) / totalCustomers
    : 0

  const handleViewOrders = async (email: string) => {
    setSelectedEmail(email)
    setSheetOpen(true)
    setLoadingOrders(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, total, status, created_at")
      .eq("customer_email", email)
      .order("created_at", { ascending: false })
    setCustomerOrders((data as Order[]) || [])
    setLoadingOrders(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-brand-charcoal/40">
        Loading customers...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-charcoal">
        Customers
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-sand bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sage/15">
              <Users className="h-5 w-5 text-brand-sage" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-brand-charcoal">{totalCustomers}</p>
              <p className="text-sm text-brand-charcoal/60">Total Customers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-brand-sand bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <RefreshCw className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-brand-charcoal">{repeatCustomers}</p>
              <p className="text-sm text-brand-charcoal/60">Repeat Customers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-brand-sand bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-terracotta/15">
              <IndianRupee className="h-5 w-5 text-brand-terracotta" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-brand-charcoal">
                ₹{Math.round(avgPaidValue).toLocaleString("en-IN")}
              </p>
              <p className="text-sm text-brand-charcoal/60">Avg Paid Value</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-charcoal/40" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={(v) => v && setFilter(v)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Customers</SelectItem>
            <SelectItem value="repeat">Repeat Customers</SelectItem>
            <SelectItem value="high-value">High Value (₹1000+ paid)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block rounded-xl border border-brand-sand bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-sand bg-brand-mist/30 text-left text-xs font-medium uppercase text-brand-charcoal/50">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Paid</th>
                <th className="px-4 py-3">Cancelled</th>
                <th className="px-4 py-3">Refunded</th>
                <th className="px-4 py-3">Last Order</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-brand-charcoal/40">
                    No customers found
                  </td>
                </tr>
              )}
              {filtered.map((c, i) => (
                <tr
                  key={c.email}
                  className={cn(
                    "border-b border-brand-sand/50 hover:bg-brand-mist/30 transition-colors",
                    i % 2 === 1 ? "bg-brand-mist/20" : "bg-white"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-terracotta text-xs font-bold text-white">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-brand-charcoal">{c.name}</p>
                        <p className="text-xs text-brand-charcoal/50">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-brand-sage/15 px-2.5 py-0.5 text-xs font-medium text-brand-sage">
                      {c.orderCount}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-green-700">
                    ₹{c.paidAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-red-600">
                    {c.cancelledAmount > 0 ? `₹${c.cancelledAmount.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-purple-600">
                    {c.refundedAmount > 0 ? `₹${c.refundedAmount.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-brand-charcoal/50">
                    {formatDistanceToNow(parseISO(c.lastOrder), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewOrders(c.email)}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((c) => (
          <div key={c.email} className="rounded-xl border border-brand-sand bg-white p-4 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-terracotta text-xs font-bold text-white">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brand-charcoal truncate">{c.name}</p>
                <p className="text-xs text-brand-charcoal/50 truncate">{c.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700 font-semibold">Paid: ₹{c.paidAmount.toLocaleString("en-IN")}</span>
                <span className="text-brand-charcoal/50">{c.orderCount} orders</span>
              </div>
              {c.cancelledAmount > 0 && (
                <p className="text-xs text-red-600">Cancelled: ₹{c.cancelledAmount.toLocaleString("en-IN")}</p>
              )}
              {c.refundedAmount > 0 && (
                <p className="text-xs text-purple-600">Refunded: ₹{c.refundedAmount.toLocaleString("en-IN")}</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full min-h-[44px]"
              onClick={() => handleViewOrders(c.email)}
            >
              View Orders
            </Button>
          </div>
        ))}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Customer Orders</SheetTitle>
            <SheetDescription>{selectedEmail}</SheetDescription>
          </SheetHeader>
          <div className="pt-4">
            {(() => {
              const paidOrders = customerOrders.filter((o) => PAID_STATUSES.includes(o.status))
              const cancelledOrders = customerOrders.filter((o) => CANCELLED_STATUSES.includes(o.status))
              const refundedOrders = customerOrders.filter((o) => REFUNDED_STATUSES.includes(o.status))
              const paidTotal = paidOrders.reduce((s, o) => s + (o.total || 0), 0)
              const cancelledTotal = cancelledOrders.reduce((s, o) => s + (o.total || 0), 0)
              const refundedTotal = refundedOrders.reduce((s, o) => s + (o.total || 0), 0)

              return (
                <div className="mb-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <p className="text-xs text-green-700">Paid</p>
                    <p className="font-bold text-green-800">₹{paidTotal.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-green-600">{paidOrders.length} orders</p>
                  </div>
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                    <p className="text-xs text-red-700">Cancelled</p>
                    <p className="font-bold text-red-800">₹{cancelledTotal.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-red-600">{cancelledOrders.length} orders</p>
                  </div>
                  {refundedTotal > 0 && (
                    <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 col-span-2">
                      <p className="text-xs text-purple-700">Refunded</p>
                      <p className="font-bold text-purple-800">₹{refundedTotal.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-purple-600">{refundedOrders.length} orders</p>
                    </div>
                  )}
                </div>
              )
            })()}
            {loadingOrders && (
              <p className="text-sm text-brand-charcoal/40">Loading...</p>
            )}
            {!loadingOrders && customerOrders.length === 0 && (
              <p className="text-sm text-brand-charcoal/40">No orders found</p>
            )}
            <div className="space-y-2">
              {customerOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border border-brand-sand p-3">
                  <div>
                    <p className="font-mono text-xs text-brand-terracotta">{o.id.slice(0, 8)}</p>
                    <p className="text-xs text-brand-charcoal/50">
                      {formatDistanceToNow(parseISO(o.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-brand-charcoal">
                      ₹{(o.total || 0).toLocaleString("en-IN")}
                    </p>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
