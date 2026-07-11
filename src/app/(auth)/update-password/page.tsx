import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Update Password",
  description: "Choose a new password for your AuraEssence account.",
};

export default async function UpdatePasswordPage() {
  const user = await getUser();
  if (!user) redirect("/login?redirect=/update-password");

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <p className="eyebrow">Security</p>
        <h1 className="mt-3 font-display text-4xl text-ivory">New Password</h1>
        <p className="mt-2 text-sm text-muted">
          Choose a strong password for your account.
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  );
}
