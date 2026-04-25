"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { FaGraduationCap, FaUser, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

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
    <div className="min-h-screen flex bg-bg-secondary text-text-primary">
      {/* Left Side - Dark Cover */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background gradient/overlay to simulate the dark overlay in the original image */}
        <div className="absolute inset-0 bg-sidebar z-0 opacity-90"></div>
        
        {/* We can put a background image later if we have one, just assigning a subtle radial gradient for now */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#0A2045] to-[#051329] z-0 opacity-80"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 rounded bg-emerald text-white font-bold flex items-center justify-center">
              <FaGraduationCap size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">ProjectReview</span>
          </div>
          
          <div className="max-w-[480px] mt-24">
            <h1 className="text-[3.5rem] font-bold mb-6 leading-[1.1] tracking-tight">Career Building<br />Reimagined.</h1>
            <p className="text-slate-300 text-lg leading-relaxed">Join thousands of ambitious students and forward-thinking faculty building the future together through real-world projects and learning.</p>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-slate-400 flex gap-6 mt-12">
          <span>© 2026 ProjectReview Inc.</span>
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-[400px] animate-fade-in">
          
          {/* Logo for mobile only */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded bg-emerald text-white font-bold flex items-center justify-center">
              <FaGraduationCap size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-sidebar">ProjectReview</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-sidebar mb-2 tracking-tight">Welcome back</h1>
            <p className="text-text-secondary">Enter your details to access your workspace.</p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="idOrEmail">
                <FaUser className="text-emerald" size={14} /> Email / Registration ID
              </label>
              <input
                id="idOrEmail"
                type="text"
                placeholder="name@university.edu or CS2026001"
                className="input py-3 !bg-white !border-gray-200"
                value={idOrEmail}
                onChange={(e) => setIdOrEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="password">
                <FaLock className="text-emerald" size={14} /> Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input py-3 !bg-white !border-gray-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full py-3.5 mt-2 shadow-sm rounded-lg font-bold"
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : "Sign In"}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-border flex-1" />
            <span className="text-xs text-text-muted font-bold tracking-wider">OR CONTINUE WITH</span>
            <div className="h-px bg-border flex-1" />
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 mt-8 flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-lg text-sidebar font-semibold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <FcGoogle size={20} />
            Sign in with Google
          </button>

          <div className="mt-10 text-center text-sm">
            <span className="text-text-muted">Don't have an account? </span>
            <Link href="/register" className="text-emerald font-bold hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
