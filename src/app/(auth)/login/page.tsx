import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your AuraEssence account.",
};

export default async function LoginPage() {
  const user = await getUser();
  if (user) redirect("/account");

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <p className="eyebrow">Welcome</p>
        <h1 className="mt-3 font-display text-4xl text-ivory">Sign In</h1>
        <p className="mt-2 text-sm text-muted">
          Access your orders, wishlist and rewards.
        </p>
      </div>
      <Suspense fallback={<div className="h-64" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
