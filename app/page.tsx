"use client";

import Link from "next/link";
import { FaGraduationCap, FaUserTie, FaCheckCircle, FaCode, FaCloudUploadAlt, FaLock, FaGithub, FaStar, FaCodeBranch } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [repoStats, setRepoStats] = useState({ stars: 0, forks: 0 });

  useEffect(() => {
    const fetchRepoStats = async () => {
      try {
        const res = await fetch("https://api.github.com/repos/SimpleCyber/project-review");
        const data = await res.json();
        if (data.stargazers_count !== undefined) {
          setRepoStats({
            stars: data.stargazers_count,
            forks: data.forks_count
          });
        }
      } catch (err) {
        console.error("Error fetching repo stats:", err);
      }
    };
    fetchRepoStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] text-slate-900 font-sans selection:bg-accent/20">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <FaGraduationCap size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">ProjectReview</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="https://github.com/SimpleCyber/project-review.git" 
              target="_blank" 
              className="flex items-center gap-4 p-2 px-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                <FaGithub size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-600 leading-none mb-1">Open Source</p>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                    <FaStar className="text-amber-500" size={10} /> {repoStats.stars}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-slate-600">
                    <FaCodeBranch className="text-indigo-500" size={10} /> {repoStats.forks}
                  </span>
                </div>
              </div>
            </a>
            
            <div className="h-6 w-[1px] bg-slate-200" />
            
            <div className="flex gap-3">
              <Link href="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
                Student Login
              </Link>
              <Link href="/admin/login" className="px-5 py-2.5 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-25 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 blur-[120px] rounded-full" />
            <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-indigo-100/40 blur-[120px] rounded-full" />
          </div>

          <div className="max-w-5xl mx-auto px-6 text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight leading-[1.1] text-slate-900">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Project Review</span> System
            </h1>
            
            {/* <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
              A centralized, transparent ecosystem for students to showcase their research 
              and faculty to provide real-time feedback.
            </p> */}

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link href="/register" className="group relative px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-2 overflow-hidden">
                <span className="relative z-10">Get Started as Student</span>
                <div className="w-full h-full absolute top-0 left-[-100%] group-hover:left-0 bg-white/10 transition-all duration-300" />
              </Link>
              <Link href="/admin/login" className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                Faculty Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="pb-25">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold mb-4">See it in Action 🚀</h2>
             
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-[2.5rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative bg-white p-2 rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden aspect-video">
                <iframe 
                  className="w-full h-full rounded-[1.5rem]"
                  src="https://www.youtube.com/embed/Cwmsv_LLqT4?si=glR3VdwJ_JL8WWmX" 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-slate-50 py-32 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <FaCode size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">Code & Repositories</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Seamlessly link your GitHub repositories and production URLs. Admins can access your source code and live demos with a single click.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <FaCloudUploadAlt size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">Paper Submissions</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Upload Synopsis, Reports, and Research Papers securely. The system handles large PDF files and tracks multiple review iterations.
                </p>
              </div>

              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                  <FaLock size={28} />
                </div>
                <h3 className="text-xl font-bold mb-4">Batch Control</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                  Advanced faculty controls to lock/unlock submissions per batch. Ensure fair evaluation by strictly enforcing project deadlines.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
            <FaGraduationCap size={24} className="text-slate-600" />
            <span className="font-bold text-slate-800">ProjectReview System</span>
          </div>
          
          <div className="flex gap-8 text-sm font-semibold text-slate-400">
            <a href="#" className="hover:text-emerald-600 transition-colors">Documentation</a>
            <a href="https://github.com/SimpleCyber/project-review" className="hover:text-emerald-600 transition-colors">GitHub</a>
            <a href="/admin/login" className="hover:text-slate-900 transition-colors">Faculty Login</a>
          </div>
          
          <p className="text-sm text-slate-400">© 2026 Academic Excellence Initiative. Built for Transparency.</p>
        </div>
      </footer>
    </div>
  );
}
