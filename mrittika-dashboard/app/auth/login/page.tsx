"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Loader2, Eye, EyeOff, Sprout } from "lucide-react";
import { login } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);

    if (result.success) {
      window.location.href = "/dashboard/overview";
      return;
    } else {
      setError(result.error || "Login failed");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen grain-overlay">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-bark flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-brand-terracotta/30" />
          <div className="absolute bottom-40 right-10 w-96 h-96 rounded-full border border-brand-sage/20" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full border border-brand-gold/20" />
        </div>

        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E\")",
        }} />

        <div className="absolute top-32 -left-12 w-48 h-48 rounded-full bg-brand-sage/5 blur-3xl" />
        <div className="absolute bottom-20 -right-8 w-56 h-56 rounded-full bg-brand-terracotta/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Leaf className="h-10 w-10 text-brand-terracotta" />
              <Sprout className="absolute -bottom-1 -right-1 h-4 w-4 text-brand-sage/80" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-brand-cream">
                Mrittika
              </h1>
              <p className="text-brand-sand text-xs tracking-[0.2em] uppercase">
                Naturals
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-brand-sage/60">
            <div className="h-px flex-1 bg-brand-sage/20" />
            <Leaf className="h-4 w-4" />
            <div className="h-px flex-1 bg-brand-sage/20" />
          </div>
          <h2 className="font-display text-4xl text-brand-cream leading-snug">
            Manage your ritual,
            <br />
            naturally.
          </h2>
          <p className="text-brand-sand/70 text-base max-w-md leading-relaxed">
            Your centralized business command center for orders, inventory,
            customers, and everything in between.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center gap-2 text-brand-sage/50">
            <Sprout className="h-3.5 w-3.5" />
            <span className="text-[11px] tracking-wider uppercase">Handcrafted</span>
          </div>
          <div className="h-3 w-px bg-brand-sand/20" />
          <div className="flex items-center gap-2 text-brand-sage/50">
            <Leaf className="h-3.5 w-3.5" />
            <span className="text-[11px] tracking-wider uppercase">Natural</span>
          </div>
          <div className="h-3 w-px bg-brand-sand/20" />
          <p className="text-brand-sand/40 text-xs">
            &copy; {new Date().getFullYear()} Mrittika Naturals
          </p>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center bg-brand-cream p-6 sm:p-12 relative">
        <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-brand-sage/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-20 left-10 w-24 h-24 rounded-full bg-brand-terracotta/5 blur-2xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="relative">
              <Leaf className="h-8 w-8 text-brand-terracotta" />
              <Sprout className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 text-brand-sage/80" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-brand-charcoal leading-tight">
                Mrittika
              </h1>
              <p className="text-[10px] text-brand-charcoal/50 tracking-[0.2em] uppercase">
                Naturals
              </p>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-brand-sand/60 p-8">
            <div className="flex items-center gap-2 mb-1">
              <Leaf className="h-4 w-4 text-brand-sage" />
              <h2 className="font-display text-2xl font-bold text-brand-charcoal">
                Welcome Back
              </h2>
            </div>
            <p className="text-sm text-brand-charcoal/50 ml-6">
              Mrittika Business Dashboard
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-brand-charcoal mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@mrittika.com"
                  className="w-full rounded-lg border border-brand-sand/80 bg-white px-4 py-3 text-sm text-brand-charcoal placeholder:text-brand-charcoal/30 focus:border-brand-terracotta focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-brand-charcoal mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-brand-sand/80 bg-white px-4 py-3 pr-10 text-sm text-brand-charcoal placeholder:text-brand-charcoal/30 focus:border-brand-terracotta focus:outline-none focus:ring-2 focus:ring-brand-terracotta/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-charcoal/40 hover:text-brand-charcoal/70 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brand-terracotta px-4 py-3 text-sm font-semibold text-white hover:bg-brand-terracotta/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px] shadow-md shadow-brand-terracotta/20"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50/80 border border-red-200/60 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-brand-charcoal/40">
            For access, contact mrittikaskinrituals@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
