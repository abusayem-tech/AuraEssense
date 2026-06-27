import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const staticRoutes = [
    "",
    "/fragrances",
    "/brands",
    "/collections",
    "/quiz",
    "/journal",
    "/about",
    "/faq",
    "/shipping-returns",
    "/privacy",
    "/terms",
    "/contact",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  try {
    const supabase = await createClient();
    const [{ data: products }, { data: brands }, { data: collections }, { data: posts }] =
      await Promise.all([
        supabase.from("products").select("slug").eq("is_active", true),
        supabase.from("brands").select("slug"),
        supabase.from("collections").select("slug"),
        supabase.from("journal_posts").select("slug").not("published_at", "is", null),
      ]);

    const dyn = [
      ...(products ?? []).map((p) => `/fragrances/${(p as { slug: string }).slug}`),
      ...(brands ?? []).map((b) => `/brands/${(b as { slug: string }).slug}`),
      ...(collections ?? []).map((c) => `/collections/${(c as { slug: string }).slug}`),
      ...(posts ?? []).map((p) => `/journal/${(p as { slug: string }).slug}`),
    ].map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...dyn];
  } catch {
    return staticRoutes;
  }
}
