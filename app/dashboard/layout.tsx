"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FaHome, FaFileUpload, FaSignOutAlt, FaUserGraduate, FaBars, FaTimes, FaComments, FaGraduationCap
} from "react-icons/fa";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, studentData, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [batchName, setBatchName] = useState("");

  useEffect(() => {
    if (!loading && (!user || studentData === null)) {
      router.push("/login");
    }
  }, [user, studentData, loading, router]);

  useEffect(() => {
    if (studentData?.batchId) {
      getDoc(doc(db, "batches", studentData.batchId)).then(d => {
        if (d.exists()) setBatchName(d.data().name);
      });
    }
  }, [studentData?.batchId]);

  if (loading || !user || !studentData) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8 text-emerald" />
          <p className="text-secondary text-sm animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col md:flex-row text-text-primary">
      {/* Mobile Top Mobile Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar text-white z-50 shadow-sm border-b border-sidebar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-emerald text-white font-bold flex items-center justify-center">
            <FaGraduationCap size={16} />
          </div>
          <span className="font-bold text-sm tracking-tight">ProjectReview</span>
        </div>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white">
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-white shadow-xl transition-transform duration-300 flex flex-col pt-16 md:pt-0
        md:sticky md:top-0 md:h-screen md:overflow-hidden md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand / Logo (Hidden on mobile top nav but visible on desktop) */}
        <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="w-8 h-8 rounded bg-emerald text-white font-bold flex items-center justify-center">
            <FaGraduationCap size={16} />
          </div>
          <span className="font-bold text-lg tracking-tight">ProjectReview</span>
        </div>

        <div className="p-4 h-full flex flex-col overflow-y-auto">
          <div className="mb-8 mt-2">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-emerald shrink-0 border border-white/5 shadow-sm overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${studentData.name}&backgroundColor=10b981&textColor=ffffff`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm leading-tight text-white truncate">{studentData.name}</h2>
                <p className="text-xs text-white/50 truncate font-medium">{studentData.registrationId}</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1 w-full text-sm font-medium">
            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === "/dashboard" 
                  ? "bg-emerald text-white shadow-lg shadow-emerald/20" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FaHome size={16} className={pathname === "/dashboard" ? "text-white" : "text-white/50"} />
              <span>Overview</span>
            </Link>
            
            <Link
              href="/dashboard/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === "/dashboard/profile"
                  ? "bg-emerald text-white shadow-lg shadow-emerald/20" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FaUserGraduate size={16} className={pathname === "/dashboard/profile" ? "text-white" : "text-white/50"} />
              <span>Members</span>
            </Link>
            
            <Link
              href="/dashboard/submit"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                pathname === "/dashboard/submit"
                  ? "bg-emerald text-white shadow-lg shadow-emerald/20" 
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <FaFileUpload size={16} className={pathname === "/dashboard/submit" ? "text-white" : "text-white/50"} />
              <span>Submit Project</span>
            </Link>

            <div className="pt-4 mt-4 border-t border-white/5">
              <Link
                href="/dashboard/chat"
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname === "/dashboard/chat"
                    ? "bg-emerald text-white shadow-lg shadow-emerald/20" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <FaComments size={16} className={pathname === "/dashboard/chat" ? "text-white" : "text-white/50"} />
                <span>Chat & Feedback</span>
              </Link>
            </div>
          </nav>

          <div className="mt-auto pt-4 pb-2">
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-medium text-sm"
            >
              <FaSignOutAlt size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-10 max-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-sidebar/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
