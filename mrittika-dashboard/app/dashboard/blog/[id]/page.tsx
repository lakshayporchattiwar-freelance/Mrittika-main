"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { upsertPost } from "../actions"
import { cn } from "@/lib/utils"
import { Eye, Edit3 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

function simpleMarkdown(text: string) {
  return text
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />")
}

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    category: "Skincare",
    tags: "",
    status: "draft",
    featured_image: "",
    seo_title: "",
    seo_description: "",
    published_at: "",
  })
  const [previewMode, setPreviewMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            title: data.title || "",
            slug: data.slug || "",
            content: data.content || "",
            excerpt: data.excerpt || "",
            category: data.category || "Skincare",
            tags: data.tags ? data.tags.join(", ") : "",
            status: data.status || "draft",
            featured_image: data.featured_image || "",
            seo_title: data.seo_title || "",
            seo_description: data.seo_description || "",
            published_at: data.published_at || "",
          })
        }
        setLoading(false)
      })
  }, [id])

  const handleSave = async (status: string) => {
    if (!form.title.trim()) { toast.error("Title is required"); return }
    setSaving(true)
    const result = await upsertPost({
      id,
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt || undefined,
      content: form.content || undefined,
      category: form.category,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      status,
      featured_image: form.featured_image || undefined,
      seo_title: form.seo_title || undefined,
      seo_description: form.seo_description || undefined,
      published_at: form.published_at || (status === "published" ? new Date().toISOString() : undefined),
    })
    setSaving(false)
    if (result.success) {
      toast.success(status === "published" ? "Post published!" : "Draft saved!")
      router.push("/dashboard/blog")
    } else {
      toast.error(result.error || "Failed to save")
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-brand-charcoal/40">Loading post...</div>
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0 lg:w-[65%]">
        <Input
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          placeholder="Post title..."
          className="font-display text-2xl font-bold border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 placeholder:text-brand-charcoal/20"
        />
        <div className="flex items-center gap-2 my-4">
          <Button variant={previewMode ? "outline" : "default"} size="sm" onClick={() => setPreviewMode(false)} className={cn(!previewMode && "bg-brand-terracotta text-white")}>
            <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
          <Button variant={previewMode ? "default" : "outline"} size="sm" onClick={() => setPreviewMode(true)} className={cn(previewMode && "bg-brand-terracotta text-white")}>
            <Eye className="mr-1 h-3.5 w-3.5" /> Preview
          </Button>
        </div>
        {previewMode ? (
          <div
            className="prose prose-sm max-w-none rounded-xl border border-brand-sand bg-white p-6 min-h-[500px]"
            dangerouslySetInnerHTML={{ __html: simpleMarkdown(form.content || "") }}
          />
        ) : (
          <Textarea
            value={form.content}
            onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
            placeholder="Write your post content... (supports markdown)"
            className="min-h-[500px] font-mono text-sm border-0 bg-white shadow-none focus-visible:ring-0 resize-none"
          />
        )}
      </div>

      <div className="lg:w-[35%] space-y-4 lg:sticky lg:top-8 lg:self-start">
        <div className="rounded-xl border border-brand-sand bg-white p-5 space-y-4">
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} className="mt-1 font-mono text-sm" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => v && setForm((p) => ({ ...p, category: v }))}>
              <SelectTrigger className="w-full mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Skincare">Skincare</SelectItem>
                <SelectItem value="Wellness">Wellness</SelectItem>
                <SelectItem value="Ingredients">Ingredients</SelectItem>
                <SelectItem value="Routine">Routine</SelectItem>
                <SelectItem value="Tips">Tips</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tags (comma-separated)</Label>
            <Input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} className="mt-1" />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Textarea value={form.excerpt} onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))} className="mt-1" rows={2} />
          </div>
          <div>
            <Label>Featured Image URL</Label>
            <Input value={form.featured_image} onChange={(e) => setForm((p) => ({ ...p, featured_image: e.target.value }))} className="mt-1" />
            {form.featured_image && (
              <img src={form.featured_image} alt="Preview" className="mt-2 h-24 w-full rounded-lg object-cover" />
            )}
          </div>
          <div>
            <Label>SEO Title ({form.seo_title.length}/60)</Label>
            <Input
              value={form.seo_title}
              onChange={(e) => setForm((p) => ({ ...p, seo_title: e.target.value }))}
              className={cn("mt-1", form.seo_title.length > 60 && "border-red-400")}
            />
          </div>
          <div>
            <Label>SEO Description ({form.seo_description.length}/160)</Label>
            <Textarea
              value={form.seo_description}
              onChange={(e) => setForm((p) => ({ ...p, seo_description: e.target.value }))}
              className={cn("mt-1", form.seo_description.length > 160 && "border-red-400")}
              rows={2}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => handleSave("draft")} disabled={saving}>
              Save as Draft
            </Button>
            <Button className="flex-1 bg-brand-sage hover:bg-brand-sage/90 text-white" onClick={() => handleSave("published")} disabled={saving}>
              Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
