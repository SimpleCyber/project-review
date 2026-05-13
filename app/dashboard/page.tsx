"use client";

import { useAuth } from "@/lib/AuthContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { Batch, Submission } from "@/lib/types";
import { FaFileUpload, FaCheckCircle, FaExclamationTriangle, FaGithub, FaLink, FaFilePdf, FaYoutube, FaUser, FaEdit, FaSave, FaTimes, FaBell, FaCheck } from "react-icons/fa";
import Link from "next/link";
import { updateDoc, setDoc } from "firebase/firestore";
import SubmissionSidebar from "@/components/SubmissionSidebar";
import { Notice, NoticeReadReceipt } from "@/lib/types";

export default function StudentDashboard() {
  const { studentData, setStudentData } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [readReceipts, setReadReceipts] = useState<string[]>([]);
  
  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBatchId, setEditBatchId] = useState("");
  const [editGroupId, setEditGroupId] = useState("");
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (!studentData) return;
      try {
        // Fetch submission
        const q = query(collection(db, "submissions"), where("studentId", "==", studentData.id), limit(1));
        const subSnap = await getDocs(q);
        if (!subSnap.empty) {
          setSubmission({ id: subSnap.docs[0].id, ...subSnap.docs[0].data() } as Submission);
        }

        // Fetch current batch info
        const batchDoc = await getDoc(doc(db, "batches", studentData.batchId));
        if (batchDoc.exists()) {
          const bData = { id: batchDoc.id, ...batchDoc.data() } as Batch;
          setBatch(bData);
        }

        // Fetch all batches for editing
        const allBatchesSnap = await getDocs(query(collection(db, "batches"), orderBy("year", "desc")));
        const allBatches = allBatchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch));
        setBatches(allBatches);

        // Fetch Notices
        const noticeSnap = await getDocs(query(collection(db, "notices"), where("batchId", "==", studentData.batchId), orderBy("createdAt", "desc")));
        const noticeData = noticeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
        setNotices(noticeData);

        // Fetch Read Receipts for this group
        const receiptSnap = await getDocs(query(collection(db, "notice_receipts"), where("batchId", "==", studentData.batchId), where("groupId", "==", studentData.groupId)));
        setReadReceipts(receiptSnap.docs.map(doc => doc.data().noticeId));
      } catch (err) {
        console.error("Error fetching student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentData]);

  const handleStartEdit = () => {
    if (!studentData) return;
    setEditName(studentData.name);
    setEditBatchId(studentData.batchId);
    setEditGroupId(studentData.groupId);
    
    const currentBatch = batches.find(b => b.id === studentData.batchId);
    if (currentBatch) {
      updateGroupsForBatch(currentBatch, studentData.groupId);
    }
    setIsEditingProfile(true);
  };

  const updateGroupsForBatch = (b: Batch, currentGroup?: string) => {
    const count = b.maxGroups || 6;
    const groups = Array.from({ length: count }, (_, i) => `B${i + 1}`);
    setAvailableGroups(groups);
    if (currentGroup && groups.includes(currentGroup)) {
        setEditGroupId(currentGroup);
    } else {
        setEditGroupId(groups[0]);
    }
  };

  const onBatchChange = (id: string) => {
    setEditBatchId(id);
    const selected = batches.find(b => b.id === id);
    if (selected) updateGroupsForBatch(selected);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentData) return;
    setError("");
    setUpdating(true);

    try {
      const updatedData = {
        ...studentData,
        name: editName,
        batchId: editBatchId,
        groupId: editGroupId,
      };

      await updateDoc(doc(db, "students", studentData.id), {
        name: editName,
        batchId: editBatchId,
        groupId: editGroupId,
      });

      setStudentData(updatedData);
      setIsEditingProfile(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAcknowledgeNotice = async (noticeId: string) => {
    if (!studentData) return;
    const receiptId = `${noticeId}_${studentData.groupId}`;
    try {
      await setDoc(doc(db, "notice_receipts", receiptId), {
        id: receiptId,
        noticeId,
        groupId: studentData.groupId,
        batchId: studentData.batchId,
        readAt: Date.now()
      });
      setReadReceipts(prev => [...prev, noticeId]);
    } catch (err) {
      console.error("Error acknowledging notice:", err);
    }
  };

  if (loading) return <div className="space-y-6"><div className="h-40 w-full skeleton" /><div className="h-60 w-full skeleton" /></div>;

  return (
    <div className="space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">Welcome, {studentData?.name}!</h1>
        <p className="text-secondary">Project submission status for {batch?.name || "your batch"}.</p>
      </div>

      {batch?.isLocked && (
        <div className="locked-banner">
          <FaExclamationTriangle className="text-amber-500" />
          <div>
            <p className="font-bold text-amber-500">Submissions are currently LOCKED</p>
            <p className="text-sm text-text-secondary">The faculty has frozen all changes for {batch.name}.</p>
          </div>
        </div>
      )}

      {(error || isEditingProfile) && error && (
        <div className="alert alert-error animate-fade-in">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card !p-5">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <FaCheckCircle className={submission ? "text-emerald-500" : "text-text-muted"} /> 
            Submission Status
          </h2>
          
          {submission ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col justify-between items-start gap-2">
                <div>
                  <p className="text-sm text-emerald-600 font-medium font-bold">Your project has been successfully uploaded.</p>
                  <p className="text-xs text-text-muted mt-1">Last updated: {new Date(submission.updatedAt).toLocaleString()}</p>
                </div>
                
                {/* Admin Status Display */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Review Status:</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                    submission.reviewStatus === 'review_done' ? 'bg-emerald-100 text-emerald-700' : 
                    submission.reviewStatus === 'under_review' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {submission.reviewStatus === 'review_done' ? 'Accepted' : 
                     submission.reviewStatus === 'under_review' ? 'Under Review' : 'Pending Review'}
                  </span>
                </div>
                {submission.reviewComment && (
                  <div className="mt-2 p-3 bg-white/50 rounded border border-emerald-500/10 text-sm text-gray-800">
                    <strong className="block text-[10px] uppercase text-emerald-600 mb-1">Faculty Feedback:</strong>
                    {submission.reviewComment}
                  </div>
                )}
              </div>
              <Link href="/dashboard/submit" className="btn btn-secondary w-full">
                Edit Submission
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <p className="text-sm text-amber-500 font-medium font-bold">You haven't submitted your project yet.</p>
                <p className="text-xs text-text-muted mt-1">Ensure all required files are ready before submission.</p>
              </div>
              {!batch?.isLocked && (
                <Link href="/dashboard/submit" className="btn btn-primary w-full">
                  Submit Now
                </Link>
              )}
            </div>
          )}
        </div>


        <div className="stat-card !p-5 group transition-all hover:border-accent/40">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-semibold py-5">User Details</h2>
          </div>
          
          {isEditingProfile ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold uppercase text-text-muted">Full Name</label>
                  <input 
                    type="text" 
                    className="input input-sm h-10 w-full" 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-muted">Batch</label>
                    <select 
                      className="input input-sm h-10 w-full"
                      value={editBatchId}
                      onChange={(e) => onBatchChange(e.target.value)}
                    >
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-text-muted">Group</label>
                    <select 
                      className="input input-sm h-10 w-full"
                      value={editGroupId}
                      onChange={(e) => setEditGroupId(e.target.value)}
                    >
                      {availableGroups.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn btn-primary flex-1 btn-sm h-10 gap-2" disabled={updating}>
                    {updating ? <div className="spinner" /> : <><FaSave size={14} /> Save</>}
                  </button>
                  <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-secondary btn-sm h-10">
                    <FaTimes />
                  </button>
                </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Name</span>
                <span className="font-medium text-text-primary">{studentData?.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Batch</span>
                <span className="font-medium">{batch?.name || "Loading..."}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Group</span>
                <span className="font-medium px-2 py-0.5 bg-accent-light text-accent rounded-md">{studentData?.groupId}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-border pt-2 mt-2">
                <span className="text-text-muted">Faculty Reviews</span>
                <span className="font-medium text-accent">Active</span>
              </div>
              <div className="pt-4 mt-2 border-t border-border/50">
                <Link href="/dashboard/profile" className="btn btn-secondary btn-sm w-full gap-2 transition-all hover:bg-accent hover:text-white">
                  <FaUser size={14} /> Manage Project Members
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notices Section (Refined) - Moved below the grid */}
        <div className="space-y-4">
          <div className="glass-card !p-5">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <FaBell className="text-accent" /> Notices & Announcements
            </h2>
            
            {notices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-bg-primary flex items-center justify-center text-text-muted mb-3">
                  <FaBell size={20} />
                </div>
                <p className="text-sm text-text-muted italic">No new notices from faculty.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notices.map(notice => {
                  const isRead = readReceipts.includes(notice.id);
                  return (
                    <div key={notice.id} className={`p-4 rounded-xl border transition-all ${isRead ? 'bg-bg-primary/30 border-border opacity-60' : 'bg-accent/5 border-accent/20 ring-1 ring-accent/10'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-bold text-sm ${isRead ? 'text-text-muted' : 'text-text-primary'}`}>{notice.title}</h3>
                        <span className="text-[10px] text-text-muted font-bold whitespace-nowrap">{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className={`text-xs mb-3 ${isRead ? 'text-text-muted' : 'text-secondary'}`}>{notice.content}</p>
                      {!isRead && (
                        <button 
                          onClick={() => handleAcknowledgeNotice(notice.id)}
                          className="w-full py-2 bg-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
                        >
                          <FaCheck size={10} /> Confirm Receipt
                        </button>
                      )}
                      {isRead && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase">
                          <FaCheckCircle size={10} /> Confirmed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {submission && (
        <SubmissionSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
          submission={submission} 
          student={studentData!} 
          batch={batch!} 
        />
      )}
    </div>
  );
}
