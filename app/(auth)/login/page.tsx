import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth-card";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const params = searchParams ? await searchParams : {};
    const redirectTo = typeof params?.redirectTo === "string" ? params.redirectTo : "/dashboard";
    redirect(redirectTo);
  }

  return (
    <Suspense>
      <AuthCard mode="login" />
    </Suspense>
  );
}
