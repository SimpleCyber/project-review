"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaLayerGroup, FaUsers } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where, limit } from "firebase/firestore";
import { Batch } from "@/lib/types";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [regId, setRegId] = useState("");
  const [groupId, setGroupId] = useState("B1");
  const [batchId, setBatchId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [availableGroups, setAvailableGroups] = useState<string[]>(["B1", "B2", "B3", "B4", "B5"]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingBatches, setFetchingBatches] = useState(true);
  
  const { register, signInWithGoogle } = useAuth();
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

  const handleBatchChange = (id: string) => {
    setBatchId(id);
    const selected = batches.find(b => b.id === id);
    if (selected) updateGroupsForBatch(selected);
  };

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
      return setError("Please select a batch. If no batches exist, please wait for faculty setup.");
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
        throw new Error(`Group ${groupId} is already registered for this batch.`);
      }

      await register(regId, email, password, name, groupId, batchId);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed. Registration ID might already be in use.");
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
            <h1 className="text-3xl font-extrabold text-sidebar mb-2 tracking-tight">Create an account</h1>
            <p className="text-text-secondary">Enter your details to create your workspace.</p>
          </div>

          {error && (
            <div className="alert alert-error mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="name">
                <FaUser className="text-emerald" size={14} /> Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                className="input py-3 !bg-white !border-gray-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="email">
                <FaEnvelope className="text-emerald" size={14} /> Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="john@university.edu"
                className="input py-3 !bg-white !border-gray-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="regId">
                <FaUser className="text-emerald" size={14} /> Registration ID
              </label>
              <input
                id="regId"
                type="text"
                placeholder="CS2026001"
                className="input py-3 !bg-white !border-gray-200"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="batch">
                <FaLayerGroup className="text-emerald" size={14} /> Batch / Year
              </label>
              <select
                id="batch"
                className="select py-3 !bg-white !border-gray-200"
                value={batchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                required
                disabled={fetchingBatches}
              >
                {fetchingBatches ? (
                  <option>Loading...</option>
                ) : batches.length > 0 ? (
                  batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))
                ) : (
                  <option value="">No batches</option>
                )}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="label text-sm font-semibold text-sidebar mb-1 flex items-center gap-2" htmlFor="groupId">
                <FaUsers className="text-emerald" size={14} /> Group ID
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
