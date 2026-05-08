"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { FaGraduationCap, FaUser, FaLock, FaLayerGroup, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where, limit } from "firebase/firestore";
import { Batch } from "@/lib/types";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [groupId, setGroupId] = useState("B1");
  const [batchId, setBatchId] = useState("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [semester, setSemester] = useState<number>(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>(["B1", "B2", "B3", "B4", "B5"]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(true);
  
  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchBatches() {
      try {
        const q = query(collection(db, "batches"), orderBy("year", "desc"), orderBy("batchNumber", "asc"));
        const snapshot = await getDocs(q);
        const batchData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
        setBatches(batchData);
        if (batchData.length > 0) {
          setBatchId(batchData[0].id);
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

  // Get unique years and semesters from available batches
  const uniqueYears = [...new Set(batches.map(b => b.year))].sort((a, b) => b - a);
  const availableSemesters = batches
    .filter(b => b.year === year)
    .map(b => ({ batchNumber: b.batchNumber, id: b.id }))
    .sort((a, b) => a.batchNumber - b.batchNumber);

  // When year or semester changes, find the matching batch and update groups
  useEffect(() => {
    const matchingBatch = batches.find(b => b.year === year && b.batchNumber === semester);
    if (matchingBatch) {
      setBatchId(matchingBatch.id);
      updateGroupsForBatch(matchingBatch);
    }
  }, [year, semester, batches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    if (!batchId) {
      return setError("Please select a semester. If no semesters exist, please wait for faculty setup.");
    }

    setLoading(true);

    try {
      // Check if group is already registered in this batch
      const checkQuery = query(
        collection(db, "students"), 
        where("batchId", "==", batchId), 
        where("groupId", "==", groupId), 
        limit(1)
      );
      const checkSnap = await getDocs(checkQuery);
      if (!checkSnap.empty) {
        throw new Error(`Group ${groupId} is already registered for this semester.`);
      }

      await register(password, name, groupId, batchId, year, semester);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. This group may already be registered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-secondary text-text-primary">
      {/* Left Side - Dark Cover */}
      <div className="hidden lg:flex lg:w-1/2 lg:fixed lg:inset-y-0 lg:left-0 bg-sidebar text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-sidebar z-0 opacity-90"></div>
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
      <div className="w-full lg:w-1/2 lg:ml-[50%] flex flex-col items-center justify-center p-8 sm:p-12 min-h-screen">
        <div className="w-full max-w-[480px] animate-fade-in py-8">
          
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded bg-emerald text-white font-bold flex items-center justify-center">
              <FaGraduationCap size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-sidebar">ProjectReview</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-sidebar mb-2 tracking-tight">Register your group</h1>
            <p className="text-text-secondary">Set up your group workspace for project submission.</p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="name">
                <FaUser className="text-emerald" size={14} /> Group / Team Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Team Alpha or Group 15"
                className="input py-3 !bg-white !border-gray-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                  <option value="">No semesters</option>
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
                    <option key={s.batchNumber} value={s.batchNumber}>Semester {s.batchNumber}</option>
                  ))
                ) : (
                  <option value={1}>Semester 1</option>
                )}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="groupId">
                <FaUsers className="text-emerald" size={14} /> Group Number
              </label>
              <select
                id="groupId"
                className="select py-3 !bg-white !border-gray-200"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                required
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

            <div>
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="confirmPassword">
                <FaLock className="text-emerald" size={14} /> Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="input py-3 !bg-white !border-gray-200"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary md:col-span-2 py-3.5 mt-2 shadow-sm rounded-lg font-bold"
              disabled={loading || fetchingBatches}
            >
              {loading ? <div className="spinner mx-auto" /> : "Sign Up"}
            </button>
          </form>

          <div className="mt-10 text-center text-sm">
            <span className="text-text-muted">Already have an account? </span>
            <Link href="/login" className="text-emerald font-bold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
