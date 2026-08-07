import { redirect } from "next/navigation";

/** Pages editor now lives under Settings. */
export default function AdminPagesRedirect() {
  redirect("/admin/settings");
}
