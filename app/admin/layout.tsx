"use client";

import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FaChartPie, FaLayerGroup, FaThList, FaSignOutAlt, 
  FaUserTie, FaBars, FaTimes 
} from "react-icons/fa";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!loading && (!user || !isAdmin)) {
      router.push("/admin/login");
    }
  }, [user, isAdmin, loading, router, pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8" />
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
    <div className="min-h-screen gradient-bg flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 right-4 z-50 p-2 glass-card lg:hidden text-accent"
      >
        {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-card rounded-none border-y-0 border-l-0 translate-x-0 transition-transform duration-300
        lg:static lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shadow-lg">
              <FaUserTie size={22} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight">Faculty Panel</h2>
              <p className="text-xs text-text-muted">Admin Dashboard</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${pathname === item.href 
                    ? "bg-accent text-white shadow-lg shadow-accent/20" 
                    : "text-text-secondary hover:bg-accent-light hover:text-accent"}
                `}
              >
                <item.icon size={18} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <FaSignOutAlt size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-x-hidden p-6 lg:p-10">
        <div className="max-w-7xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
