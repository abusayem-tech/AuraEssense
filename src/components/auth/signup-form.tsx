"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl, safeAuthRedirect } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GoogleIcon } from "@/components/auth/google-icon";
import { toast } from "sonner";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeAuthRedirect(params.get("redirect"));

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authCallbackUrl(redirect),
        data: { full_name: fullName.trim() || undefined },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Hosted projects usually require email confirmation before a session exists.
    if (!data.session) {
      setNeedsConfirm(true);
      return;
    }

    toast.success("Welcome to AuraEssence");
    router.replace(redirect);
    router.refresh();
  }

  async function signInWithGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: authCallbackUrl(redirect) },
    });
    if (error) {
      setGoogleLoading(false);
      toast.error(error.message);
    }
  }

  if (needsConfirm) {
    return (
      <div className="text-center">
        <CheckCircle2 className="mx-auto mb-5 text-emerald" size={44} />
        <h2 className="font-display text-2xl text-ivory">Confirm your email</h2>
        <p className="mt-3 text-sm text-muted">
          We sent a confirmation link to
          <br />
          <span className="text-ivory">{email}</span>
        </p>
        <p className="mt-4 text-xs text-muted">
          After confirming, return here to sign in with your password.
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
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={signInWithGoogle}
        disabled={googleLoading || loading}
      >
        {googleLoading ? <Loader2 className="animate-spin" size={18} /> : <GoogleIcon />}
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs uppercase tracking-widest text-muted">or</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={signUp} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
          />
        </div>
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
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ivory"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading || googleLoading}>
          {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={16} />}
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
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
