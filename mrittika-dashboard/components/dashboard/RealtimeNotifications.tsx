"use client"

import { useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { toast } from "sonner"

interface RealtimeNotificationsProps {
  onNewOrder?: () => void
  onNewLead?: () => void
}

export default function RealtimeNotifications({
  onNewOrder,
  onNewLead,
}: RealtimeNotificationsProps) {
  useEffect(() => {
    const supabase = createClient()

    const ordersChannel = supabase
      .channel("new-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as Record<string, unknown>
          toast.success(
            `New order from ${order.customer_name || "a customer"}! 🎉`
          )
          onNewOrder?.()
        }
      )
      .subscribe()

    const leadsChannel = supabase
      .channel("new-leads-rt")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          const lead = payload.new as Record<string, unknown>
          toast.info(
            `New inquiry from ${lead.name || "someone"}! 💬`
          )
          onNewLead?.()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(leadsChannel)
    }
  }, [onNewOrder, onNewLead])

  return null
}
