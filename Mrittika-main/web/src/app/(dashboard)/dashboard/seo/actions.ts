"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateSeoPage(data: {
  page_path: string
  seo_title?: string
  seo_description?: string
  og_title?: string
  og_description?: string
}) {
  const { error } = await adminSupabase
    .from("seo_pages")
    .update({
      seo_title: data.seo_title || null,
      seo_description: data.seo_description || null,
      og_title: data.og_title || null,
      og_description: data.og_description || null,
      last_updated: new Date().toISOString(),
    })
    .eq("page_path", data.page_path)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/seo")
  return { success: true }
}
