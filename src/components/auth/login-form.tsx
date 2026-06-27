"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M21.35 11.1H12v3.83h5.35a4.58 4.58 0 0 1-1.98 3.01v2.5h3.2c1.87-1.72 2.95-4.26 2.95-7.28 0-.68-.06-1.34-.17-1.96z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.2-2.5c-.9.6-2.05.96-3.42.96-2.63 0-4.86-1.78-5.66-4.17H3.04v2.6A10 10 0 0 0 12 22z"
        opacity="0.7"
      />
      <path
        fill="currentColor"
        d="M6.34 13.86A6 6 0 0 1 6.02 12c0-.65.11-1.28.31-1.86V7.54H3.04A10 10 0 0 0 2 12c0 1.62.39 3.15 1.04 4.46l3.3-2.6z"
        opacity="0.5"
      />
      <path
        fill="currentColor"
        d="M12 5.97c1.48 0 2.8.51 3.85 1.5l2.84-2.84C16.95 2.99 14.7 2 12 2A10 10 0 0 0 3.04 7.54l3.3 2.6C7.14 7.75 9.37 5.97 12 5.97z"
        opacity="0.85"
      />
    </svg>
  );
}

export function LoginForm() {
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/account";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
    if (error) {
      setGoogleLoading(false);
      toast.error(error.message);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-5 text-emerald" size={44} />
        <h2 className="font-display text-2xl text-ivory">Check your inbox</h2>
        <p className="mt-3 text-sm text-muted">
          We&apos;ve sent a secure sign-in link to
          <br />
          <span className="text-ivory">{email}</span>
        </p>
        <button
          onClick={() => setSent(false)}
          className="mt-6 text-xs uppercase tracking-widest text-gold hover:text-gold-soft"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={signInWithGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <GoogleIcon />
        )}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-widest text-muted">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={sendMagicLink}>
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Mail size={16} />
          )}
          Send Magic Link
        </Button>
      </form>
      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        Passwordless &amp; secure. We&apos;ll email you a one-time sign-in link —
        no password required.
      </p>
    </div>
  );
}
