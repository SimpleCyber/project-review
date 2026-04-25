"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { FaGraduationCap, FaLock, FaUser, FaUsers, FaLayerGroup, FaEnvelope, FaGoogle } from "react-icons/fa";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { Batch, GROUP_IDS, GroupId } from "@/lib/types";

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
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6 py-12">
      <div className="w-full max-w-lg glass-card p-8 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center text-white shadow-lg mb-4">
            <FaGraduationCap size={28} />
          </div>
          <h1 className="text-2xl font-bold">Student Registration</h1>
          <p className="text-secondary text-sm mt-2">Create your account to submit your project</p>
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className="label" htmlFor="name">Full Name</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaUser size={14} />
              </span>
              <input
                id="name"
                type="text"
                placeholder="e.g. John Doe"
                className="input pl-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="label" htmlFor="email">Email Address</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaEnvelope size={14} />
              </span>
              <input
                id="email"
                type="email"
                placeholder="e.g. john@university.edu"
                className="input pl-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="regId">Registration ID</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaUser size={14} />
              </span>
              <input
                id="regId"
                type="text"
                placeholder="e.g. CS2026001"
                className="input pl-11"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="batch">Batch / Year</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaLayerGroup size={14} />
              </span>
              <select
                id="batch"
                className="select pl-11"
                value={batchId}
                onChange={(e) => handleBatchChange(e.target.value)}
                required
                disabled={fetchingBatches}
              >
                {fetchingBatches ? (
                  <option>Loading batches...</option>
                ) : batches.length > 0 ? (
                  batches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))
                ) : (
                  <option value="">No batches available</option>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="groupId">Group ID</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaUsers size={14} />
              </span>
              <select
                id="groupId"
                className="select pl-11"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                required
              >
                {availableGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="hidden md:block" />

          <div>
            <label className="label" htmlFor="password">Create Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaLock size={14} />
              </span>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input pl-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <FaLock size={14} />
              </span>
              <input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="input pl-11"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary md:col-span-2 py-3 mt-4"
            disabled={loading || fetchingBatches}
          >
            {loading ? <div className="spinner" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="h-px bg-border flex-1" />
          <span className="text-xs text-text-muted font-medium">OR</span>
          <div className="h-px bg-border flex-1" />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-secondary w-full py-3 mt-6 flex items-center justify-center gap-3"
        >
          <FaGoogle className="text-rose-500" />
          Continue with Google
        </button>

        <div className="mt-8 text-center text-sm">
          <p className="text-text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-semibold hover:underline">
              Sign in
            </Link>
          </p>
          <div className="mt-6 pt-6 border-t border-border">
            <Link href="/" className="text-text-muted hover:text-primary transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
