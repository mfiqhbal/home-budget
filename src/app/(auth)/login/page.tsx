"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, LogIn, DollarSign, BarChart3, CheckSquare } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[oklch(0.15_0.01_260)]">
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 30px, white 30px, white 31px),
            repeating-linear-gradient(-45deg, transparent, transparent 30px, white 30px, white 31px)`,
        }} />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.55_0.12_185/15%)] via-transparent to-[oklch(0.7_0.14_55/10%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-2.5 mb-16">
              <div className="w-10 h-10 rounded-xl bg-copper/20 flex items-center justify-center">
                <Home className="w-5 h-5 text-copper" />
              </div>
              <span className="text-xl font-heading font-semibold text-white">BudgetNest</span>
            </div>

            <h2 className="text-4xl font-heading font-semibold text-white leading-tight mb-4">
              Manage your home<br />renovation budget<br />
              <span className="text-gradient">with confidence.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-sm font-body">
              Track costs, compare products, and stay on top of every detail.
            </p>
          </div>

          {/* Floating feature cards */}
          <div className="space-y-3">
            {[
              { icon: DollarSign, label: "Budget tracking", desc: "Real-time cost monitoring" },
              { icon: BarChart3, label: "Smart comparisons", desc: "Side-by-side product analysis" },
              { icon: CheckSquare, label: "Project checklist", desc: "Never miss a task" },
            ].map((feature) => (
              <div key={feature.label} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="w-9 h-9 rounded-lg bg-copper/15 flex items-center justify-center shrink-0">
                  <feature.icon className="w-4 h-4 text-copper" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/90">{feature.label}</p>
                  <p className="text-xs text-white/40">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 gradient-page flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-up">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-copper/10 mb-4">
              <Home className="w-7 h-7 text-copper" />
            </div>
            <h1 className="text-3xl font-heading font-semibold tracking-tight">BudgetNest</h1>
            <p className="text-muted-foreground mt-1.5 font-body">
              Home budget management made simple
            </p>
          </div>

          <div className="glass rounded-2xl p-8 shadow-lg shadow-black/5">
            <h2 className="text-2xl font-heading font-semibold mb-1">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-6 font-body">Sign in to your account</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-body">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3 font-body">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6 font-body">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-copper hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
