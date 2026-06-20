"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function upsertPost(post: {
  id?: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  category?: string
  tags?: string[]
  status?: string
  featured_image?: string
  seo_title?: string
  seo_description?: string
  published_at?: string
}) {
  const row: Record<string, unknown> = {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || null,
    content: post.content || null,
    category: post.category || "Skincare",
    tags: post.tags || [],
    status: post.status || "draft",
    featured_image: post.featured_image || null,
    seo_title: post.seo_title || null,
    seo_description: post.seo_description || null,
    updated_at: new Date().toISOString(),
  }

  if (post.status === "published" && !post.published_at && !post.id) {
    row.published_at = new Date().toISOString()
  }
  if (post.published_at) {
    row.published_at = post.published_at
  }

  let error
  if (post.id) {
    ;({ error } = await adminSupabase
      .from("blog_posts")
      .update(row)
      .eq("id", post.id))
  } else {
    ;({ error } = await adminSupabase.from("blog_posts").insert(row))
  }

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/blog")
  return { success: true }
}

export async function deletePost(postId: string) {
  const { error } = await adminSupabase
    .from("blog_posts")
    .delete()
    .eq("id", postId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/blog")
  return { success: true }
}
