"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FaHome, FaFileUpload, FaSignOutAlt, FaUserGraduate, FaBars, FaTimes 
} from "react-icons/fa";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, studentData, loading, logout } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || studentData === null)) {
      router.push("/login");
    }
  }, [user, studentData, loading, router]);

  if (loading || !user || !studentData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8" />
          <p className="text-secondary text-sm animate-pulse">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col md:flex-row">
      {/* Mobile Top Mobile Nav */}
      <div className="md:hidden flex items-center justify-between p-4 glass-card rounded-none border-x-0 border-t-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center text-white text-xs">
            <FaUserGraduate />
          </div>
          <span className="font-bold text-sm">Dashboard</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-accent">
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-card rounded-none border-y-0 border-l-0 translate-x-0 transition-transform duration-300
        md:static md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="hidden md:flex items-center gap-3 mb-10">
            <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center text-white shadow-lg">
              <FaUserGraduate size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Student Hub</h2>
              <p className="text-xs text-text-muted">{studentData.registrationId}</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-accent-light hover:text-accent transition-all"
            >
              <FaHome size={18} />
              <span className="font-medium text-sm">Overview</span>
            </Link>
            <Link
              href="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-accent-light hover:text-accent transition-all"
            >
              <FaUserGraduate size={18} />
              <span className="font-medium text-sm">Profile</span>
            </Link>
            <Link
              href="/dashboard/submit"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-white bg-accent shadow-lg shadow-accent/20 transition-all font-semibold"
            >
              <FaFileUpload size={18} />
              <span className="text-sm">Project Submission</span>
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-border">
            <div className="mb-4 px-2">
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Logged in as</p>
              <p className="text-xs font-semibold truncate">{studentData.name}</p>
            </div>
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <FaSignOutAlt size={18} />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full p-6 lg:p-10">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
