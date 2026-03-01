"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Home, UserPlus, DollarSign, BarChart3, CheckSquare } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

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
              Start managing<br />your renovation<br />
              <span className="text-gradient">budget today.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-sm font-body">
              Create your free account and take control of your home project finances.
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
              Create your account to get started
            </p>
          </div>

          <div className="glass rounded-2xl p-8 shadow-lg shadow-black/5">
            <h2 className="text-2xl font-heading font-semibold mb-1">Create account</h2>
            <p className="text-sm text-muted-foreground mb-6 font-body">Get started for free</p>

            <form onSubmit={handleRegister} className="space-y-4">
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
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-body">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6 font-body">
              Already have an account?{" "}
              <Link href="/login" className="text-copper hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
