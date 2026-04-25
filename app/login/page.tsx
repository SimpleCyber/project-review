"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { FaGraduationCap, FaLock, FaUser, FaGoogle } from "react-icons/fa";

export default function StudentLoginPage() {
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(idOrEmail, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md glass-card p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
            <FaGraduationCap size={28} />
          </div>
          <h1 className="text-2xl font-bold">Student Login</h1>
          <p className="text-secondary text-sm mt-2">Enter your credentials to access your dashboard</p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label" htmlFor="idOrEmail">Registration ID / Email</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaUser size={14} />
              </span>
              <input
                id="idOrEmail"
                type="text"
                placeholder="e.g. CS2026001 or john@email.com"
                className="input pl-11"
                value={idOrEmail}
                onChange={(e) => setIdOrEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaLock size={14} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full py-3 mt-4"
            disabled={loading}
          >
            {loading ? <div className="spinner" /> : "Sign In"}
          </button>
        </form>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-text-muted font-medium">OR</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-secondary w-full py-3 mt-4 flex items-center justify-center gap-3"
        >
          <FaGoogle className="text-rose-500" />
          Continue with Google
        </button>

        <div className="mt-8 text-center text-sm">
          <p className="text-text-muted">
            Don't have an account?{" "}
            <Link href="/register" className="text-accent font-semibold hover:underline">
              Create an account
            </Link>
          </p>
          <div className="mt-6 pt-6 border-t border-border">
            <Link href="/" className="text-text-muted hover:text-primary transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
