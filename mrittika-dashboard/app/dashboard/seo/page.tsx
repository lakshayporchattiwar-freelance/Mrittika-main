"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { ChevronDown, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateSeoPage } from "./actions"
import { cn } from "@/lib/utils"

interface SeoPage {
  id: string
  page_path: string
  page_name: string
  seo_title?: string
  seo_description?: string
  og_image?: string
  og_title?: string
  og_description?: string
  last_updated?: string
}

const tips = [
  "Add alt text to all product images for better image search visibility",
  "Each product page needs a unique meta description that includes the product name and key benefit",
  "Publish at least 2 blog posts per month — Google favors fresh skincare content",
  "Your homepage OG image should be 1200×630px for best appearance when shared on Instagram and WhatsApp",
  "Add your location (Nagpur, India) to your About page meta for local search visibility",
]

export default function SeoManagementPage() {
  const [pages, setPages] = useState<SeoPage[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedPage, setExpandedPage] = useState<string | null>(null)
  const [edits, setEdits] = useState<Record<string, { seo_title: string; seo_description: string; og_title: string; og_description: string }>>({})
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("seo_pages")
      .select("*")
      .order("page_path")
      .then(({ data }) => {
        if (data) {
          setPages(data as SeoPage[])
          const initialEdits: Record<string, { seo_title: string; seo_description: string; og_title: string; og_description: string }> = {}
          for (const p of data as SeoPage[]) {
            initialEdits[p.page_path] = {
              seo_title: p.seo_title || "",
              seo_description: p.seo_description || "",
              og_title: p.og_title || "",
              og_description: p.og_description || "",
            }
          }
          setEdits(initialEdits)
        }
        setLoading(false)
      })
  }, [])

  const isOptimized = (p: SeoPage) => !!(p.seo_title && p.seo_description && p.og_image)
  const optimizedCount = pages.filter(isOptimized).length
  const healthPct = pages.length > 0 ? (optimizedCount / pages.length) * 100 : 0

  const handleSave = async (pagePath: string) => {
    const edit = edits[pagePath]
    if (!edit) return
    setSaving(pagePath)
    const result = await updateSeoPage({
      page_path: pagePath,
      seo_title: edit.seo_title,
      seo_description: edit.seo_description,
      og_title: edit.og_title,
      og_description: edit.og_description,
    })
    setSaving(null)
    if (result.success) {
      toast.success("SEO settings saved")
      setPages((prev) =>
        prev.map((p) =>
          p.page_path === pagePath
            ? { ...p, seo_title: edit.seo_title, seo_description: edit.seo_description, og_title: edit.og_title, og_description: edit.og_description, last_updated: new Date().toISOString() }
            : p
        )
      )
    } else {
      toast.error(result.error || "Failed to save")
    }
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-brand-charcoal/40">Loading SEO data...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-brand-charcoal">SEO Management</h1>

      <div className="rounded-xl border border-brand-sand bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-display text-lg font-semibold text-brand-charcoal">SEO Health Score</p>
            <p className="text-sm text-brand-charcoal/60">{optimizedCount} of {pages.length} pages optimized</p>
          </div>
          <span className="font-display text-3xl font-bold text-brand-terracotta">{Math.round(healthPct)}%</span>
        </div>
        <div className="h-3 rounded-full bg-brand-sand">
          <div className="h-3 rounded-full bg-brand-terracotta transition-all" style={{ width: `${healthPct}%` }} />
        </div>
      </div>

      <div className="space-y-3">
        {pages.map((page) => {
          const optimized = isOptimized(page)
          const expanded = expandedPage === page.page_path
          const edit = edits[page.page_path]

          return (
            <div key={page.id} className="rounded-xl border border-brand-sand bg-white overflow-hidden">
              <button
                onClick={() => setExpandedPage(expanded ? null : page.page_path)}
                className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-brand-mist/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {optimized ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium text-brand-charcoal">{page.page_name}</p>
                    <p className="text-xs text-brand-charcoal/40">{page.page_path}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", optimized ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                    {optimized ? "Optimized" : "Needs Attention"}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 text-brand-charcoal/40 transition-transform", expanded && "rotate-180")} />
                </div>
              </button>

              {expanded && edit && (
                <div className="border-t border-brand-sand px-5 py-4 space-y-4">
                  <div>
                    <Label>SEO Title ({edit.seo_title.length}/60)</Label>
                    <Input
                      value={edit.seo_title}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [page.page_path]: { ...prev[page.page_path], seo_title: e.target.value } }))}
                      placeholder="Page title for search engines"
                      className={cn("mt-1", edit.seo_title.length > 60 && "border-red-400", edit.seo_title.length > 55 && edit.seo_title.length <= 60 && "border-amber-400")}
                    />
                  </div>
                  <div>
                    <Label>Meta Description ({edit.seo_description.length}/160)</Label>
                    <Textarea
                      value={edit.seo_description}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [page.page_path]: { ...prev[page.page_path], seo_description: e.target.value } }))}
                      placeholder="Brief description for search results"
                      className={cn("mt-1", edit.seo_description.length > 160 && "border-red-400", edit.seo_description.length > 140 && edit.seo_description.length <= 160 && "border-amber-400")}
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>OG Title</Label>
                    <Input
                      value={edit.og_title}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [page.page_path]: { ...prev[page.page_path], og_title: e.target.value } }))}
                      placeholder="Title when shared on social media"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>OG Description</Label>
                    <Textarea
                      value={edit.og_description}
                      onChange={(e) => setEdits((prev) => ({ ...prev, [page.page_path]: { ...prev[page.page_path], og_description: e.target.value } }))}
                      placeholder="Description when shared on social media"
                      className="mt-1"
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={() => handleSave(page.page_path)}
                    disabled={saving === page.page_path}
                    className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white"
                  >
                    {saving === page.page_path ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-brand-sand bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-brand-gold" />
          <h2 className="font-display text-lg font-semibold text-brand-charcoal">SEO Tips for Mrittika</h2>
        </div>
        <ul className="space-y-3">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-brand-charcoal/70">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-gold/15 text-[10px] font-bold text-brand-gold">
                {idx + 1}
              </span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
