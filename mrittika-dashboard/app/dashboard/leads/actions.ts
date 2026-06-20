"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateLeadStatus(leadId: string, newStatus: string) {
  const { error } = await adminSupabase
    .from("leads")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", leadId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/leads")
  return { success: true }
}

export async function updateLead(
  leadId: string,
  data: {
    name?: string
    email?: string
    phone?: string
    message?: string
    source?: string
    status?: string
    notes?: string
  }
) {
  const { error } = await adminSupabase
    .from("leads")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", leadId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/leads")
  return { success: true }
}

export async function addLead(data: {
  name: string
  email?: string
  phone?: string
  message?: string
  source?: string
}) {
  const { error } = await adminSupabase.from("leads").insert(data)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/leads")
  return { success: true }
}
