"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // No changes needed in useEffects
  useEffect(() => {
    async function checkSession() {
      const sessionCookie = document.cookie.includes("admin-session");
      if (sessionCookie) {
        router.push("/admin");
      }
    }
    checkSession();
  }, [router]);

  // ✨ This is the main change
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. Sign in with Supabase on the client
    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      try {
        // 2. Send the session to our API route to set the cookie
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session: data.session }),
        });

        if (!res.ok) {
          throw new Error("Failed to set session on server");
        }

        // 3. Now that the cookie is set, we can redirect
        router.push("/admin");
        router.refresh(); // Recommended to refresh server components
      } catch (apiError: any) {
        setError(apiError.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    // ... your JSX remains the same
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* ... */}
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-900">
            Admin Login
          </h2>
          {/* ... */}
        </div>
        <div className="mt-8 bg-white py-8 px-4 sm:px-6 lg:px-8 rounded-xl border border-slate-200 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* ... email input ... */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white/70 px-10 py-2.5 text-sm placeholder:text-slate-400 outline-none transition focus:ring-4 focus:ring-[#fc9dca]/20 focus:border-[#fc9dca]"
                  placeholder="Enter your email"
                />
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
              </div>
            </div>
            {/* ... password input ... */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-slate-200 bg-white/70 px-10 py-2.5 text-sm placeholder:text-slate-400 outline-none transition focus:ring-4 focus:ring-[#fc9dca]/20 focus:border-[#fc9dca]"
                  placeholder="Enter your password"
                />
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {/* ... error and submit button ... */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded-md p-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 rounded-md bg-[#fc9dca] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-[#fc9dca]/40 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fc9dca] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={16} />
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
