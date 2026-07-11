/** Keep post-auth redirects on-site (relative paths only). */
export function safeAuthRedirect(path: string | null | undefined, fallback = "/account") {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    return fallback;
  }
  return path;
}

export function authCallbackUrl(redirect: string) {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${origin}/auth/callback?redirect=${encodeURIComponent(safeAuthRedirect(redirect))}`;
}
