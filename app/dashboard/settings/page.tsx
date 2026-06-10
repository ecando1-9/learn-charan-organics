"use client";

import { useEffect, useState } from "react";
import { Mail, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;

      setEmail(user.email ?? "");
      setFullName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "");
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });

    setMessage(error ? error.message : "Profile updated.");
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-forest dark:text-cream">Account Settings</h1>
      <form onSubmit={handleSubmit} className="mt-6 grid max-w-2xl gap-4 rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
        <label className="grid gap-2 text-sm font-bold text-ink/70 dark:text-cream/70">
          Student name
          <span className="flex items-center gap-3 rounded-2xl bg-linen px-4 dark:bg-white/10">
            <UserRound size={18} className="text-leaf" />
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="min-h-12 w-full bg-transparent outline-none" placeholder="Student name" />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 dark:text-cream/70">
          Email address
          <span className="flex items-center gap-3 rounded-2xl bg-linen px-4 dark:bg-white/10">
            <Mail size={18} className="text-leaf" />
            <input value={email} disabled className="min-h-12 w-full bg-transparent outline-none disabled:opacity-70" placeholder="Email address" />
          </span>
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={loading}>
            <Save size={18} />
            {loading ? "Saving" : "Save profile"}
          </Button>
          <LogoutButton />
        </div>
        {message && <p className="rounded-2xl bg-linen p-3 text-sm font-semibold text-forest dark:bg-white/10 dark:text-cream">{message}</p>}
      </form>
    </div>
  );
}
