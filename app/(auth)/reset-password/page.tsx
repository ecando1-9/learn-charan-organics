import { Suspense } from "react";
import { ResetPasswordCard } from "@/components/reset-password-card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Charan Organics Academy",
  description: "Set a new password for your Charan Organics Academy account.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md rounded-3xl border border-forest/10 bg-white/80 p-8 shadow-soft animate-pulse dark:bg-white/5">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-linen dark:bg-white/10" />
          <div className="mt-4 h-6 w-48 mx-auto rounded-lg bg-linen dark:bg-white/10" />
          <div className="mt-8 space-y-3">
            <div className="h-12 rounded-xl bg-linen dark:bg-white/10" />
            <div className="h-12 rounded-xl bg-linen dark:bg-white/10" />
            <div className="h-12 rounded-xl bg-linen dark:bg-white/10" />
          </div>
        </div>
      }
    >
      <ResetPasswordCard />
    </Suspense>
  );
}
