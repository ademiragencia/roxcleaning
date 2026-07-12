"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, PageHeader, Button, inputClass, labelClass } from "@/components/ui";

export default function AccountPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nameMsg, setNameMsg] = useState<string | null>(null);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        setFullName(profile?.full_name ?? "");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    setNameMsg(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ full_name: fullName }).eq("id", user.id);
      await supabase.auth.updateUser({ data: { full_name: fullName } });
      setNameMsg("Saved!");
    }
    setSavingName(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (password.length < 6) {
      setPwMsg({ type: "err", text: "Password must be at least 6 characters." });
      return;
    }
    if (password !== confirm) {
      setPwMsg({ type: "err", text: "Passwords don't match." });
      return;
    }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSavingPw(false);
    if (error) {
      setPwMsg({ type: "err", text: error.message });
    } else {
      setPassword("");
      setConfirm("");
      setPwMsg({ type: "ok", text: "Password updated! Use it next time you sign in." });
    }
  }

  return (
    <>
      <PageHeader title="My account" subtitle="Update your name and password." />

      <div className="grid max-w-2xl gap-6">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-graphite/50">Profile</h2>
          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <input value={email} disabled className={`${inputClass} bg-mist text-graphite/60`} />
              <p className="mt-1 text-xs text-graphite/45">Email can't be changed here.</p>
            </div>
            <div>
              <label className={labelClass}>Full name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={savingName}>
                {savingName ? "Saving…" : "Save profile"}
              </Button>
              {nameMsg && <span className="text-sm font-medium text-emerald-600">{nameMsg}</span>}
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-graphite/50">Change password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className={labelClass}>New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className={labelClass}>Confirm new password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            {pwMsg && (
              <p
                className={`rounded-lg px-3 py-2 text-sm ${
                  pwMsg.type === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                }`}
              >
                {pwMsg.text}
              </p>
            )}
            <Button type="submit" disabled={savingPw}>
              {savingPw ? "Updating…" : "Update password"}
            </Button>
          </form>
        </Card>
      </div>
    </>
  );
}
