import { createClient } from "@/utils/supabase/server";
import { adminSupabase } from "@/utils/supabase/admin";
import {
  startOfDay,
  startOfMonth,
  endOfMonth,
  format,
  subDays,
} from "date-fns";
import {
  IndianRupee,
  ShoppingBag,
  Clock,
  AlertTriangle,
  MessageCircle,
  Users,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RevenueChart from "@/components/charts/RevenueChart";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface MetricCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  borderColor?: string;
  trend?: string;
}

function MetricCard({
  label,
  value,
  icon,
  iconBg,
  borderColor,
  trend,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 transition-shadow hover:shadow-md",
        borderColor ? `border-l-4 ${borderColor}` : "border-brand-sand"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-2xl sm:text-[32px] font-bold text-brand-charcoal leading-none">
            {value}
          </p>
          <p className="mt-2 text-sm text-brand-charcoal/70">{label}</p>
          {trend && (
            <p className="mt-1 text-xs text-brand-sage font-medium">{trend}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            iconBg
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

interface OrderRow {
  id: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

function statusColor(status: string) {
  switch (status) {
    case "Delivered":
      return "bg-brand-sage/15 text-brand-sage";
    case "Cancelled":
      return "bg-red-100 text-red-700";
    case "Shipped":
      return "bg-blue-100 text-blue-700";
    case "Processing":
    case "Order Confirmed":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-brand-sand/50 text-brand-charcoal/60";
  }
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function OverviewPage() {
  const supabase = await createClient();
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const monthStart = startOfMonth(now).toISOString();
  const monthEnd = endOfMonth(now).toISOString();

  const [
    todayOrders,
    monthOrders,
    allOrders,
    pendingOrders,
    lowStockProducts,
    outOfStockProducts,
    newLeads,
    recentOrders,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", todayStart)
      .neq("status", "Cancelled"),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", monthStart)
      .lte("created_at", monthEnd)
      .neq("status", "Cancelled"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["Order Confirmed", "Processing"]),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .lt("stock_quantity", 10),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("stock_quantity", 0),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "New"),
    supabase
      .from("orders")
      .select("id, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const todayRevenue = todayOrders.data?.reduce((s, o) => s + (o.total || 0), 0) ?? 0;
  const monthlyRevenue = monthOrders.data?.reduce((s, o) => s + (o.total || 0), 0) ?? 0;
  const totalOrders = allOrders.count ?? 0;
  const pendingCount = pendingOrders.count ?? 0;
  const lowStockCount = lowStockProducts.count ?? 0;
  const outOfStockCount = outOfStockProducts.count ?? 0;
  const newLeadsCount = newLeads.count ?? 0;
  const monthlyOrderCount = monthOrders.data?.length ?? 0;
  const avgOrderValue = monthlyOrderCount > 0 ? monthlyRevenue / monthlyOrderCount : 0;

  const customersRes = await supabase
    .from("orders")
    .select("customer_email")
    .not("customer_email", "is", null);

  const totalCustomers = new Set(customersRes.data?.map((o) => o.customer_email) || []).size;

  const last30 = subDays(now, 30).toISOString();
  const chartOrders = await supabase
    .from("orders")
    .select("created_at, total")
    .gte("created_at", last30)
    .neq("status", "Cancelled")
    .order("created_at", { ascending: true });

  const dailyRevenue: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = subDays(now, i);
    dailyRevenue[format(d, "dd MMM")] = 0;
  }
  chartOrders.data?.forEach((o) => {
    const key = format(new Date(o.created_at), "dd MMM");
    if (key in dailyRevenue) {
      dailyRevenue[key] += o.total || 0;
    }
  });
  const chartData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  const orders: OrderRow[] = (recentOrders.data as OrderRow[]) || [];

  const todayOrderCount = todayOrders.data?.length ?? 0;
  const hasAlerts = pendingCount > 0 || lowStockCount > 0 || outOfStockCount > 0 || newLeadsCount > 0 || todayOrderCount === 0;

  const cancelledOrders = await adminSupabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("status", "Cancelled")
    .gte("created_at", monthStart);

  const cancelledCount = cancelledOrders.count ?? 0;

  const expiringCoupons = await adminSupabase
    .from("coupons")
    .select("code, expires_at")
    .eq("is_active", true)
    .not("expires_at", "is", null)
    .gt("expires_at", now.toISOString())
    .lt("expires_at", new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString());

  const expiringCouponCount = expiringCoupons.data?.length ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-brand-charcoal">
          {greeting}, Charvi 🌿
        </h1>
        <p className="mt-1 text-sm text-brand-charcoal/60">
          {format(now, "EEEE, dd MMMM yyyy")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString("en-IN")}`}
          icon={<IndianRupee className="h-5 w-5 text-brand-terracotta" />}
          iconBg="bg-brand-terracotta/15"
        />
        <MetricCard
          label="Monthly Revenue"
          value={`₹${monthlyRevenue.toLocaleString("en-IN")}`}
          icon={<IndianRupee className="h-5 w-5 text-brand-terracotta" />}
          iconBg="bg-brand-terracotta/15"
        />
        <MetricCard
          label="Total Orders"
          value={totalOrders.toLocaleString("en-IN")}
          icon={<ShoppingBag className="h-5 w-5 text-brand-sage" />}
          iconBg="bg-brand-sage/15"
        />
        <MetricCard
          label="Pending Orders"
          value={pendingCount.toString()}
          icon={<Clock className="h-5 w-5 text-brand-gold" />}
          iconBg="bg-brand-gold/15"
          borderColor={pendingCount > 0 ? "border-l-amber-500" : undefined}
        />
        <MetricCard
          label="Low Stock Products"
          value={lowStockCount.toString()}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-100"
          borderColor={lowStockCount > 0 ? "border-l-red-500" : undefined}
        />
        <MetricCard
          label="Out of Stock"
          value={outOfStockCount.toString()}
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          iconBg="bg-red-100"
          borderColor={outOfStockCount > 0 ? "border-l-red-600" : undefined}
        />
        <MetricCard
          label="New Leads"
          value={newLeadsCount.toString()}
          icon={<MessageCircle className="h-5 w-5 text-brand-sage" />}
          iconBg="bg-brand-sage/15"
        />
        <MetricCard
          label="Total Customers"
          value={totalCustomers.toLocaleString("en-IN")}
          icon={<Users className="h-5 w-5 text-brand-bark" />}
          iconBg="bg-brand-bark/15"
        />
        <MetricCard
          label="Avg Order Value"
          value={`₹${Math.round(avgOrderValue).toLocaleString("en-IN")}`}
          icon={<TrendingUp className="h-5 w-5 text-brand-terracotta" />}
          iconBg="bg-brand-terracotta/15"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-brand-sand bg-white">
            <div className="flex items-center justify-between border-b border-brand-sand px-5 py-4">
              <h2 className="font-display text-lg font-semibold text-brand-charcoal">
                Recent Orders
              </h2>
              <Link
                href="/dashboard/orders"
                className="text-sm text-brand-terracotta hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto -mx-0">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="border-b border-brand-sand text-left text-brand-charcoal/50">
                    <th className="px-5 py-3 font-medium">Order ID</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-8 text-center text-brand-charcoal/40">
                        No orders yet
                      </td>
                    </tr>
                  )}
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-brand-sand/50 hover:bg-brand-mist/50 transition-colors"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-brand-charcoal/70">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-5 py-3 text-brand-charcoal">
                        {order.customer_name || "—"}
                      </td>
                      <td className="px-5 py-3 text-brand-charcoal">
                        ₹{(order.total || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                            statusColor(order.status)
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-brand-charcoal/50">
                        {timeAgo(order.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-brand-sand bg-white p-5">
            <h2 className="font-display text-lg font-semibold text-brand-charcoal mb-4">
              Business Alerts
            </h2>
            <div className="space-y-3">
              {pendingCount > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  You have <strong>{pendingCount}</strong> orders waiting to be processed.
                </div>
              )}
              {lowStockCount > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <strong>{lowStockCount}</strong> products are running low on stock.
                </div>
              )}
              {outOfStockCount > 0 && (
                <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <strong>{outOfStockCount}</strong> products are completely out of stock!
                </div>
              )}
              {newLeadsCount > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <strong>{newLeadsCount}</strong> new inquiry messages need a response.
                </div>
              )}
              {todayOrderCount === 0 && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  No orders received today yet.
                </div>
              )}
              {todayOrderCount > 0 && (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  Today&apos;s revenue: <strong>₹{todayRevenue.toLocaleString("en-IN")}</strong> from {todayOrderCount} order{todayOrderCount !== 1 ? "s" : ""}.
                </div>
              )}
              {cancelledCount > 0 && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  <strong>{cancelledCount}</strong> order{cancelledCount !== 1 ? "s" : ""} cancelled this month.
                </div>
              )}
              {expiringCouponCount > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <strong>{expiringCouponCount}</strong> coupon{expiringCouponCount !== 1 ? "s" : ""} expiring within 7 days.
                </div>
              )}
              {!hasAlerts && expiringCouponCount === 0 && cancelledCount === 0 && (
                <div className="rounded-lg border border-brand-sage/30 bg-brand-sage/5 px-4 py-3 text-sm text-brand-sage">
                  Everything looks great today!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-brand-sand bg-white p-5">
        <h2 className="font-display text-lg font-semibold text-brand-charcoal mb-4">
          Revenue — Last 30 Days
        </h2>
        <RevenueChart data={chartData} />
      </div>
    </div>
  );
}
