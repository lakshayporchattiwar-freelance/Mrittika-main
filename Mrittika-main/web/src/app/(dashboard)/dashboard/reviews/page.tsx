"use client"

import { useState, useEffect, useMemo } from "react"
import { Star, Trash2, ShieldCheck, ShieldOff, Plus, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { getReviews, verifyReview, unverifyReview, deleteReview, addReview } from "./actions"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  product_slug: string
  name: string
  rating: number
  comment: string
  verified: boolean
  created_at: string
}

const productSlugs = [
  { value: "ubtan-mix-face-pack", label: "Ubtan Mix Face Pack" },
  { value: "soft-glow-face-pack", label: "Soft Glow Face Pack" },
  { value: "oil-control-face-pack", label: "Oil Control Face Pack" },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function slugToName(slug: string) {
  const found = productSlugs.find((p) => p.value === slug)
  return found?.label || slug
}

const defaultForm = {
  productSlug: "",
  name: "",
  rating: 5,
  comment: "",
  verified: true,
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "verified" | "unverified">("all")
  const [filterSlug, setFilterSlug] = useState<string>("all")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  const fetchReviews = async () => {
    setLoading(true)
    const data = await getReviews()
    setReviews(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (filter === "verified" && !r.verified) return false
      if (filter === "unverified" && r.verified) return false
      if (filterSlug !== "all" && r.product_slug !== filterSlug) return false
      return true
    })
  }, [reviews, filter, filterSlug])

  const handleVerify = async (id: string, currentlyVerified: boolean) => {
    const result = currentlyVerified ? await unverifyReview(id) : await verifyReview(id)
    if (result.success) {
      toast.success(currentlyVerified ? "Review unverified" : "Review verified")
      fetchReviews()
    } else {
      toast.error(result.error || "Failed to update")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const result = await deleteReview(deleteId)
    if (result.success) {
      toast.success("Review deleted")
      fetchReviews()
    } else {
      toast.error(result.error || "Failed to delete")
    }
    setDeleteId(null)
  }

  const handleAdd = async () => {
    if (!form.productSlug || !form.name.trim() || !form.comment.trim()) {
      toast.error("Please fill all fields")
      return
    }
    setSaving(true)
    const result = await addReview(form)
    if (result.success) {
      toast.success("Review added")
      setShowAdd(false)
      setForm(defaultForm)
      fetchReviews()
    } else {
      toast.error(result.error || "Failed to add review")
    }
    setSaving(false)
  }

  const stats = useMemo(() => {
    const total = reviews.length
    const verified = reviews.filter((r) => r.verified).length
    const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : "0"
    return { total, verified, avg }
  }, [reviews])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-charcoal">Reviews</h1>
          <p className="text-sm text-brand-charcoal/60 mt-1">Manage customer reviews and mark as verified</p>
        </div>
        <Button onClick={() => setShowAdd(true)} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Review
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-charcoal/60">Total Reviews</p>
          <p className="text-2xl font-bold text-brand-charcoal">{stats.total}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-charcoal/60">Verified</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.verified}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-brand-charcoal/60">Average Rating</p>
          <p className="text-2xl font-bold text-brand-charcoal">{stats.avg} ★</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1 bg-white rounded-lg border p-1">
          {(["all", "verified", "unverified"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                filter === f ? "bg-brand-terracotta text-white" : "text-brand-charcoal/60 hover:bg-stone-100"
              )}
            >
              {f === "all" ? "All" : f === "verified" ? "Verified" : "Unverified"}
            </button>
          ))}
        </div>
        <select
          value={filterSlug}
          onChange={(e) => setFilterSlug(e.target.value)}
          className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-brand-charcoal/80 focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
        >
          <option value="all">All Products</option>
          {productSlugs.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-brand-charcoal/50">Loading reviews...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="h-10 w-10 mx-auto text-brand-charcoal/20 mb-3" />
          <p className="text-brand-charcoal/50">No reviews found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-brand-charcoal">{review.name}</span>
                    {review.verified && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="h-3 w-3" /> Verified
                      </span>
                    )}
                    <span className="text-xs text-brand-charcoal/40">{slugToName(review.product_slug)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-3.5 w-3.5",
                          s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
                        )}
                      />
                    ))}
                    <span className="text-xs text-brand-charcoal/40 ml-1">{formatDate(review.created_at)}</span>
                  </div>
                  <p className="text-sm text-brand-charcoal/70 mt-2">{review.comment}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleVerify(review.id, review.verified)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                      review.verified
                        ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    )}
                    title={review.verified ? "Remove verified badge" : "Mark as verified purchase"}
                  >
                    {review.verified ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    {review.verified ? "Unverify" : "Verify"}
                  </button>
                  <button
                    onClick={() => setDeleteId(review.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>This action cannot be undone. The review will be permanently deleted.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={showAdd} onOpenChange={setShowAdd}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Review</SheetTitle>
            <SheetDescription>Add a review on behalf of a customer. Mark as verified if they purchased the product.</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <div>
              <Label>Product *</Label>
              <select
                value={form.productSlug}
                onChange={(e) => setForm((f) => ({ ...f, productSlug: e.target.value }))}
                className="w-full mt-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30"
              >
                <option value="">Select product</option>
                {productSlugs.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Customer Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sneha R."
                className="mt-1"
              />
            </div>
            <div>
              <Label>Rating *</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, rating: s }))}
                  >
                    <Star
                      className={cn(
                        "h-7 w-7 transition-colors",
                        s <= form.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200 hover:fill-amber-200"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Comment *</Label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Write the review comment..."
                rows={4}
                className="w-full mt-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-terracotta/30 resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verified"
                checked={form.verified}
                onChange={(e) => setForm((f) => ({ ...f, verified: e.target.checked }))}
                className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="verified" className="text-sm font-normal">
                Mark as Verified Purchase
              </Label>
            </div>
            <Button
              onClick={handleAdd}
              disabled={saving || !form.productSlug || !form.name.trim() || !form.comment.trim()}
              className="w-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white"
            >
              {saving ? "Adding..." : "Add Review"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
