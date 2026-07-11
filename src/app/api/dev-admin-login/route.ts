import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Local-only helper so agents/devs can open /admin without OAuth.
 * Disabled outside development. Requires DEV_ADMIN_PASSWORD in .env.local.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const password = process.env.DEV_ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "Set DEV_ADMIN_PASSWORD in .env.local" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/admin";
  const email =
    url.searchParams.get("email") ||
    process.env.DEV_ADMIN_EMAIL ||
    "abusayem433@gmail.com";

  const cookieStore = await cookies();
  const response = NextResponse.redirect(new URL(redirectTo, url.origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return response;
}
