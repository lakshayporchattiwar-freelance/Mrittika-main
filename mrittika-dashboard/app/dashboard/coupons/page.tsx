"use client"

import { useState, useEffect, useMemo } from "react"
import { format, isPast, differenceInDays } from "date-fns"
import { Plus, Pencil, Trash2, Copy, AlertTriangle, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
import { upsertCoupon, deleteCoupon, toggleCouponActive, getCouponRedemptions, getCoupons } from "./actions"
import { cn } from "@/lib/utils"

interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: string
  discount_value: number
  min_order_value?: number
  max_uses?: number
  max_uses_per_user?: number
  used_count: number
  is_active: boolean
  expires_at?: string
  created_at: string
}

interface Redemption {
  id: string
  coupon_id: string
  user_email: string
  order_id: string
  created_at: string
}

const defaultForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 0,
  minOrderValue: 0,
  maxUses: 0,
  maxUsesPerUser: 0,
  expiresAt: "",
  isActive: true,
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [performance, setPerformance] = useState<Record<string, { uses: number; revenue: number }>>({})
  const [loading, setLoading] = useState(true)
  const [sum10Warning, setSum10Warning] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...defaultForm })
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)

  const [redemptionsOpen, setRedemptionsOpen] = useState(false)
  const [redemptionsCoupon, setRedemptionsCoupon] = useState<string | null>(null)
  const [redemptionsData, setRedemptionsData] = useState<Redemption[]>([])
  const [loadingRedemptions, setLoadingRedemptions] = useState(false)

  const fetchData = async () => {
    const result = await getCoupons()

    if (result.coupons) {
      setCoupons(result.coupons as Coupon[])
      setSum10Warning(!result.coupons.some((c) => c.code === "SUM10"))
    }

    if (result.performance) {
      setPerformance(result.performance)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const openCreateForm = () => {
    setEditingId(null)
    setForm({ ...defaultForm })
    setFormOpen(true)
  }

  const openEditForm = (coupon: Coupon) => {
    setEditingId(coupon.id)
    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discount_type,
      discountValue: coupon.discount_value,
      minOrderValue: coupon.min_order_value || 0,
      maxUses: coupon.max_uses || 0,
      maxUsesPerUser: coupon.max_uses_per_user || 0,
      expiresAt: coupon.expires_at ? format(new Date(coupon.expires_at), "yyyy-MM-dd'T'HH:mm") : "",
      isActive: coupon.is_active,
    })
    setFormOpen(true)
  }

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error("Coupon code is required"); return }
    setSaving(true)
    const result = await upsertCoupon({
      id: editingId || undefined,
      code: form.code.toUpperCase(),
      description: form.description || undefined,
      discount_type: form.discountType,
      discount_value: form.discountValue,
      min_order_value: form.minOrderValue || undefined,
      max_uses: form.maxUses || undefined,
      max_uses_per_user: form.maxUsesPerUser || undefined,
      is_active: form.isActive,
      expires_at: form.expiresAt || undefined,
    })
    setSaving(false)
    if (result.success) {
      toast.success(editingId ? "Coupon updated" : "Coupon created")
      setFormOpen(false)
      fetchData()
    } else {
      toast.error(result.error || "Failed to save coupon")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteCoupon(deleteId)
    setDeleting(false)
    if (result.success) {
      toast.success("Coupon deleted")
      setDeleteId(null)
      fetchData()
    } else {
      toast.error(result.error || "Failed to delete")
    }
  }

  const handleToggle = async (couponId: string, isActive: boolean) => {
    const result = await toggleCouponActive(couponId, isActive)
    if (result.success) {
      setCoupons((prev) => prev.map((c) => c.id === couponId ? { ...c, is_active: isActive } : c))
      toast.success(isActive ? "Coupon activated" : "Coupon deactivated")
    }
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Code copied")
  }

  const openRedemptions = async (couponId: string) => {
    setRedemptionsCoupon(couponId)
    setRedemptionsOpen(true)
    setLoadingRedemptions(true)
    const data = await getCouponRedemptions(couponId)
    setRedemptionsData(data as Redemption[])
    setLoadingRedemptions(false)
  }

  const addSum10 = () => {
    setEditingId(null)
    setForm({
      code: "SUM10",
      description: "10% off all products",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 0,
      maxUses: 0,
      maxUsesPerUser: 0,
      expiresAt: "",
      isActive: true,
    })
    setFormOpen(true)
  }

  const discountLabel = (c: Coupon) => {
    const val = c.discount_type === "percentage" ? `${c.discount_value}% off` : `₹${c.discount_value} off`
    const min = c.min_order_value ? ` · Min order ₹${c.min_order_value}` : ""
    return val + min
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-brand-charcoal/40">Loading coupons...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-charcoal">Coupons</h1>
        <Button onClick={openCreateForm} className="bg-brand-sage hover:bg-brand-sage/90 text-white">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {sum10Warning && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800 flex-1">
            SUM10 is active in your website code but not tracked here.
          </p>
          <Button variant="outline" size="sm" onClick={addSum10}>
            Add SUM10
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {coupons.length === 0 && (
          <div className="col-span-full rounded-xl border border-brand-sand bg-white p-12 text-center text-brand-charcoal/40">
            No coupons yet
          </div>
        )}
        {coupons.map((coupon) => {
          const perf = performance[coupon.code.toUpperCase()]
          const isExpired = coupon.expires_at ? isPast(new Date(coupon.expires_at)) : false
          const expiringSoon = coupon.expires_at && !isExpired ? differenceInDays(new Date(coupon.expires_at), new Date()) <= 7 : false
          const usagePct = coupon.max_uses ? (coupon.used_count / coupon.max_uses) * 100 : 0

          return (
            <div key={coupon.id} className="overflow-hidden rounded-xl border border-brand-sand bg-white">
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xl font-bold text-brand-terracotta">{coupon.code}</span>
                    <button onClick={() => handleCopyCode(coupon.code)} className="text-brand-charcoal/30 hover:text-brand-charcoal">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleToggle(coupon.id, !coupon.is_active)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                      coupon.is_active ? "bg-brand-sage" : "bg-brand-sand"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                        coupon.is_active ? "translate-x-[18px]" : "translate-x-[3px]"
                      )}
                    />
                  </button>
                </div>
                <p className="text-sm text-brand-charcoal/70">{coupon.description || discountLabel(coupon)}</p>
                <div>
                  <div className="flex items-center justify-between text-xs text-brand-charcoal/50 mb-1">
                    <span>{coupon.used_count} uses</span>
                    <span>{coupon.max_uses ? `of ${coupon.max_uses}` : "Unlimited"}</span>
                  </div>
                  {coupon.max_uses ? (
                    <div className="h-1.5 rounded-full bg-brand-sand">
                      <div className="h-1.5 rounded-full bg-brand-terracotta" style={{ width: `${Math.min(usagePct, 100)}%` }} />
                    </div>
                  ) : null}
                </div>
                {coupon.max_uses_per_user ? (
                  <p className="text-xs text-brand-charcoal/50">
                    Max {coupon.max_uses_per_user} use{coupon.max_uses_per_user > 1 ? "s" : ""} per user
                  </p>
                ) : null}
                {coupon.expires_at && (
                  <p className={cn("text-xs", isExpired ? "text-red-600 font-medium" : expiringSoon ? "text-amber-600 font-medium" : "text-brand-charcoal/50")}>
                    {isExpired ? "Expired" : expiringSoon ? `Expires in ${differenceInDays(new Date(coupon.expires_at), new Date())} days` : `Expires ${format(new Date(coupon.expires_at), "dd MMM yyyy")}`}
                  </p>
                )}
                {perf && (
                  <p className="text-xs text-brand-charcoal/50">
                    Revenue: ₹{perf.revenue.toLocaleString("en-IN")} ({perf.uses} orders)
                  </p>
                )}
              </div>
              <div className="flex border-t border-brand-sand px-3 py-2 gap-1">
                <Button variant="ghost" size="icon-sm" onClick={() => openRedemptions(coupon.id)}>
                  <Users className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => openEditForm(coupon)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setDeleteId(coupon.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Coupon" : "Create Coupon"}</SheetTitle>
            <SheetDescription>{editingId ? "Update coupon details" : "Create a new discount coupon"}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Coupon Code *</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                placeholder="SUMMER20"
                className="mt-1 font-mono uppercase"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="10% off all products"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Discount Type</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  type="button"
                  variant={form.discountType === "percentage" ? "default" : "outline"}
                  onClick={() => setForm((p) => ({ ...p, discountType: "percentage" }))}
                  className={cn("flex-1", form.discountType === "percentage" && "bg-brand-terracotta hover:bg-brand-terracotta/90 text-white")}
                >
                  Percentage
                </Button>
                <Button
                  type="button"
                  variant={form.discountType === "flat" ? "default" : "outline"}
                  onClick={() => setForm((p) => ({ ...p, discountType: "flat" }))}
                  className={cn("flex-1", form.discountType === "flat" && "bg-brand-terracotta hover:bg-brand-terracotta/90 text-white")}
                >
                  Flat Amount
                </Button>
              </div>
            </div>
            <div>
              <Label>Discount Value {form.discountType === "percentage" ? "(%)" : "(₹)"}</Label>
              <Input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm((p) => ({ ...p, discountValue: Number(e.target.value) }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Min Order Amount (₹)</Label>
              <Input
                type="number"
                value={form.minOrderValue}
                onChange={(e) => setForm((p) => ({ ...p, minOrderValue: Number(e.target.value) }))}
                placeholder="Optional"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Max Uses (leave blank for unlimited)</Label>
              <Input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm((p) => ({ ...p, maxUses: Number(e.target.value) }))}
                placeholder="Unlimited"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Max Uses Per User (leave blank for unlimited)</Label>
              <Input
                type="number"
                value={form.maxUsesPerUser}
                onChange={(e) => setForm((p) => ({ ...p, maxUsesPerUser: Number(e.target.value) }))}
                placeholder="Unlimited"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Expires At</Label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors",
                  form.isActive ? "bg-brand-sage" : "bg-brand-sand"
                )}
              >
                <span className={cn("inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform", form.isActive ? "translate-x-[18px]" : "translate-x-[3px]")} />
              </button>
              <Label>Active</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full bg-brand-sage hover:bg-brand-sage/90 text-white">
              {saving ? "Saving..." : "Save Coupon"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={redemptionsOpen} onOpenChange={setRedemptionsOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Coupon Usage</SheetTitle>
            <SheetDescription>Users who redeemed this coupon</SheetDescription>
          </SheetHeader>
          <div className="pt-4 space-y-3">
            {loadingRedemptions && (
              <p className="text-sm text-brand-charcoal/40">Loading...</p>
            )}
            {!loadingRedemptions && redemptionsData.length === 0 && (
              <p className="text-sm text-brand-charcoal/40">No redemptions yet</p>
            )}
            {redemptionsData.map((r) => (
              <div key={r.id} className="rounded-lg border border-brand-sand p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-brand-charcoal">{r.user_email}</span>
                  <span className="text-xs text-brand-charcoal/50">
                    {format(new Date(r.created_at), "dd MMM yyyy")}
                  </span>
                </div>
                <p className="text-xs text-brand-charcoal/50 font-mono">
                  Order: {r.order_id?.slice(0, 8) || "—"}
                </p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
