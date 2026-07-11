"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, inputClass } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        setInfo("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
        setLoading(false);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blush-soft to-mist px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/crm/rox_horizontal.png" alt="Rox Cleaning" width={150} height={50} className="h-12 w-auto" />
          <p className="mt-3 text-sm font-medium text-graphite/60">CRM · Internal access</p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-lg font-bold text-graphite">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h1>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-graphite/80">Full name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  placeholder="Jane Smith"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-graphite/80">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@roxcleaningusa.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-graphite/80">Password</label>
              <input
                type="password"
                required
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            {info && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-graphite/60">
            {mode === "signin" ? "First time here?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
              className="font-semibold text-magenta hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
        <p className="mt-6 text-center text-xs text-graphite/40">
          The first account created becomes the owner (admin).
        </p>
      </div>
    </div>
  );
}
