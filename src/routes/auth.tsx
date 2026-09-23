import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Guitar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { saveDisplayName } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";

const TITLE = "Sign in to Fretwise — keep your guitar streak on any device";
const DESCRIPTION =
  "Create a Fretwise account or sign in with Google to save your completed drills, practice minutes, XP and streak so your progress follows you between devices.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function friendly(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match an account.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "There's already an account with that email — sign in instead.";
  if (m.includes("password") && m.includes("6")) return "Use a password of at least 6 characters.";
  if (m.includes("email not confirmed")) return "Confirm your email first — check your inbox.";
  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() },
          },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Check your email to confirm your account, then come back and sign in.");
          return;
        }
        if (name.trim()) await saveDisplayName({ data: { displayName: name } });
        navigate({ to: "/" });
        return;
      }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      navigate({ to: "/" });
    } catch (err) {
      setError(friendly(err instanceof Error ? err.message : "Something went wrong."));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in didn't complete. Try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <Link to="/" className="mb-8 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Guitar className="h-5 w-5" />
        </span>
        <span className="font-display text-lg font-bold tracking-tight">Fretwise</span>
      </Link>

      <h1 className="font-display text-3xl font-bold leading-tight">
        {mode === "signin" ? "Welcome back" : "Save your progress"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {mode === "signin"
          ? "Sign in and pick up in the same unit and drill."
          : "Create an account so your streak, minutes and completed drills follow you anywhere."}
      </p>

      <button
        type="button"
        onClick={google}
        disabled={busy}
        className="mt-7 min-h-14 w-full rounded-2xl border border-border bg-surface px-5 font-display font-bold transition-colors hover:bg-surface-raised disabled:opacity-60"
      >
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <label className="block" htmlFor="display-name">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Display name</span>
            <input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={40}
              autoComplete="nickname"
              className="mt-1.5 min-h-14 w-full rounded-2xl border border-border bg-surface px-4 text-base outline-none focus:border-primary"
            />
          </label>
        )}
        <label className="block" htmlFor="email">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1.5 min-h-14 w-full rounded-2xl border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </label>
        <label className="block" htmlFor="password">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="mt-1.5 min-h-14 w-full rounded-2xl border border-border bg-surface px-4 text-base outline-none focus:border-primary"
          />
        </label>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-accent">{notice}</p>}

        <Button
          type="submit"
          disabled={busy}
          className="min-h-14 w-full rounded-full font-display text-base font-bold shadow-glow"
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
          setNotice(null);
        }}
        className="mt-6 text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
      </button>

      <Link to="/" className="mt-4 text-sm text-muted-foreground underline-offset-4 hover:underline">
        Keep practising without an account
      </Link>
    </main>
  );
}
