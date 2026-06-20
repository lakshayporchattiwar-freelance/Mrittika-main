"use client";

import { useState, useCallback } from "react";
import { Menu, Bell, LogOut, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";

interface HeaderProps {
  userName: string;
  userEmail: string;
}

export default function Header({ userName, userEmail }: HeaderProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleLogout = async () => {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/auth/login";
  };

  return (
    <>
      <header className="flex h-[var(--header-height)] shrink-0 items-center gap-3 border-b border-brand-sand/60 bg-white/80 backdrop-blur-md px-4 lg:px-8">
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg p-2.5 text-brand-bark hover:bg-brand-mist lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <Leaf className="h-4 w-4 text-brand-sage" />
          <span className="font-display text-lg font-medium text-brand-bark">
            Dashboard
          </span>
        </div>

        <div className="flex-1" />

        <button className="relative rounded-lg p-2 text-brand-charcoal/50 hover:text-brand-terracotta hover:bg-brand-mist/60 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-terracotta ring-2 ring-white" />
        </button>

        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-brand-charcoal/50 hover:text-red-600 hover:bg-red-50/60 transition-colors min-w-[36px] min-h-[36px] items-center justify-center hidden sm:flex"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>

        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-brand-terracotta to-brand-terracotta/80 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-brand-terracotta/20 ring-2 ring-brand-terracotta/10">
          {userName.charAt(0).toUpperCase()}
        </div>
      </header>

      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={closeDrawer}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] transition-transform duration-300 ease-in-out lg:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          isMobileDrawer
          onNavigate={closeDrawer}
        />
        <button
          onClick={closeDrawer}
          className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          aria-label="Close menu"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>
      </div>
    </>
  );
}
