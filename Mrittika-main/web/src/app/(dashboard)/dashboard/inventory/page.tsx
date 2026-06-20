"use client"

import { useState, useEffect, useMemo } from "react"
import { fetchInventoryProducts, updateStock, getStockHistory } from "./actions"
import { format } from "date-fns"
import {
  Package,
  AlertTriangle,
  XCircle,
  History,
  RefreshCw,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  category: string
  price: number
  compare_price?: number
  sku?: string
  stock_quantity: number
  status: string
  featured?: boolean
  images?: string[]
  created_at: string
  updated_at?: string
}

interface StockMovement {
  id: string
  product_id: string
  product_name: string
  previous_quantity: number
  new_quantity: number
  change_amount: number
  note?: string
  updated_by: string
  created_at: string
}

function resolveImageUrl(url: string): string {
  if (!url) return url
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  if (url.startsWith("/")) {
    return `${supabaseUrl}/storage/v1/object/public${url}`
  }
  return url
}

const stockColor = (qty: number) => {
  if (qty < 5) return "text-red-600"
  if (qty < 20) return "text-amber-600"
  return "text-green-600"
}

const stockStatus = (qty: number) => {
  if (qty === 0) return { label: "Out of Stock", style: "bg-gray-100 text-gray-600" }
  if (qty < 5) return { label: "Critical", style: "bg-red-100 text-red-700" }
  if (qty < 20) return { label: "Low", style: "bg-amber-100 text-amber-700" }
  return { label: "Healthy", style: "bg-green-100 text-green-700" }
}

const barColor = (qty: number) => {
  if (qty < 5) return "#ef4444"
  if (qty < 20) return "#f59e0b"
  return "#22c55e"
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const [updateTarget, setUpdateTarget] = useState<Product | null>(null)
  const [newQty, setNewQty] = useState("")
  const [stockNote, setStockNote] = useState("")
  const [updating, setUpdating] = useState(false)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyProduct, setHistoryProduct] = useState<string | null>(null)
  const [historyData, setHistoryData] = useState<StockMovement[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const fetchProducts = async () => {
    const data = await fetchInventoryProducts()
    setProducts(data as Product[])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const totalProducts = products.length
  const lowStock = products.filter((p) => p.stock_quantity >= 1 && p.stock_quantity < 10).length
  const outOfStock = products.filter((p) => p.stock_quantity === 0).length

  const chartData = useMemo(
    () =>
      products.map((p) => ({
        name: p.name.length > 15 ? p.name.slice(0, 15) + "…" : p.name,
        stock: p.stock_quantity,
        color: barColor(p.stock_quantity),
      })),
    [products]
  )

  const handleUpdateStock = async () => {
    if (!updateTarget || !newQty) return
    setUpdating(true)
    const result = await updateStock(
      updateTarget.id,
      updateTarget.name,
      updateTarget.stock_quantity,
      Number(newQty),
      stockNote || undefined
    )
    setUpdating(false)
    if (result.success) {
      toast.success("Stock updated")
      setUpdateTarget(null)
      setNewQty("")
      setStockNote("")
      fetchProducts()
    } else {
      toast.error(result.error || "Failed to update stock")
    }
  }

  const openHistory = async (productId: string) => {
    setHistoryProduct(productId)
    setHistoryOpen(true)
    setLoadingHistory(true)
    const data = await getStockHistory(productId)
    setHistoryData(data as StockMovement[])
    setLoadingHistory(false)
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-brand-charcoal/40">
        Loading inventory...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-charcoal">
        Inventory
      </h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-sand bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sage/15">
              <Package className="h-5 w-5 text-brand-sage" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-brand-charcoal">
                {totalProducts}
              </p>
              <p className="text-sm text-brand-charcoal/60">Total Products</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-brand-sand bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-2xl font-bold text-brand-charcoal">
                  {lowStock}
                </p>
                {lowStock > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                    {lowStock}
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-charcoal/60">Low Stock</p>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "rounded-xl border bg-white p-5",
            outOfStock > 0 ? "border-red-300" : "border-brand-sand"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display text-2xl font-bold text-brand-charcoal">
                  {outOfStock}
                </p>
                {outOfStock > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {outOfStock}
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-charcoal/60">Out of Stock</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block rounded-xl border border-brand-sand bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-sand bg-brand-mist/30 text-left text-xs font-medium uppercase text-brand-charcoal/50">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Stock Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Updated</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-brand-charcoal/40"
                  >
                    No products found
                  </td>
                </tr>
              )}
              {products.map((product, i) => {
                const status = stockStatus(product.stock_quantity)
                return (
                  <tr
                    key={product.id}
                    className={cn(
                      "border-b border-brand-sand/50 hover:bg-brand-mist/30 transition-colors",
                      i % 2 === 1 ? "bg-brand-mist/20" : "bg-white"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-brand-mist">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={resolveImageUrl(product.images[0])}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-brand-charcoal/30">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium text-brand-charcoal truncate max-w-[200px]">
                          {product.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-brand-charcoal/60">
                      {product.sku || "—"}
                    </td>
                    <td className="px-4 py-3 text-brand-charcoal/60">
                      {product.category}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("font-semibold", stockColor(product.stock_quantity))}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                          status.style
                        )}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-brand-charcoal/50">
                      {product.updated_at
                        ? format(new Date(product.updated_at), "dd MMM yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUpdateTarget(product)
                            setNewQty(product.stock_quantity.toString())
                            setStockNote("")
                          }}
                        >
                          <RefreshCw className="mr-1 h-3.5 w-3.5" />
                          Update
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openHistory(product.id)}
                        >
                          <History className="mr-1 h-3.5 w-3.5" />
                          History
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const status = stockStatus(product.stock_quantity)
          return (
            <div
              key={product.id}
              className="rounded-xl border border-brand-sand bg-white p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-brand-charcoal">
                  {product.name}
                </span>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    status.style
                  )}
                >
                  {status.label}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-brand-charcoal/60">
                  {product.category} · SKU: {product.sku || "—"}
                </span>
                <span className={cn("font-semibold", stockColor(product.stock_quantity))}>
                  Stock: {product.stock_quantity}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-h-[44px]"
                  onClick={() => {
                    setUpdateTarget(product)
                    setNewQty(product.stock_quantity.toString())
                    setStockNote("")
                  }}
                >
                  <RefreshCw className="mr-1 h-3.5 w-3.5" />
                  Update Stock
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-h-[44px]"
                  onClick={() => openHistory(product.id)}
                >
                  <History className="mr-1 h-3.5 w-3.5" />
                  History
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {products.length > 0 && (
        <div className="rounded-xl border border-brand-sand bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-brand-charcoal mb-4">
            Inventory Health
          </h2>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer
              width="100%"
              height={Math.max(300, products.length * 40)}
            >
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E8DDD4"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#6B5E54" }}
                  axisLine={{ stroke: "#E8DDD4" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11, fill: "#6B5E54" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #E8DDD4",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={24}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <Dialog
        open={!!updateTarget}
        onOpenChange={(open) => {
          if (!open) setUpdateTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              {updateTarget?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Current Stock</Label>
              <p className="mt-1 text-lg font-bold text-brand-charcoal">
                {updateTarget?.stock_quantity ?? "—"}
              </p>
            </div>
            <div>
              <Label>New Quantity</Label>
              <Input
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Textarea
                value={stockNote}
                onChange={(e) => setStockNote(e.target.value)}
                placeholder="e.g. New batch received"
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStock} disabled={updating}>
              {updating ? "Updating..." : "Update Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Stock History</SheetTitle>
            <SheetDescription>
              Movement log for this product
            </SheetDescription>
          </SheetHeader>
          <div className="pt-4 space-y-3">
            {loadingHistory && (
              <p className="text-sm text-brand-charcoal/40">Loading...</p>
            )}
            {!loadingHistory && historyData.length === 0 && (
              <p className="text-sm text-brand-charcoal/40">
                No stock movements recorded
              </p>
            )}
            {historyData.map((mov) => (
              <div
                key={mov.id}
                className="rounded-lg border border-brand-sand p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-charcoal">
                    {format(new Date(mov.created_at), "dd MMM yyyy · h:mm a")}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      mov.change_amount > 0
                        ? "text-green-600"
                        : mov.change_amount < 0
                          ? "text-red-600"
                          : "text-brand-charcoal/50"
                    )}
                  >
                    {mov.change_amount > 0 ? "+" : ""}
                    {mov.change_amount}
                  </span>
                </div>
                {mov.note && (
                  <p className="text-xs text-brand-charcoal/50">{mov.note}</p>
                )}
                <p className="text-xs text-brand-charcoal/40">
                  {mov.previous_quantity} → {mov.new_quantity}
                </p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
