import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Conditionally initialize the client so it doesn't crash the app if keys are missing.
// When Supabase is not configured, we expose a soft-failing stub that keeps the UI usable
// and surfaces clear console warnings instead of runtime errors.
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : ({
        from: () => ({
          insert: async () => {
            console.warn("[Treva] Supabase not configured: insert() was called.");
            return { error: new Error("Supabase not configured"), data: null };
          },
          select: async () => {
            console.warn("[Treva] Supabase not configured: select() was called.");
            return { error: new Error("Supabase not configured"), data: null };
          },
        }),
        auth: {
          async getUser() {
            console.warn("[Treva] Supabase not configured: getUser() was called.");
            return { data: { user: null }, error: new Error("Supabase not configured") };
          },
          async signUp() {
            console.warn("[Treva] Supabase not configured: signUp() was called.");
            return { data: null, error: new Error("Supabase not configured") };
          },
          async signInWithPassword() {
            console.warn(
              "[Treva] Supabase not configured: signInWithPassword() was called."
            );
            return { data: null, error: new Error("Supabase not configured") };
          },
          async signInWithOAuth() {
            console.warn(
              "[Treva] Supabase not configured: signInWithOAuth() was called."
            );
            return { data: null, error: new Error("Supabase not configured") };
          },
          async signOut() {
            console.warn("[Treva] Supabase not configured: signOut() was called.");
            return { error: new Error("Supabase not configured") };
          },
          onAuthStateChange() {
            console.warn(
              "[Treva] Supabase not configured: onAuthStateChange() was called."
            );
            return {
              data: {
                subscription: {
                  unsubscribe() {
                    // no-op
                  },
                },
              },
            };
          },
        },
      } as any);
