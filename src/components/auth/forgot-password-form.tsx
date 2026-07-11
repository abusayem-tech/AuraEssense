"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl, safeAuthRedirect } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const params = useSearchParams();
  const redirect = safeAuthRedirect(params.get("redirect"));

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authCallbackUrl("/update-password"),
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-5 text-emerald" size={44} />
        <h2 className="font-display text-2xl text-ivory">Check your inbox</h2>
        <p className="mt-3 text-sm text-muted">
          If an account exists for
          <br />
          <span className="text-ivory">{email}</span>
          <br />
          you&apos;ll receive a link to reset your password.
        </p>
        <Link
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="mt-6 inline-block text-xs uppercase tracking-widest text-gold hover:text-gold-soft"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={sendReset} className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Mail size={16} />}
          Send Reset Link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Remembered it?{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="text-gold hover:text-gold-soft"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
