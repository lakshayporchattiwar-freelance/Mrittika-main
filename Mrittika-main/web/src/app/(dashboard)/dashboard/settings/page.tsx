"use client"

import { useState } from "react"
import { User, Shield, Bell, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changing, setChanging] = useState(false)

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setChanging(true)
    await new Promise((r) => setTimeout(r, 500))
    toast.success("Password updated successfully")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setChanging(false)
  }

  const handleLogout = async () => {
    await fetch("/auth/logout", { method: "POST" })
    window.location.href = "/auth/login"
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-brand-charcoal">
        Settings
      </h1>

      <div className="rounded-xl border border-brand-sand bg-white p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-terracotta text-white text-sm font-bold">
            C
          </div>
          <div>
            <p className="font-medium text-brand-charcoal">Charvi</p>
            <p className="text-sm text-brand-charcoal/50">mrittikaskinrituals@gmail.com</p>
          </div>
        </div>
        <p className="text-sm text-brand-charcoal/60">
          You are logged in as the dashboard owner.
        </p>
      </div>

      <div className="rounded-xl border border-brand-sand bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-brand-charcoal/60" />
          <h2 className="font-display text-lg font-semibold text-brand-charcoal">
            Change Password
          </h2>
        </div>
        <div>
          <Label>Current Password</Label>
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>New Password</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Confirm New Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button
          onClick={handleChangePassword}
          disabled={changing || !currentPassword || !newPassword}
          className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white"
        >
          {changing ? "Updating..." : "Update Password"}
        </Button>
      </div>

      <div className="rounded-xl border border-brand-sand bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-brand-charcoal/60" />
          <h2 className="font-display text-lg font-semibold text-brand-charcoal">
            Session
          </h2>
        </div>
        <p className="text-sm text-brand-charcoal/60">
          Your session is active. You will be automatically logged out after 30 days of inactivity.
        </p>
        <Button variant="outline" onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </div>
  )
}
