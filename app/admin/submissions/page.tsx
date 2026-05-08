"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, where } from "firebase/firestore";
import { Submission, Batch, Student } from "@/lib/types";
import { FaFilter, FaSearch, FaEye, FaGithub, FaLink, FaLayerGroup } from "react-icons/fa";
import SubmissionSidebar from "@/components/SubmissionSidebar";

export default function SubmissionsOverview() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [loading, setLoading] = useState(true);
  const [filterBatch, setFilterBatch] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [subSnap, batchSnap, studentSnap] = await Promise.all([
          getDocs(query(collection(db, "submissions"), orderBy("updatedAt", "desc"))),
          getDocs(query(collection(db, "batches"), orderBy("year", "desc"))),
          getDocs(collection(db, "students"))
        ]);
        
        setSubmissions(subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
        setBatches(batchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch)));
        
        const studentsMap: Record<string, Student> = {};
        studentSnap.docs.forEach(doc => {
          studentsMap[doc.id] = { id: doc.id, ...doc.data() } as Student;
        });
        setStudents(studentsMap);
      } catch (err) {
        console.error("Error fetching admin submissions:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSubmissions = submissions.filter(s => {
    const matchesBatch = filterBatch === "all" || s.batchId === filterBatch;
    const matchesSearch = s.groupId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesSearch;
  });

  const handleReviewClick = (sub: Submission) => {
    setSelectedSubmission(sub);
    setSidebarOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Project Submissions</h1>
        <p className="text-secondary">View and review all student project entries.</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            <FaSearch size={14} />
          </span>
          <input 
            type="text" 
            placeholder="Search by Reg ID or Group..." 
            className="input !pl-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <FaFilter className="text-text-muted" />
          <select 
            className="select min-w-[180px]"
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
          >
            <option value="all">All Batches</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Group</th>
              <th>Semester</th>
              <th>Status</th>
              <th>Links</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={6}><div className="h-10 skeleton" /></td></tr>
              ))
            ) : filteredSubmissions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-text-muted italic">No submissions found matching filters.</td></tr>
            ) : (
              filteredSubmissions.map((sub) => (
                <tr key={sub.id}>
                  <td><span className="badge badge-info">{sub.groupId}</span></td>
                  <td>
                    <span className="flex items-center gap-2">
                      <FaLayerGroup size={12} className="text-accent" />
                      {batches.find(b => b.id === sub.batchId)?.name || "Unknown"}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      sub.reviewStatus === 'review_done' ? 'badge-success' : 
                      sub.reviewStatus === 'under_review' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {sub.reviewStatus === 'review_done' ? 'Done' : 
                       sub.reviewStatus === 'under_review' ? 'Reviewing' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-3">
                      <a href={sub.githubUrl} target="_blank" className="text-text-muted hover:text-accent"><FaGithub /></a>
                      {sub.websiteUrl && <a href={sub.websiteUrl} target="_blank" className="text-text-muted hover:text-emerald-400"><FaLink /></a>}
                    </div>
                  </td>
                  <td className="text-xs">{new Date(sub.updatedAt).toLocaleString()}</td>
                  <td>
                    <button 
                      onClick={() => handleReviewClick(sub)}
                      className="btn btn-secondary btn-sm gap-2"
                    >
                      <FaEye size={14} /> Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <SubmissionSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        submission={selectedSubmission!} 
        student={selectedSubmission ? students[selectedSubmission.studentId] : undefined}
        batch={selectedSubmission ? batches.find(b => b.id === selectedSubmission.batchId) : undefined}
      />
    </div>
  );
}
