"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ compact = false, iconOnly = false }: { compact?: boolean; iconOnly?: boolean }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          aria-label="Logout"
          title="Log out"
          className="grid size-8 shrink-0 place-items-center rounded-full text-ink/40 dark:text-cream/40 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 dark:hover:text-red-400 transition"
        >
          <LogOut size={15} />
        </button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          className={compact ? "size-11 px-0" : ""}
          onClick={() => setShowModal(true)}
          aria-label="Logout"
        >
          <LogOut size={17} />
          {!compact && "Logout"}
        </Button>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#111b21] p-6 shadow-2xl border border-gray-200 dark:border-white/10 text-center space-y-4">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 dark:text-cream">Log Out?</h3>
              <p className="text-xs text-gray-500 dark:text-cream/60 mt-1">
                Are you sure you want to log out of your account?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-gray-300 dark:border-white/10 py-2 text-xs font-bold text-gray-700 dark:text-cream hover:bg-gray-100 dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white py-2 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
              >
                {isPending ? "Logging out..." : "Log Out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
