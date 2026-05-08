"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, limit, orderBy } from "firebase/firestore";
import { FaUsers, FaFileUpload, FaLayerGroup, FaCheckCircle } from "react-icons/fa";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubmissions: 0,
    activeBatches: 0,
  });
  const [recentSubs, setRecentSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [students, submissions, batches, recentSnap] = await Promise.all([
          getDocs(collection(db, "students")),
          getDocs(collection(db, "submissions")),
          getDocs(collection(db, "batches")),
          getDocs(query(collection(db, "submissions"), orderBy("submittedAt", "desc"), limit(5)))
        ]);

        setStats({
          totalStudents: students.size,
          totalSubmissions: submissions.size,
          activeBatches: batches.docs.filter(d => !d.data().isLocked).length,
        });
        setRecentSubs(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Students", value: stats.totalStudents, icon: FaUsers, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Submissions", value: stats.totalSubmissions, icon: FaFileUpload, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Open Batches", value: stats.activeBatches, icon: FaLayerGroup, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Review Rate", value: stats.totalStudents ? Math.round((stats.totalSubmissions/stats.totalStudents)*100) + "%" : "0%", icon: FaCheckCircle, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Faculty Dashboard</h1>
        <p className="text-secondary">Track student participation and project submissions in real-time.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
            <p className="text-text-muted text-sm font-medium">{card.label}</p>
            <h3 className="text-3xl font-bold mt-1">
              {loading ? <div className="h-8 w-16 skeleton" /> : card.value}
            </h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => <div key={i} className="h-12 w-full skeleton" />)
            ) : recentSubs.length === 0 ? (
              <p className="text-text-muted text-sm italic">No submissions yet.</p>
            ) : (
              recentSubs.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl bg-bg-primary/50 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center text-accent">
                      <FaFileUpload size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Group {sub.groupId}</p>
                      <p className="text-xs text-text-muted">{batches.find(b => b.id === sub.batchId)?.name || "Unknown Batch"}</p>
                    </div>
                  </div>
                  <a href={`/admin/submissions/${sub.id}`} className="btn btn-secondary btn-sm px-3">View</a>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-accent-light rounded-full flex items-center justify-center text-accent mb-4">
            <FaLayerGroup size={32} />
          </div>
          <h2 className="text-xl font-bold mb-2">Batch Management</h2>
          <p className="text-secondary text-sm mb-6 max-w-xs">
            Start by creating a new batch so students can register and submit their projects.
          </p>
          <a href="/admin/batches" className="btn btn-primary w-full max-w-xs">
            Manage Batches
          </a>
        </div>
      </div>
    </div>
  );
}
