"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

async function uid() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

const profileSchema = z.object({
  full_name: z.string().min(1).max(120),
  phone: z.string().max(30).optional(),
});

export async function updateProfile(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const { supabase, user } = await uid();
  if (!user) return { ok: false, message: "Not signed in." };
  const parsed = profileSchema.safeParse({
    full_name: formData.get("full_name"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) return { ok: false, message: "Invalid details." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name, phone: parsed.data.phone ?? null })
    .eq("id", user.id);
  if (error) return { ok: false, message: "Could not update profile." };
  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { ok: true, message: "Profile updated." };
}

const addressSchema = z.object({
  recipient: z.string().min(2),
  phone: z.string().min(6),
  line: z.string().min(4),
  area: z.string().min(2),
  city: z.string().min(2),
  zone: z.enum(["dhaka", "outside"]),
  is_default: z.boolean().optional(),
});

export async function saveAddress(
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  const { supabase, user } = await uid();
  if (!user) return { ok: false, message: "Not signed in." };
  const parsed = addressSchema.safeParse({
    recipient: formData.get("recipient"),
    phone: formData.get("phone"),
    line: formData.get("line"),
    area: formData.get("area"),
    city: formData.get("city"),
    zone: formData.get("zone"),
    is_default: formData.get("is_default") === "on",
  });
  if (!parsed.success) return { ok: false, message: "Please complete the form." };

  if (parsed.data.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error } = await supabase
    .from("addresses")
    .insert({ ...parsed.data, user_id: user.id });
  if (error) return { ok: false, message: "Could not save address." };
  revalidatePath("/account/addresses");
  return { ok: true, message: "Address saved." };
}

export async function deleteAddress(id: string): Promise<{ ok: boolean }> {
  const { supabase, user } = await uid();
  if (!user) return { ok: false };
  await supabase.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function setDefaultAddress(id: string): Promise<{ ok: boolean }> {
  const { supabase, user } = await uid();
  if (!user) return { ok: false };
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase.from("addresses").update({ is_default: true }).eq("id", id).eq("user_id", user.id);
  revalidatePath("/account/addresses");
  return { ok: true };
}
