import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Btn, Field, Input } from "@/components/flip/kit";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Flipmain" },
      { name: "description", content: "Sign in to Flipmain to access your AI domain flipping autopilot and portfolio." },
      { property: "og:title", content: "Sign in — Flipmain" },
      { property: "og:description", content: "Access your AI domain flipping autopilot." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() || email.split("@")[0] },
          },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <p className="text-center text-[15px] font-semibold tracking-[0.18em]">
          FLIP<span className="text-primary">MAIN</span>
        </p>
        <p className="mt-2 text-center text-[13px] text-muted-foreground">
          Find undervalued domains. Flip with conviction.
        </p>

        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h1 className="text-base font-semibold text-foreground">
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Your portfolio starts empty until the autopilot begins trading.
          </p>

          <form onSubmit={submit} className="mt-5 flex flex-col gap-4">
            {mode === "signup" ? (
              <Field label="Display name">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" />
              </Field>
            ) : null}
            <Field label="Email">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </Field>

            {error ? <p className="text-xs text-danger">{error}</p> : null}

            <Btn type="submit" variant="primary" disabled={busy} className="w-full justify-center">
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Btn>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Btn variant="secondary" onClick={google} className="w-full justify-center">
            Continue with Google
          </Btn>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New to Flipmain?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-primary hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
              }}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
