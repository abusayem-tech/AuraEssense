import { AddressManager } from "@/components/account/address-manager";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import type { Address } from "@/types";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const user = await getUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .order("is_default", { ascending: false });

  return <AddressManager addresses={(data as unknown as Address[]) ?? []} />;
}
