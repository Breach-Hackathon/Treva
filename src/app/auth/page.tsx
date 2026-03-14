 "use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Mode = "signin" | "signup";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getUser()
      .then(
        ({
          data,
          error,
        }: {
          data: { user: { email?: string | null } | null };
          error: Error | null;
        }) => {
        if (!mounted) return;
        if (error) {
          console.error(error);
          return;
        }
        const email = data.user?.email ?? null;
        setUserEmail(email);
        if (email) {
          router.replace(redirectTarget);
        }
      })
      .catch((err) => console.error(err));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? null;
      setUserEmail(email);
      if (email) {
        router.replace(redirectTarget);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [redirectTarget, router]);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const redirectUrl =
        window.location.origin +
        `/auth?redirect=${encodeURIComponent(redirectTarget)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) {
        console.error(error);
        setError(error.message ?? "Failed to sign in with Google.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setError(null);

    if (!email || !password) {
      setError("Please enter an email and password.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          console.error(error);
          setError(error.message ?? "Could not create your account.");
          return;
        }
        // Depending on Supabase email confirmation settings, the user may need
        // to confirm their email before session is active.
        const newEmail = data.user?.email ?? email;
        setUserEmail(newEmail);
        router.replace(redirectTarget);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error(error);
          setError(error.message ?? "Invalid email or password.");
          return;
        }
        const signedInEmail = data.user?.email ?? email;
        setUserEmail(signedInEmail);
        router.replace(redirectTarget);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error(error);
        setError(error.message ?? "Failed to sign out.");
      } else {
        setUserEmail(null);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to sign out.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-[0_22px_65px_rgba(15,23,42,0.16)] backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
          Treva Account
        </p>
        <h1 className="mt-3 font-serif text-2xl uppercase tracking-[0.25em]">
          {userEmail ? "You’re signed in" : "Sign in or create an account"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
          Use Google or your email and password to save itineraries and revisit
          your AI-crafted journeys at any time.
        </p>

        {userEmail && (
          <div className="mt-6 rounded-2xl bg-neutral-50 px-4 py-3 text-xs uppercase tracking-[0.25em] text-neutral-600">
            Signed in as{" "}
            <span className="font-semibold normal-case tracking-normal">
              {userEmail}
            </span>
          </div>
        )}

        {error && (
          <p className="mt-4 text-xs text-red-500">
            {error}
          </p>
        )}

        {!userEmail && (
          <div className="mt-6">
            {/* Mode toggle */}
            <div className="flex rounded-full border border-neutral-200 bg-neutral-50 p-1 text-[0.7rem] uppercase tracking-[0.25em]">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-full px-3 py-2 text-center transition-colors ${
                  mode === "signin"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-full px-3 py-2 text-center transition-colors ${
                  mode === "signup"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500"
                }`}
              >
                Sign up
              </button>
            </div>

            {/* Email/password form */}
            <div className="mt-5 space-y-3 text-sm">
              <div className="space-y-1">
                <label className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
                  {mode === "signup" ? "Create password" : "Password"}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                  placeholder="••••••••"
                />
              </div>
              {mode === "signup" && (
                <div className="space-y-1">
                  <label className="text-[0.7rem] uppercase tracking-[0.25em] text-neutral-500">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleEmailAuth}
                disabled={loading}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? mode === "signup"
                    ? "Creating account…"
                    : "Signing in…"
                  : mode === "signup"
                  ? "Create account"
                  : "Sign in with email"}
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.25em] text-neutral-400">
              <div className="h-px flex-1 bg-neutral-200" />
              <span>Or</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-white transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Redirecting…" : "Continue with Google"}
            </button>
          </div>
        )}

        {userEmail && (
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 px-6 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}

        <p className="mt-6 text-[0.65rem] leading-relaxed text-neutral-500">
          After signing in, you’ll be taken to your dashboard where your saved
          itineraries and curated journeys live.
        </p>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background px-4 text-text">
          <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/80 p-8 shadow-[0_22px_65px_rgba(15,23,42,0.16)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
              Treva Account
            </p>
            <h1 className="mt-3 font-serif text-2xl uppercase tracking-[0.25em]">
              Loading...
            </h1>
          </div>
        </main>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
