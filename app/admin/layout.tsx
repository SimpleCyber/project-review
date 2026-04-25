"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FaChartPie, FaLayerGroup, FaThList, FaSignOutAlt, 
  FaUserTie, FaBars, FaTimes, FaGraduationCap 
} from "react-icons/fa";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!loading) {
      if (!user) {
        router.push("/");
      } else if (!isAdmin) {
        router.push("/dashboard");
      }
    }
  }, [user, isAdmin, loading, router, pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8 text-emerald" />
          <p className="text-secondary text-sm animate-pulse">Verifying faculty access...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "Overview", icon: FaChartPie, href: "/admin" },
    { name: "Manage Batches", icon: FaLayerGroup, href: "/admin/batches" },
    { name: "All Submissions", icon: FaThList, href: "/admin/submissions" },
  ];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col lg:flex-row text-text-primary">
      {/* Mobile Top Mobile Nav */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-sidebar text-white z-50 shadow-sm border-b border-sidebar">
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
        fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-white shadow-xl transition-transform duration-300 flex flex-col pt-16 lg:pt-0
        lg:sticky lg:top-0 lg:h-screen lg:overflow-hidden lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand / Logo (Hidden on mobile top nav but visible on desktop) */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="w-8 h-8 rounded bg-emerald text-white font-bold flex items-center justify-center">
            <FaGraduationCap size={16} />
          </div>
          <span className="font-bold text-lg tracking-tight">ProjectReview</span>
        </div>

        <div className="p-4 h-full flex flex-col overflow-y-auto">
          <div className="mb-8 mt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-amber-400 shrink-0 border border-white/5 shadow-sm overflow-hidden">
                 <FaUserTie size={18} />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm leading-tight text-white truncate">Faculty Panel</h2>
                <p className="text-xs text-white/50 truncate font-medium">Administrator</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1.5 flex-1 w-full text-sm font-medium">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  pathname === item.href 
                    ? "bg-emerald text-white shadow-lg shadow-emerald/20" 
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={16} className={pathname === item.href ? "text-white" : "text-white/50"} />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-4 pb-2 border-t border-white/5">
            <button 
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all font-medium text-sm"
            >
              <FaSignOutAlt size={16} />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden p-6 lg:p-10">
        <div className="max-w-7xl mx-auto animate-fade-in w-full">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-sidebar/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
