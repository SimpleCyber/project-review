"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { Batch } from "@/lib/types";
import { FaGraduationCap, FaUsers, FaLock, FaLayerGroup, FaCalendarAlt } from "react-icons/fa";

export default function StudentLoginPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [semester, setSemester] = useState<number>(1);
  const [groupId, setGroupId] = useState("B1");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [fetchingBatches, setFetchingBatches] = useState(true);
  const [availableGroups, setAvailableGroups] = useState<string[]>(["B1", "B2", "B3", "B4", "B5"]);

  const { login, user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [user, isAdmin, authLoading, router]);

  useEffect(() => {
    async function fetchBatches() {
      try {
        const q = query(collection(db, "batches"), orderBy("year", "desc"), orderBy("batchNumber", "asc"));
        const snapshot = await getDocs(q);
        const batchData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
        setBatches(batchData);
        if (batchData.length > 0) {
          setYear(batchData[0].year);
          setSemester(batchData[0].batchNumber);
          updateGroupsForBatch(batchData[0]);
        }
      } catch (err) {
        console.error("Error fetching batches:", err);
      } finally {
        setFetchingBatches(false);
      }
    }
    fetchBatches();
  }, []);

  const updateGroupsForBatch = (batch: Batch) => {
    const count = batch.maxGroups || 6;
    const groups = Array.from({ length: count }, (_, i) => `B${i + 1}`);
    setAvailableGroups(groups);
    setGroupId(groups[0]);
  };

  // When year or semester changes, find the matching batch and update groups
  useEffect(() => {
    const matchingBatch = batches.find(b => b.year === year && b.batchNumber === semester);
    if (matchingBatch) {
      updateGroupsForBatch(matchingBatch);
    }
  }, [year, semester, batches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(year, semester, groupId, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials. Please check your group number and password.");
    } finally {
      setLoading(false);
    }
  };

  // Get unique years and semesters from available batches
  const uniqueYears = [...new Set(batches.map(b => b.year))].sort((a, b) => b - a);
  const availableSemesters = batches
    .filter(b => b.year === year)
    .map(b => b.batchNumber)
    .sort((a, b) => a - b);

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
        <div className="w-full max-w-[440px] animate-fade-in">
          
          {/* Logo for mobile only */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded bg-emerald text-white font-bold flex items-center justify-center">
              <FaGraduationCap size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-sidebar">ProjectReview</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-sidebar mb-2 tracking-tight">Welcome back</h1>
            <p className="text-text-secondary">Select your group details to access your workspace.</p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="year">
                  <FaCalendarAlt className="text-emerald" size={14} /> Year
                </label>
                <select
                  id="year"
                  className="select py-3 !bg-white !border-gray-200"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  disabled={fetchingBatches}
                >
                  {fetchingBatches ? (
                    <option>Loading...</option>
                  ) : uniqueYears.length > 0 ? (
                    uniqueYears.map((y) => (
                      <option key={y} value={y}>{y}-{y + 1}</option>
                    ))
                  ) : (
                    <option value="">No batches</option>
                  )}
                </select>
              </div>

              <div>
                <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="semester">
                  <FaLayerGroup className="text-emerald" size={14} /> Semester
                </label>
                <select
                  id="semester"
                  className="select py-3 !bg-white !border-gray-200"
                  value={semester}
                  onChange={(e) => setSemester(parseInt(e.target.value))}
                  disabled={fetchingBatches}
                >
                  {availableSemesters.length > 0 ? (
                    availableSemesters.map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))
                  ) : (
                    <option value={1}>Semester 1</option>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="groupId">
                <FaUsers className="text-emerald" size={14} /> Group Number
              </label>
              <select
                id="groupId"
                className="select py-3 !bg-white !border-gray-200"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              >
                {availableGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
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
              disabled={loading || fetchingBatches}
            >
              {loading ? <div className="spinner" /> : "Sign In"}
            </button>
          </form>

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
