"use client";

import Link from "next/link";
import { FaGraduationCap, FaUserTie, FaCheckCircle, FaCode, FaCloudUploadAlt, FaLock } from "react-icons/fa";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center text-white shadow-lg">
<FaGraduationCap className="text-green-700" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">ProjectReview</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="btn btn-secondary btn-sm">
            Student Login
          </Link>
          <Link href="/admin/login" className="btn btn-primary btn-sm">
            Admin Portal
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-5xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 transition-all">
            Streamline Your <br />
            <span className="text-gradient gradient-accent">Final Year Projects</span>
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            The all-in-one platform for students to submit work and faculty to track progress, 
            review research papers, and manage project batches effortlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="btn btn-primary px-10 py-4 text-lg">
              Get Started as Student
            </Link>
            <Link href="/admin/login" className="btn btn-secondary px-10 py-4 text-lg">
              Faculty Access
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 mb-12 w-full">
          <div className="stat-card flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <FaCode size={24} />
            </div>
            <h3 className="text-xl font-semibold">Code & Web URLs</h3>
            <p className="text-secondary text-sm">
              Submit your GitHub repositories and live website links for direct access.
            </p>
          </div>
          <div className="stat-card flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FaCloudUploadAlt size={24} />
            </div>
            <h3 className="text-xl font-semibold">Media Uploads</h3>
            <p className="text-secondary text-sm">
              Upload multiple screenshots and research paper PDFs securely via Cloudinary.
            </p>
          </div>
          <div className="stat-card flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
              <FaLock size={24} />
            </div>
            <h3 className="text-xl font-semibold">Submission Control</h3>
            <p className="text-secondary text-sm">
              Faculty can lock submissions per batch after deadlines for fair evaluation.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-4 text-sm text-muted">
          <p>© 2026 College Project Review System. Built for academic excellence.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Support</a>
            <a href="/admin/login" className="hover:text-accent transition-colors font-medium">Faculty Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
