"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/utils/supabase/client"
import { format } from "date-fns"
import { Plus, Pencil, Trash2, ExternalLink, Search } from "lucide-react"
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
import Link from "next/link"
import { toast } from "sonner"
import { deletePost } from "./actions"
import { cn } from "@/lib/utils"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  category: string
  status: string
  featured_image?: string
  published_at?: string
  created_at: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setPosts(data as BlogPost[])
        setLoading(false)
      })
  }, [])

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const q = search.toLowerCase()
      if (q && !p.title.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) return false
      if (statusFilter !== "All" && p.status !== statusFilter.toLowerCase()) return false
      return true
    })
  }, [posts, search, statusFilter])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    const result = await deletePost(deleteId)
    setDeleting(false)
    if (result.success) {
      toast.success("Post deleted")
      setDeleteId(null)
      setPosts((prev) => prev.filter((p) => p.id !== deleteId))
    } else {
      toast.error(result.error || "Failed to delete")
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-brand-charcoal/40">Loading posts...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-charcoal">Blog</h1>
        <Link href="/dashboard/blog/new">
          <Button className="bg-brand-sage hover:bg-brand-sage/90 text-white">
            <Plus className="mr-1.5 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-charcoal/40" />
          <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block rounded-xl border border-brand-sand bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-sand bg-brand-mist/30 text-left text-xs font-medium uppercase text-brand-charcoal/50">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-brand-charcoal/40">No posts found</td>
                </tr>
              )}
              {filtered.map((post, i) => (
                <tr key={post.id} className={cn("border-b border-brand-sand/50 hover:bg-brand-mist/30 transition-colors", i % 2 === 1 ? "bg-brand-mist/20" : "bg-white")}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-charcoal">{post.title}</p>
                    <p className="text-xs text-brand-charcoal/40">{post.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-brand-charcoal/60">{post.category}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", post.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                      {post.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-brand-charcoal/50">
                    {post.published_at ? format(new Date(post.published_at), "dd MMM yyyy") : "Draft"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/blog/${post.id}`}>
                        <Button variant="ghost" size="icon-sm"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      {post.status === "published" && (
                        <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon-sm"><ExternalLink className="h-4 w-4" /></Button>
                        </a>
                      )}
                      <Button variant="ghost" size="icon-sm" className="text-destructive" onClick={() => setDeleteId(post.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {filtered.map((post) => (
          <div key={post.id} className="rounded-xl border border-brand-sand bg-white p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-brand-charcoal">{post.title}</p>
                <p className="text-xs text-brand-charcoal/40">{post.slug}</p>
              </div>
              <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", post.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                {post.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/blog/${post.id}`}>
                <Button variant="outline" size="sm"><Pencil className="mr-1 h-3.5 w-3.5" />Edit</Button>
              </Link>
              <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteId(post.id)}>
                <Trash2 className="mr-1 h-3.5 w-3.5" />Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>Are you sure? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
