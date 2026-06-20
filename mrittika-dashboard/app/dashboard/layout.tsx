import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import RealtimeNotifications from "@/components/dashboard/RealtimeNotifications"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const session = cookieStore.get("mrittika_session")

  if (session?.value !== "authenticated") {
    redirect("/auth/login")
  }

  const userName = "Charvi"
  const userEmail = "mrittikaskinrituals@gmail.com"

  return (
    <div className="flex h-screen overflow-hidden grain-overlay">
      <Sidebar userName={userName} userEmail={userEmail} />
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-[var(--sidebar-width)]">
        <Header userName={userName} userEmail={userEmail} />
        <main className="relative flex-1 overflow-y-auto bg-brand-cream p-4 lg:p-8 overscroll-contain safe-bottom">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-sage/[0.03] blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-brand-terracotta/[0.03] blur-3xl pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
      <RealtimeNotifications />
    </div>
  )
}
