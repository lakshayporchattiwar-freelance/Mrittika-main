"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { createClient } from "@/utils/supabase/client"
import { format, isToday, startOfDay } from "date-fns"
import {
  Search,
  MoreHorizontal,
  Eye,
  RefreshCw,
  ChevronDown,
  Package,
  Clock,
  Copy,
} from "lucide-react"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import StatusBadge from "@/components/dashboard/StatusBadge"
import { toast } from "sonner"
import { updateOrderStatus } from "./actions"
import { cn } from "@/lib/utils"

interface OrderItem {
  name: string
  qty: number
  price: number
  image?: string
}

interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  total: number
  status: string
  payment_method: string
  items: OrderItem[]
  shipping_address?: string
  razorpay_payment_id?: string
  shiprocket_awb?: string
  refund_status?: string
  refund_amount?: number
  refund_id?: string
  cancelled_at?: string
  cancellation_reason?: string
  coupon_code?: string
  created_at: string
  updated_at?: string
}

const statusOptions = [
  "Order Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
]

function formatOrderId(id: string) {
  if (id.startsWith("MRT-")) return id
  return `MRT-${id.slice(0, 8).toUpperCase()}`
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [paymentFilter, setPaymentFilter] = useState("All")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [hasMore, setHasMore] = useState(false)

  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [statusTarget, setStatusTarget] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [awbInput, setAwbInput] = useState("")
  const [updating, setUpdating] = useState(false)

  const fetchOrders = useCallback(async (from = 0) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .range(from, from + 49)

    if (data) {
      const mapped = (data as any[]).map((o) => ({
        ...o,
        items: (o.order_items || []).map((item: any) => ({
          name: item.product_name,
          qty: item.quantity,
          price: item.unit_price,
          image: item.image_url || `/images/products/${item.product_slug}.webp`,
        })),
        shiprocket_awb: o.awb_number,
      }))
      if (from === 0) {
        setOrders(mapped as Order[])
      } else {
        setOrders((prev) => [...prev, ...(mapped as Order[])])
      }
      setHasMore(data.length === 50)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase()
      if (
        q &&
        !o.id.toLowerCase().includes(q) &&
        !(o.customer_name || "").toLowerCase().includes(q) &&
        !(o.customer_email || "").toLowerCase().includes(q)
      )
        return false
      if (statusFilter !== "All" && o.status !== statusFilter) return false
      if (paymentFilter !== "All" && o.payment_method !== paymentFilter)
        return false
      if (fromDate && new Date(o.created_at) < new Date(fromDate))
        return false
      if (toDate) {
        const end = new Date(toDate)
        end.setHours(23, 59, 59, 999)
        if (new Date(o.created_at) > end) return false
      }
      return true
    })
  }, [orders, search, statusFilter, paymentFilter, fromDate, toDate])

  const todayOrders = useMemo(
    () => filtered.filter((o) => isToday(new Date(o.created_at))),
    [filtered]
  )
  const todayTotal = todayOrders.reduce((s, o) => s + (o.total || 0), 0)
  const pendingCount = filtered.filter((o) =>
    ["Order Confirmed", "Processing"].includes(o.status)
  ).length

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success("Order ID copied")
  }

  const handleViewDetails = (order: Order) => {
    setDetailOrder(order)
    setDetailOpen(true)
  }

  const handleUpdateStatus = (order: Order) => {
    setStatusTarget(order)
    setNewStatus(order.status)
    setAwbInput("")
    setStatusDialogOpen(true)
  }

  const confirmStatusUpdate = async () => {
    if (!statusTarget) return
    setUpdating(true)
    const result = await updateOrderStatus(
      statusTarget.id,
      newStatus,
      newStatus === "Shipped" && !statusTarget.shiprocket_awb
        ? awbInput || undefined
        : undefined
    )
    setUpdating(false)
    if (result.success) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === statusTarget.id
            ? {
                ...o,
                status: newStatus,
                shiprocket_awb:
                  newStatus === "Shipped" && awbInput
                    ? awbInput
                    : o.shiprocket_awb,
              }
            : o
        )
      )
      setStatusDialogOpen(false)
      toast.success("Status updated")
    } else {
      toast.error(result.error || "Failed to update status")
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-brand-charcoal/40">
        Loading orders...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-charcoal">
            Orders
          </h1>
          <p className="text-sm text-brand-charcoal/60">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-terracotta/10 px-3 py-1 text-xs font-medium text-brand-terracotta">
            <Package className="h-3 w-3" />
            Total Today: ₹{todayTotal.toLocaleString("en-IN")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" />
            Pending: {pendingCount}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-charcoal/40" />
          <Input
            placeholder="Search by ID, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={(v) => v && setPaymentFilter(v)}>
          <SelectTrigger className="w-full sm:w-[130px]">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Payment</SelectItem>
            <SelectItem value="Prepaid">Prepaid</SelectItem>
            <SelectItem value="COD">COD</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full sm:w-[150px]"
          placeholder="From"
        />
        <Input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full sm:w-[150px]"
          placeholder="To"
        />
      </div>

      <div className="hidden md:block rounded-xl border border-brand-sand bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-sand bg-brand-mist/30 text-left text-xs font-medium uppercase text-brand-charcoal/50">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-brand-charcoal/40"
                  >
                    No orders found
                  </td>
                </tr>
              )}
              {filtered.map((order, i) => (
                <tr
                  key={order.id}
                  className={cn(
                    "border-b border-brand-sand/50 transition-colors hover:bg-brand-mist/30",
                    i % 2 === 1 ? "bg-brand-mist/20" : "bg-white"
                  )}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleCopyId(order.id)}
                      className="font-mono text-xs text-brand-terracotta hover:underline"
                      title="Click to copy"
                    >
                      {formatOrderId(order.id)}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-charcoal">
                      {order.customer_name || "—"}
                    </div>
                    <div className="text-xs text-brand-charcoal/50">
                      {order.customer_email || ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="group relative">
                      {order.items?.length || 0} item
                      {(order.items?.length || 0) !== 1 ? "s" : ""}
                      {order.items && order.items.length > 0 && (
                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-56 rounded-lg border border-brand-sand bg-white p-3 text-xs shadow-lg group-hover:block z-50">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between gap-2 py-0.5"
                            >
                              <span className="truncate">{item.name}</span>
                              <span className="shrink-0 text-brand-charcoal/50">
                                x{item.qty}
                              </span>
                            </div>
                          ))}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-brand-charcoal">
                    ₹{(order.total || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        order.payment_method === "Prepaid"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {order.payment_method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-brand-charcoal/60">
                    {format(new Date(order.created_at), "dd MMM yyyy · h:mm a")}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={
                          "rounded-md p-1 text-brand-charcoal/50 hover:bg-brand-mist hover:text-brand-charcoal"
                        }
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(order)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(order)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Update Status
                        </DropdownMenuItem>
                        {order.status === "Cancelled" && (
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(order)}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            View Refund Status
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-xl border border-brand-sand bg-white p-8 text-center text-brand-charcoal/40">
            No orders found
          </div>
        )}
        {filtered.map((order) => (
          <div
            key={order.id}
            className="rounded-xl border border-brand-sand bg-white p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleCopyId(order.id)}
                className="font-mono text-xs text-brand-terracotta"
              >
                formatOrderId(order.id)
              </button>
              <StatusBadge status={order.status} />
            </div>
            <div className="text-sm font-medium text-brand-charcoal">
              {order.customer_name || "—"}
            </div>
            <div className="text-xs text-brand-charcoal/50">
              {order.customer_email || ""}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">
                ₹{(order.total || 0).toLocaleString("en-IN")}
              </span>
              <span
                className={cn(
                  "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                  order.payment_method === "Prepaid"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                {order.payment_method}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-charcoal/50">
                {format(new Date(order.created_at), "dd MMM yyyy · h:mm a")}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={"rounded-md p-1 text-brand-charcoal/50"}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateStatus(order)}>
                    Update Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => fetchOrders(orders.length)}
          >
            Load more
          </Button>
        </div>
      )}

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>
              {detailOrder && (
                <span className="font-mono">
                  {formatOrderId(detailOrder.id)}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>
          {detailOrder && (
            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between">
                <StatusBadge status={detailOrder.status} />
                <span className="text-xs text-brand-charcoal/50">
                  {format(new Date(detailOrder.created_at), "dd MMM yyyy · h:mm a")}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-brand-charcoal mb-2">
                  Delivery Timeline
                </h3>
                <div className="relative pl-6 space-y-4">
                  {(() => {
                    const deliverySteps = [
                      { key: "placed", label: "Order Placed", desc: format(new Date(detailOrder.created_at), "dd MMM yyyy · h:mm a") },
                      { key: "confirmed", label: "Order Confirmed", desc: detailOrder.status !== "Cancelled" ? "Confirmed by seller" : "" },
                      { key: "processing", label: "Processing", desc: "Being prepared for shipment" },
                      { key: "shipped", label: "Shipped", desc: detailOrder.shiprocket_awb ? `AWB: ${detailOrder.shiprocket_awb}` : "In transit" },
                      { key: "delivered", label: "Delivered", desc: "Package delivered" },
                    ]
                    const statusOrder = ["Order Placed", "Order Confirmed", "Processing", "Shipped", "Delivered"]
                    const currentIdx = statusOrder.indexOf(detailOrder.status)
                    const isCancelled = detailOrder.status === "Cancelled"
                    const isRefunded = detailOrder.status === "Refunded"

                    return deliverySteps.map((step, idx) => {
                      const isCompleted = !isCancelled && !isRefunded && idx <= currentIdx
                      const isCurrent = !isCancelled && !isRefunded && idx === currentIdx
                      return (
                        <div key={step.key} className="relative">
                          <div className={cn(
                            "absolute -left-6 top-1 h-3 w-3 rounded-full border-2",
                            isCurrent ? "border-brand-terracotta bg-brand-terracotta" :
                            isCompleted ? "border-brand-sage bg-brand-sage" :
                            "border-brand-sand bg-white"
                          )} />
                          {idx < deliverySteps.length - 1 && (
                            <div className={cn(
                              "absolute -left-[19px] top-4 w-0.5 h-full",
                              isCompleted && idx < currentIdx ? "bg-brand-sage" : "bg-brand-sand"
                            )} />
                          )}
                          <div className="ml-2">
                            <p className={cn(
                              "text-sm font-medium",
                              isCurrent ? "text-brand-terracotta" :
                              isCompleted ? "text-brand-sage" :
                              "text-brand-charcoal/40"
                            )}>
                              {step.label}
                            </p>
                            {step.desc && isCompleted && (
                              <p className="text-xs text-brand-charcoal/50">{step.desc}</p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  })()}
                  {detailOrder.status === "Cancelled" && (
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-red-500 bg-red-500" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-red-600">Cancelled</p>
                        {detailOrder.cancelled_at && (
                          <p className="text-xs text-brand-charcoal/50">
                            {format(new Date(detailOrder.cancelled_at), "dd MMM yyyy · h:mm a")}
                          </p>
                        )}
                        {detailOrder.cancellation_reason && (
                          <p className="text-xs text-brand-charcoal/50">Reason: {detailOrder.cancellation_reason}</p>
                        )}
                      </div>
                    </div>
                  )}
                  {detailOrder.status === "Refunded" && (
                    <div className="relative">
                      <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-purple-500 bg-purple-500" />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-purple-600">Refunded</p>
                        {detailOrder.refund_amount && (
                          <p className="text-xs text-brand-charcoal/50">₹{detailOrder.refund_amount.toLocaleString("en-IN")}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {detailOrder.shiprocket_awb && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm font-medium text-blue-800">
                    Tracking Number
                  </p>
                  <p className="font-mono text-sm text-blue-900 mt-1">
                    {detailOrder.shiprocket_awb}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-brand-charcoal mb-2">
                  Customer Info
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-brand-charcoal/50">Name:</span>{" "}
                    {detailOrder.customer_name || "—"}
                  </p>
                  <p>
                    <span className="text-brand-charcoal/50">Email:</span>{" "}
                    {detailOrder.customer_email || "—"}
                  </p>
                  <p>
                    <span className="text-brand-charcoal/50">Phone:</span>{" "}
                    {detailOrder.customer_phone || "—"}
                  </p>
                </div>
              </div>

              {detailOrder.shipping_address && (
                <div>
                  <h3 className="text-sm font-semibold text-brand-charcoal mb-2">
                    Shipping Address
                  </h3>
                  <p className="text-sm text-brand-charcoal/70 whitespace-pre-wrap">
                    {detailOrder.shipping_address}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-brand-charcoal mb-2">
                  Items
                </h3>
                <div className="space-y-2">
                  {detailOrder.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-brand-sand p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-brand-charcoal/50">
                            ₹{item.price.toLocaleString("en-IN")} × {item.qty}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold shrink-0">
                        ₹{(item.price * item.qty).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-brand-charcoal mb-2">
                  Payment
                </h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-brand-charcoal/50">Method:</span>{" "}
                    {detailOrder.payment_method}
                  </p>
                  <p>
                    <span className="text-brand-charcoal/50">Total:</span> ₹
                    {(detailOrder.total || 0).toLocaleString("en-IN")}
                  </p>
                  {detailOrder.coupon_code && (
                    <p>
                      <span className="text-brand-charcoal/50">Coupon:</span>{" "}
                      <span className="font-mono text-brand-terracotta">{detailOrder.coupon_code}</span>
                    </p>
                  )}
                  {detailOrder.razorpay_payment_id && (
                    <p>
                      <span className="text-brand-charcoal/50">
                        Payment ID:
                      </span>{" "}
                      <span className="font-mono text-xs">
                        {detailOrder.razorpay_payment_id}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {detailOrder.refund_status && (
                <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                  <h3 className="text-sm font-semibold text-purple-800 mb-1">
                    Refund Status
                  </h3>
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                      detailOrder.refund_status === "processed"
                        ? "bg-green-100 text-green-700"
                        : detailOrder.refund_status === "processing"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-brand-sand/50 text-brand-charcoal/60"
                    )}
                  >
                    {detailOrder.refund_status}
                  </span>
                  {detailOrder.refund_amount && (
                    <p className="text-sm text-purple-700 mt-1">
                      Amount: ₹{detailOrder.refund_amount.toLocaleString("en-IN")}
                    </p>
                  )}
                  {detailOrder.refund_id && (
                    <p className="text-xs text-brand-charcoal/50 mt-1">
                      Refund ID: <span className="font-mono">{detailOrder.refund_id}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              {statusTarget && (
                <span className="font-mono">
                  {formatOrderId(statusTarget.id)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-brand-charcoal">
                New Status
              </label>
              <Select value={newStatus} onValueChange={(v) => v && setNewStatus(v)}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newStatus === "Shipped" &&
              statusTarget &&
              !statusTarget.shiprocket_awb && (
                <div>
                  <label className="text-sm font-medium text-brand-charcoal">
                    AWB Number
                  </label>
                  <Input
                    value={awbInput}
                    onChange={(e) => setAwbInput(e.target.value)}
                    placeholder="Enter tracking AWB"
                    className="mt-1"
                  />
                </div>
              )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmStatusUpdate} disabled={updating}>
              {updating ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
