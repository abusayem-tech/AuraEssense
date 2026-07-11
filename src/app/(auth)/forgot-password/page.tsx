import { Suspense } from "react";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your AuraEssence account password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <p className="eyebrow">Account</p>
        <h1 className="mt-3 font-display text-4xl text-ivory">Reset Password</h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email and we&apos;ll send a secure reset link.
        </p>
      </div>
      <Suspense fallback={<div className="h-48" />}>
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
