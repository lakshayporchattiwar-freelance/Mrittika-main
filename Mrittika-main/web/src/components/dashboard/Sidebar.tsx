"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Archive,
  Users,
  MessageCircle,
  Tag,
  BarChart3,
  BookOpen,
  Search,
  Settings,
  LogOut,
  Leaf,
  Sprout,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag, badge: "orders" },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/inventory", label: "Inventory", icon: Archive, badge: "inventory" },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/leads", label: "Leads", icon: MessageCircle, badge: "leads" },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  { href: "/dashboard/coupons", label: "Coupons", icon: Tag },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/blog", label: "Blog", icon: BookOpen },
  { href: "/dashboard/seo", label: "SEO", icon: Search },
];

const bottomNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
  isMobileDrawer?: boolean;
  onNavigate?: () => void;
}

export default function Sidebar({ userName, userEmail, isMobileDrawer, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<Record<string, number>>({});
  const supabaseRef = useState(() => createClient())[0];

  const fetchBadges = async () => {
    const [ordersRes, inventoryRes, leadsRes] = await Promise.all([
      supabaseRef
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["Order Confirmed", "Processing"]),
      supabaseRef
        .from("products")
        .select("id", { count: "exact", head: true })
        .lt("stock_quantity", 10),
      supabaseRef
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "New"),
    ]);

    setBadges({
      orders: ordersRes.count ?? 0,
      inventory: inventoryRes.count ?? 0,
      leads: leadsRes.count ?? 0,
    });
  }

  useEffect(() => {
    fetchBadges()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initial = userName.charAt(0).toUpperCase();

  const handleNavClick = () => {
    if (isMobileDrawer && onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside
      className={cn(
        "sidebar-grain relative flex h-full flex-col bg-brand-bark overflow-hidden",
        isMobileDrawer ? "flex w-full" : "hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-[var(--sidebar-width)] lg:flex-col"
      )}
    >
      <div className="absolute top-16 -left-8 w-32 h-32 rounded-full bg-brand-sage/5 blur-2xl pointer-events-none" />
      <div className="absolute bottom-32 -right-10 w-40 h-40 rounded-full bg-brand-terracotta/5 blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-brand-gold/3 blur-xl pointer-events-none" />

      <div className="relative z-10 flex h-[var(--header-height)] items-center gap-2.5 px-6 border-b border-white/10">
        <div className="relative">
          <Leaf className="h-7 w-7 text-brand-terracotta" />
          <Sprout className="absolute -bottom-1 -right-1 h-3.5 w-3.5 text-brand-sage/80" />
        </div>
        <div>
          <h1 className="font-display text-[22px] font-bold text-brand-cream leading-none">
            Mrittika
          </h1>
          <p className="text-[11px] text-brand-sand tracking-wider">
            Business Dashboard
          </p>
        </div>
      </div>

      <nav className="sidebar-nav relative z-10 flex-1 overflow-y-auto px-3 py-4 overscroll-contain">
        <ul className="space-y-0.5">
          {mainNav.map((item) => {
            const isActive = pathname === item.href;
            const badgeCount = item.badge ? badges[item.badge] : 0;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 relative min-h-[44px] group",
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-700 text-white border-l-[3px] border-amber-400 shadow-md"
                      : "text-white/80 hover:bg-white/[0.08] hover:text-white border-l-[3px] border-transparent"
                  )}
                >
                  <item.icon className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                    isActive ? "text-white" : "text-white/60 group-hover:text-white"
                  )} />
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white/90 px-1.5 text-[10px] font-bold text-amber-800 shadow-sm">
                      {badgeCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-3 border-t border-white/10" />

        <ul className="space-y-0.5">
          {bottomNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 border-l-[3px] min-h-[44px] group",
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-amber-700 text-white border-amber-400 shadow-md"
                      : "text-white/80 hover:bg-white/[0.08] hover:text-white border-transparent"
                  )}
                >
                  <item.icon className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                    isActive ? "text-white" : "text-white/60 group-hover:text-white"
                  )} />
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-white/80 hover:bg-white/[0.08] hover:text-white transition-all duration-200 border-l-[3px] border-transparent min-h-[44px] group"
              >
                <LogOut className="h-[18px] w-[18px] shrink-0 text-white/60 group-hover:text-red-400" />
                Logout
              </button>
            </form>
          </li>
        </ul>
      </nav>

      <div className="relative z-10 border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-terracotta to-brand-terracotta/80 text-xs font-bold text-white shadow-md shadow-brand-terracotta/20 ring-2 ring-brand-terracotta/20">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-brand-cream truncate">
              {userName}
            </p>
            <p className="text-[11px] text-brand-sand truncate">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
