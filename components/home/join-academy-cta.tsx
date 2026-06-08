"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function JoinAcademyCta() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (isLoggedIn) return null;

  return (
    <div className="rounded-[2rem] bg-leaf p-8 text-white shadow-soft sm:p-10">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-3xl font-black">Start your organic learning journey today.</h2>
          <p className="mt-2 text-white/75">Create an account, enroll in a course and continue learning from any device.</p>
        </div>
        <Link href="/register"><Button className="bg-white text-forest hover:bg-cream"><Users size={18} /> Join academy</Button></Link>
      </div>
    </div>
  );
}
