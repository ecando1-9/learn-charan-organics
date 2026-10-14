import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDefaultLmsRole } from "@/lib/supabase/profile";

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
    try {
      await supabase.auth.exchangeCodeForSession(authCode);
    } catch {
      // ignore exchange error
    }
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = request.nextUrl.searchParams.get("next") ?? "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  // Detect whether client has Supabase auth token cookies
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"));

  let user = null;
  let isNetworkError = false;

  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      if (
        error.message?.includes("fetch failed") ||
        error.name === "AuthRetryableFetchError" ||
        (error as any).status === 503 ||
        (error as any).status === 504
      ) {
        isNetworkError = true;
      }
    }
    user = data?.user ?? null;
  } catch (err: any) {
    if (
      err?.message?.includes("fetch failed") ||
      err?.name === "AuthRetryableFetchError" ||
      err?.cause?.message?.includes("fetch failed")
    ) {
      isNetworkError = true;
    }
  }

  // Retry once if there was a transient network error and the user has auth cookies
  if (!user && isNetworkError && hasAuthCookie) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
      if (user) {
        isNetworkError = false;
      }
    } catch {
      // Still network error
    }
  }

  // Authentication gate:
  // If no user could be verified:
  // - If the user has valid auth cookies but Supabase had a temporary network glitch,
  //   let the request proceed to avoid falsely kicking out active users.
  // - Otherwise, redirect to login.
  if ((isPrivate || isAdmin) && !user) {
    if (hasAuthCookie && isNetworkError) {
      return response;
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin authorization gate:
  if (isAdmin && user) {
    const isPrimaryAdmin = getDefaultLmsRole(user.email) === "admin";
    if (!isPrimaryAdmin) {
      try {
        const admin = createAdminClient();
        const { data: profile } = await admin
          .from("lms_profiles")
          .select("role")
          .eq("id", user.id)
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
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/community/:path*"],
};
