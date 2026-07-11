import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/signup-form";
import { getUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your AuraEssence account.",
};

export default async function SignupPage() {
  const user = await getUser();
  if (user) redirect("/account");

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <p className="eyebrow">Join the House</p>
        <h1 className="mt-3 font-display text-4xl text-ivory">Create Account</h1>
        <p className="mt-2 text-sm text-muted">
          Save favourites, track orders, and earn rewards.
        </p>
      </div>
      <Suspense fallback={<div className="h-80" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
