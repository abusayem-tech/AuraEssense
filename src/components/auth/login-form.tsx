"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { authCallbackUrl, safeAuthRedirect } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { GoogleIcon } from "@/components/auth/google-icon";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = safeAuthRedirect(params.get("redirect"));
  const authError = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
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

  return (
    <div>
      {authError && (
        <p className="mb-5 border border-rose/30 bg-rose/10 px-4 py-3 text-center text-xs text-rose">
          Authentication failed. Please try again.
        </p>
      )}

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

      <form onSubmit={signInWithPassword} className="space-y-4">
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
          <div className="mb-2 flex items-center justify-between">
            <Label htmlFor="password" className="!mb-0">
              Password
            </Label>
            <Link
              href={`/forgot-password?redirect=${encodeURIComponent(redirect)}`}
              className="text-[0.65rem] uppercase tracking-widest text-muted hover:text-gold"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
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
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />}
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to AuraEssence?{" "}
        <Link
          href={`/signup?redirect=${encodeURIComponent(redirect)}`}
          className="text-gold hover:text-gold-soft"
        >
          Create an account
        </Link>
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[0.65rem] uppercase tracking-widest text-muted">
        <Mail size={12} /> Email &amp; password or Google
      </p>
    </div>
  );
}
