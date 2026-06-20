"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/utils/supabase/client"
import {
  Search,
  Leaf,
  Pencil,
  Trash2,
  Plus,
  X,
  ImagePlus,
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
import StatusBadge from "@/components/dashboard/StatusBadge"
import { toast } from "sonner"
import { upsertProduct, deleteProduct } from "./actions"
import { cn } from "@/lib/utils"

function resolveImageUrl(url: string): string {
  if (!url) return url
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  if (url.startsWith("/")) {
    return `${supabaseUrl}/storage/v1/object/public${url}`
  }
  return url
}

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

const categories = [
  "Face Pack",
  "Cleanser",
  "Toner",
  "Moisturizer",
  "Serum",
  "Kit",
  "Bundle",
]

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  category: "Face Pack",
  price: 0,
  comparePrice: 0,
  sku: "",
  stockQuantity: 0,
  status: "Active",
  featured: false,
  images: [] as string[],
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...defaultForm })
  const [newImageUrl, setNewImageUrl] = useState("")
  const [saving, setSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchProducts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setProducts(data as Product[])
    setLoading(false)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase()
      if (q && !p.name.toLowerCase().includes(q)) return false
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false
      if (statusFilter !== "All" && p.status !== statusFilter) return false
      return true
    })
  }, [products, search, categoryFilter, statusFilter])

  const openAddForm = () => {
    setEditingId(null)
    setForm({ ...defaultForm })
    setFormOpen(true)
  }

  const openEditForm = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      category: product.category,
      price: product.price,
      comparePrice: product.compare_price || 0,
      sku: product.sku || "",
      stockQuantity: product.stock_quantity,
      status: product.status,
      featured: product.featured || false,
      images: product.images || [],
    })
    setFormOpen(true)
  }

  const handleNameChange = (name: string) => {
    setForm((prev) => {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
      return { ...prev, name, slug: editingId ? prev.slug : slug }
    })
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Product name is required")
      return
    }
    setSaving(true)
    const result = await upsertProduct({
      id: editingId || undefined,
      name: form.name,
      slug: form.slug,
      description: form.description || undefined,
      category: form.category,
      price: form.price,
      compare_price: form.comparePrice || undefined,
      sku: form.sku || undefined,
      stock_quantity: form.stockQuantity,
      status: form.status,
      featured: form.featured,
      images: form.images,
    })
    setSaving(false)
    if (result.success) {
      toast.success(editingId ? "Product updated" : "Product created")
      setFormOpen(false)
      fetchProducts()
    } else {
      toast.error(result.error || "Failed to save product")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const result = await deleteProduct(deleteId)
    setDeleting(false)
    if (result.success) {
      toast.success("Product deleted")
      setDeleteId(null)
      fetchProducts()
    } else {
      toast.error(result.error || "Failed to delete product")
    }
  }

  const addImageUrl = () => {
    if (newImageUrl.trim()) {
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }))
      setNewImageUrl("")
    }
  }

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }))
  }

  const stockColor = (qty: number) => {
    if (qty < 5) return "text-red-600"
    if (qty < 20) return "text-amber-600"
    return "text-green-600"
  }

  const productStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Draft":
        return "bg-gray-100 text-gray-600"
      case "Out of Stock":
        return "bg-red-100 text-red-700"
      default:
        return "bg-brand-sand/50 text-brand-charcoal/60"
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-brand-charcoal/40">
        Loading products...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-charcoal">
          Products
        </h1>
        <Button
          onClick={openAddForm}
          className="bg-brand-sage hover:bg-brand-sage/90 text-white"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-charcoal/40" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-brand-sand bg-white p-12 text-center text-brand-charcoal/40">
            No products found
          </div>
        )}
        {filtered.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-xl border border-brand-sand bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square bg-brand-mist">
              {product.images && product.images.length > 0 ? (
                <img
                  src={resolveImageUrl(product.images[0])}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-brand-charcoal/30">
                  <Leaf className="h-12 w-12" />
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-display font-medium text-brand-charcoal truncate">
                {product.name}
              </h3>
              <span className="inline-flex rounded-full bg-brand-mist px-2 py-0.5 text-xs text-brand-charcoal/60">
                {product.category}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-brand-charcoal">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.compare_price && product.compare_price > product.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{product.compare_price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("text-sm font-medium", stockColor(product.stock_quantity))}>
                  Stock: {product.stock_quantity}
                </span>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    productStatusColor(product.status)
                  )}
                >
                  {product.status}
                </span>
              </div>
            </div>
            <div className="flex border-t border-brand-sand px-2 py-1.5 gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => openEditForm(product)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteId(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Sheet open={formOpen} onOpenChange={setFormOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editingId ? "Edit Product" : "Add Product"}</SheetTitle>
            <SheetDescription>
              {editingId ? "Update product details" : "Fill in product information"}
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>Product Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Product name"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                placeholder="product-slug"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => v && setForm((p) => ({ ...p, category: v }))}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Product description"
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Compare Price (₹)</Label>
                <Input
                  type="number"
                  value={form.comparePrice}
                  onChange={(e) => setForm((p) => ({ ...p, comparePrice: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>SKU</Label>
                <Input
                  value={form.sku}
                  onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                  placeholder="SKU-001"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={form.stockQuantity}
                  onChange={(e) => setForm((p) => ({ ...p, stockQuantity: Number(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => v && setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                className="h-4 w-4 rounded border-brand-sand accent-brand-terracotta"
              />
              <Label>Featured Product</Label>
            </div>
            <div>
              <Label>Images</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={resolveImageUrl(url)}
                      alt={`Image ${idx + 1}`}
                      className="h-16 w-16 rounded-lg border border-brand-sand object-cover"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste image URL"
                  className="flex-1"
                />
                <Button variant="outline" onClick={addImageUrl} type="button">
                  <ImagePlus className="mr-1 h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-brand-sage hover:bg-brand-sage/90 text-white"
            >
              {saving ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
