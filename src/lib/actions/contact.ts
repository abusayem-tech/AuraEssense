"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  message: z.string().min(10, "Please add a little more detail."),
});

export async function submitContact(input: {
  name: string;
  email: string;
  message: string;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { name, email, message } = parsed.data;
  const supabase = createAdminClient();
  const { error } = await supabase.from("admin_notifications").insert({
    type: "contact",
    title: `New message from ${name}`,
    body: `${email}\n\n${message}`,
  });

  if (error) return { ok: false, error: "Could not send your message. Please try again." };
  return { ok: true };
}
