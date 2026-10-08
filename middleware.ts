import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { ensureLmsProfile } from "@/lib/supabase/profile";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const isPrivate =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/community");
  const isAdmin = pathname.startsWith("/admin");
  const authCode = request.nextUrl.searchParams.get("code");

  // If it's a public page and no auth code, return immediately
  if (!isPrivate && !isAdmin && !authCode) {
    return response;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: CookieToSet[]) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  if (authCode) {
    await supabase.auth.exchangeCodeForSession(authCode);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = request.nextUrl.searchParams.get("next") ?? "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const { data } = await supabase.auth.getUser();

    if ((isPrivate || isAdmin) && !data?.user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdmin && data?.user) {
      try {
        const admin = createAdminClient();
        await ensureLmsProfile(data.user);

        const { data: profile } = await admin
          .from("lms_profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profile?.role !== "admin") {
          const unauthorizedUrl = request.nextUrl.clone();
          unauthorizedUrl.pathname = "/unauthorized";
          unauthorizedUrl.search = "";
          return NextResponse.redirect(unauthorizedUrl);
        }
      } catch (err) {
        console.error("Middleware admin check error:", err);
      }
    }
  } catch (err) {
    console.error("Middleware auth check error:", err);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/community/:path*"],
};
