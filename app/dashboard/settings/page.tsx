"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2, Clock, Mail, MessageCircle,
  Phone, Save, UserRound, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "@/components/logout-button";
import { formatCurrency } from "@/lib/utils";

type EnrollmentRequest = {
  id: string;
  status: string;
  course_title: string;
  amount_inr: number;
  requested_at: string;
  reviewed_at: string | null;
  admin_note: string | null;
  utr_number: string | null;
};

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      if (!user) return;
      setEmail(user.email ?? "");
      setFullName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "");

      // Load enrollment requests for this user
      supabase
        .from("lms_enrollment_requests")
        .select("id,status,course_title,amount_inr,requested_at,reviewed_at,admin_note,utr_number")
        .eq("user_id", user.id)
        .order("requested_at", { ascending: false })
        .then(({ data: reqData }) => {
          setRequests((reqData ?? []) as EnrollmentRequest[]);
          setLoadingRequests(false);
        });
    });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    setMessage(error ? error.message : "Profile updated.");
    setLoading(false);
  }

  function StatusBadge({ status }: { status: string }) {
    if (status === "approved") return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-leaf/10 px-3 py-1 text-xs font-black text-leaf">
        <CheckCircle2 size={13} /> Approved
      </span>
    );
    if (status === "rejected") return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-black text-red-500 dark:bg-red-950/30 dark:text-red-400">
        <XCircle size={13} /> Rejected
      </span>
    );
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
        <Clock size={13} /> Pending Review
      </span>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-forest dark:text-cream">Account Settings</h1>

      {/* Profile form */}
      <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4 rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
        <h2 className="text-lg font-black text-forest dark:text-cream">My Profile</h2>
        <label className="grid gap-2 text-sm font-bold text-ink/70 dark:text-cream/70">
          Student name
          <span className="flex items-center gap-3 rounded-2xl bg-linen px-4 dark:bg-white/10">
            <UserRound size={18} className="text-leaf" />
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="min-h-12 w-full bg-transparent outline-none"
              placeholder="Student name"
            />
          </span>
        </label>
        <label className="grid gap-2 text-sm font-bold text-ink/70 dark:text-cream/70">
          Email address
          <span className="flex items-center gap-3 rounded-2xl bg-linen px-4 dark:bg-white/10">
            <Mail size={18} className="text-leaf" />
            <input
              value={email}
              disabled
              className="min-h-12 w-full bg-transparent outline-none disabled:opacity-70"
              placeholder="Email address"
            />
          </span>
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button type="submit" disabled={loading}>
            <Save size={18} />
            {loading ? "Saving…" : "Save profile"}
          </Button>
          <LogoutButton />
        </div>
        {message && (
          <p className="rounded-2xl bg-linen p-3 text-sm font-semibold text-forest dark:bg-white/10 dark:text-cream">
            {message}
          </p>
        )}
      </form>

      {/* Enrollment Request Status */}
      <section className="max-w-2xl rounded-[2rem] bg-white p-6 shadow-soft dark:bg-white/5">
        <h2 className="text-lg font-black text-forest dark:text-cream">My Enrollment Requests</h2>
        <p className="mt-1 text-sm text-ink/60 dark:text-cream/60">
          Track the status of your course enrollment requests below.
        </p>

        {/* 48-hour notice */}
        <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-950/20">
          <Clock size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
              Access granted within 48 hours
            </p>
            <p className="mt-0.5 text-xs leading-5 text-amber-600/80 dark:text-amber-400/70">
              After you submit your payment proof, our team will verify and approve your request within 48 hours.
              Once approved, your course videos will be unlocked automatically.
            </p>
          </div>
        </div>

        {loadingRequests ? (
          <div className="mt-4 animate-pulse rounded-2xl bg-linen h-16 dark:bg-white/5" />
        ) : requests.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-linen p-5 text-center dark:bg-white/5">
            <p className="text-sm font-semibold text-ink/60 dark:text-cream/60">
              No enrollment requests yet.
            </p>
            <a href="/enroll" className="mt-3 inline-block rounded-full bg-forest px-5 py-2 text-sm font-bold text-white hover:bg-leaf transition">
              Enroll in courses
            </a>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {requests.map((req) => (
              <div key={req.id} className="rounded-2xl border border-forest/10 p-4 dark:border-white/10">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-forest dark:text-cream line-clamp-2">{req.course_title}</p>
                    <p className="mt-0.5 text-sm font-semibold text-leaf">{formatCurrency(req.amount_inr)}</p>
                  </div>
                  <StatusBadge status={req.status} />
                </div>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-ink/50 dark:text-cream/50">
                  <span>Submitted: {new Date(req.requested_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {req.utr_number && <span>UTR: {req.utr_number}</span>}
                  {req.reviewed_at && <span>Reviewed: {new Date(req.reviewed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                </div>
                {req.admin_note && (
                  <p className="mt-2 text-xs text-ink/60 italic dark:text-cream/60">
                    Admin note: {req.admin_note}
                  </p>
                )}
                {req.status === "rejected" && (
                  <a href="/enroll" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-leaf hover:underline">
                    Submit a new request →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Contact Support */}
      <section className="max-w-2xl rounded-[2rem] bg-forest p-6 text-cream shadow-soft">
        <h2 className="text-lg font-black">Need help with your enrollment?</h2>
        <p className="mt-1 text-sm text-cream/70">
          Contact us directly and we will assist you as soon as possible.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <a
            href="tel:+918247838125"
            className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 hover:bg-white/20 transition"
          >
            <Phone size={18} className="shrink-0 text-moss" />
            <div>
              <p className="text-xs font-bold text-cream/60">Call us</p>
              <p className="font-black">+91 824 783 8125</p>
            </div>
          </a>
          <a
            href="https://wa.me/918247838125"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 hover:bg-white/20 transition"
          >
            <MessageCircle size={18} className="shrink-0 text-moss" />
            <div>
              <p className="text-xs font-bold text-cream/60">WhatsApp</p>
              <p className="font-black">+91 824 783 8125</p>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
