"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
});

export async function subscribeNewsletter(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const parsed = schema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? "footer",
  });
  if (!parsed.success) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: parsed.data.email, source: parsed.data.source });

  if (error && !error.message.includes("duplicate")) {
    return { ok: false, message: "Something went wrong. Please try again." };
  }
  return { ok: true, message: "Welcome to the house. Check your inbox soon." };
}
