"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { formatDistanceToNow, parseISO } from "date-fns"
import { Plus, MoreHorizontal, Phone, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { toast } from "sonner"
import { updateLeadStatus, updateLead, addLead } from "./actions"
import { cn } from "@/lib/utils"

interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  message?: string
  source: string
  status: string
  notes?: string
  created_at: string
  updated_at?: string
}

const columns = [
  { key: "New", label: "New", bg: "bg-blue-100", text: "text-blue-700", headerBg: "bg-blue-50" },
  { key: "Contacted", label: "Contacted", bg: "bg-amber-100", text: "text-amber-700", headerBg: "bg-amber-50" },
  { key: "Converted", label: "Converted", bg: "bg-green-100", text: "text-green-700", headerBg: "bg-green-50" },
  { key: "Closed", label: "Closed", bg: "bg-gray-100", text: "text-gray-600", headerBg: "bg-gray-50" },
]

const sourceStyles: Record<string, string> = {
  contact_form: "bg-blue-100 text-blue-700",
  whatsapp: "bg-green-100 text-green-700",
  instagram: "bg-purple-100 text-purple-700",
  manual: "bg-gray-100 text-gray-600",
}

const sourceLabels: Record<string, string> = {
  contact_form: "Contact Form",
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  manual: "Manual",
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ name: "", email: "", phone: "", message: "", source: "manual" })

  const [editLead, setEditLead] = useState<Lead | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [editNotes, setEditNotes] = useState("")
  const [editStatus, setEditStatus] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setLeads(data as Lead[])
        setLoading(false)
      })

    const channel = supabase
      .channel("leads-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          setLeads((prev) => [payload.new as Lead, ...prev])
          toast.success("New lead from " + (payload.new as Lead).name)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const result = await updateLeadStatus(leadId, newStatus)
    if (result.success) {
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      )
      toast.success(`Lead moved to ${newStatus}`)
    } else {
      toast.error(result.error || "Failed to update status")
    }
  }

  const handleAddLead = async () => {
    if (!addForm.name.trim()) {
      toast.error("Name is required")
      return
    }
    const result = await addLead(addForm)
    if (result.success) {
      toast.success("Lead added")
      setAddOpen(false)
      setAddForm({ name: "", email: "", phone: "", message: "", source: "manual" })
      const supabase = createClient()
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false })
      if (data) setLeads(data as Lead[])
    } else {
      toast.error(result.error || "Failed to add lead")
    }
  }

  const handleEditSave = async () => {
    if (!editLead) return
    const result = await updateLead(editLead.id, {
      status: editStatus,
      notes: editNotes,
    })
    if (result.success) {
      setLeads((prev) =>
        prev.map((l) =>
          l.id === editLead.id ? { ...l, status: editStatus, notes: editNotes } : l
        )
      )
      toast.success("Lead updated")
      setEditOpen(false)
    } else {
      toast.error(result.error || "Failed to update lead")
    }
  }

  const openEditSheet = (lead: Lead) => {
    setEditLead(lead)
    setEditNotes(lead.notes || "")
    setEditStatus(lead.status)
    setEditOpen(true)
  }

  const totalCounts = {
    New: leads.filter((l) => l.status === "New").length,
    Contacted: leads.filter((l) => l.status === "Contacted").length,
    Converted: leads.filter((l) => l.status === "Converted").length,
    Closed: leads.filter((l) => l.status === "Closed").length,
  }
  const totalLeads = leads.length || 1

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-brand-charcoal/40">
        Loading leads...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-brand-charcoal">
          Leads & Inquiries
        </h1>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-brand-sage hover:bg-brand-sage/90 text-white"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Lead Manually
        </Button>
      </div>

      <div className="rounded-xl border border-brand-sand bg-white p-4">
        <p className="text-sm font-medium text-brand-charcoal mb-3">Lead Conversion Funnel</p>
        <div className="flex items-center gap-1 h-8 rounded-lg overflow-hidden">
          {columns.map((col) => {
            const count = totalCounts[col.key as keyof typeof totalCounts]
            const pct = (count / totalLeads) * 100
            return (
              <div
                key={col.key}
                className={cn("flex items-center justify-center text-xs font-medium", col.bg, col.text)}
                style={{ width: `${Math.max(pct, 5)}%` }}
                title={`${col.label}: ${count} (${Math.round(pct)}%)`}
              >
                {col.label} {count}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colLeads = leads.filter((l) => l.status === col.key)
          return (
            <div key={col.key} className="min-w-[280px] flex-1">
              <div className={cn("rounded-t-xl px-4 py-3", col.headerBg)}>
                <div className="flex items-center justify-between">
                  <span className={cn("text-sm font-semibold", col.text)}>{col.label}</span>
                  <span className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold", col.bg, col.text)}>
                    {colLeads.length}
                  </span>
                </div>
              </div>
              <div className="space-y-2 rounded-b-xl border border-t-0 border-brand-sand bg-brand-mist/30 p-2 max-h-[60vh] overflow-y-auto">
                {colLeads.length === 0 && (
                  <p className="py-4 text-center text-xs text-brand-charcoal/40">No leads</p>
                )}
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-brand-sand bg-white p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <p className="font-medium text-sm text-brand-charcoal">{lead.name}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="rounded p-1 text-brand-charcoal/40 hover:text-brand-charcoal">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openEditSheet(lead)}>
                            View & Edit
                          </DropdownMenuItem>
                          {lead.status !== "Contacted" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "Contacted")}>
                              Mark as Contacted
                            </DropdownMenuItem>
                          )}
                          {lead.status !== "Converted" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "Converted")}>
                              Mark as Converted
                            </DropdownMenuItem>
                          )}
                          {lead.status !== "Closed" && (
                            <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "Closed")}>
                              Mark as Closed
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium", sourceStyles[lead.source] || sourceStyles.manual)}>
                      {sourceLabels[lead.source] || lead.source}
                    </span>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 text-xs text-brand-terracotta hover:underline"
                      >
                        <Phone className="h-3 w-3" />
                        {lead.phone}
                      </a>
                    )}
                    {lead.message && (
                      <p className="text-xs text-brand-charcoal/50 line-clamp-2">
                        {lead.message.length > 80 ? lead.message.slice(0, 80) + "..." : lead.message}
                      </p>
                    )}
                    <p className="text-[10px] text-brand-charcoal/40">
                      {formatDistanceToNow(parseISO(lead.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Lead Manually</DialogTitle>
            <DialogDescription>Enter the lead details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name *</Label>
              <Input
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={addForm.email}
                onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={addForm.phone}
                onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={addForm.message}
                onChange={(e) => setAddForm((p) => ({ ...p, message: e.target.value }))}
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label>Source</Label>
              <Select value={addForm.source} onValueChange={(v) => v && setAddForm((p) => ({ ...p, source: v }))}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact_form">Contact Form</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddLead}>Add Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit Lead</SheetTitle>
            <SheetDescription>{editLead?.name}</SheetDescription>
          </SheetHeader>
          {editLead && (
            <div className="space-y-4 pt-4">
              <div className="space-y-1 text-sm">
                <p><span className="text-brand-charcoal/50">Name:</span> {editLead.name}</p>
                <p><span className="text-brand-charcoal/50">Email:</span> {editLead.email || "—"}</p>
                <p><span className="text-brand-charcoal/50">Phone:</span> {editLead.phone || "—"}</p>
                <p><span className="text-brand-charcoal/50">Source:</span> {sourceLabels[editLead.source] || editLead.source}</p>
                <p><span className="text-brand-charcoal/50">Date:</span> {formatDistanceToNow(parseISO(editLead.created_at), { addSuffix: true })}</p>
              </div>
              {editLead.message && (
                <div>
                  <Label>Message</Label>
                  <p className="mt-1 text-sm text-brand-charcoal/70 rounded-lg border border-brand-sand p-3">{editLead.message}</p>
                </div>
              )}
              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={(v) => v && setEditStatus(v)}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Converted">Converted</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Internal notes about this lead..."
                  className="mt-1"
                  rows={3}
                />
              </div>
              <Button onClick={handleEditSave} className="w-full bg-brand-terracotta hover:bg-brand-terracotta/90 text-white">
                Save Changes
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
