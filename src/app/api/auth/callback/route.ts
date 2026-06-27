import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Prevent open redirects — only allow relative paths on our own origin
  const safeRedirect = next.startsWith("/") ? next : "/dashboard";

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!sessionError && session) {
        return NextResponse.redirect(`${origin}${safeRedirect}`);
      }

      console.error("[Auth Callback] Session was not available after exchange:", sessionError?.message);
    }

    console.error("[Auth Callback] Error exchanging code:", error?.message ?? "Unknown auth error");
  }

  return NextResponse.redirect(
    `${origin}/login?error=auth_callback_failed`
  );
}