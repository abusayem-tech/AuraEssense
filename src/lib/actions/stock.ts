"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ variantId: z.string().uuid(), email: z.string().email() });

export async function notifyBackInStock(
  variantId: string,
  email: string,
): Promise<{ ok: boolean; message: string }> {
  const parsed = schema.safeParse({ variantId, email });
  if (!parsed.success) return { ok: false, message: "Invalid email." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("stock_notifications")
    .insert({ variant_id: variantId, email });

  if (error && !error.message.includes("duplicate")) {
    return { ok: false, message: "Could not register. Try again." };
  }
  return { ok: true, message: "We'll notify you the moment it returns." };
}
