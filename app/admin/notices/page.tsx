"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, orderBy, addDoc, doc, getDoc, where } from "firebase/firestore";
import { Batch, Notice, NoticeReadReceipt } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { FaBell, FaPlus, FaCheckCircle, FaClock, FaUsers, FaCalendarAlt, FaTimes, FaHistory, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { startAfter, limit as firestoreLimit } from "firebase/firestore";

const DEFAULT_NOTICES = [
  { title: "Upcoming Review", content: "Dear Students, your project review is scheduled on [Date] at [Time]. Please be prepared with your PPTs." },
  { title: "Next Review Scheduled", content: "The next phase of project review will take place on [Date]. Ensure all code is pushed to GitHub." },
  { title: "Final Submission Deadline", content: "Reminder: The final project submission deadline is [Date]. Late submissions will not be accepted." },
];

export default function ManageNotices() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [receipts, setReceipts] = useState<NoticeReadReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form State
  const [selectedBatch, setSelectedBatch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedNoticeId, setSelectedNoticeId] = useState<string | null>(null);

  // History State
  const [showHistory, setShowHistory] = useState(false);
  const [historyNotices, setHistoryNotices] = useState<Notice[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [batchSnap, noticeSnap, receiptSnap] = await Promise.all([
          getDocs(query(collection(db, "batches"), orderBy("year", "desc"))),
          getDocs(query(collection(db, "notices"), orderBy("createdAt", "desc"))),
          getDocs(collection(db, "notice_receipts"))
        ]);

        setBatches(batchSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Batch)));
        setNotices(noticeSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice)));
        setReceipts(receiptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as NoticeReadReceipt)));
      } catch (err) {
        console.error("Error fetching notices data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSendNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch || !title || !content) return setError("Please fill all fields.");

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const noticeData = {
        batchId: selectedBatch,
        title,
        content,
        authorId: user?.uid || "admin",
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, "notices"), noticeData);
      const newNotice = { id: docRef.id, ...noticeData } as Notice;
      
      setNotices(prev => [newNotice, ...prev]);
      setSuccess("Notice sent successfully to all students in the selected batch!");
      setTitle("");
      setContent("");
    } catch (err: any) {
      setError(err.message || "Failed to send notice.");
    } finally {
      setSending(false);
    }
  };

  const useTemplate = (template: typeof DEFAULT_NOTICES[0]) => {
    setTitle(template.title);
    setContent(template.content);
  };

  const getReadCount = (noticeId: string) => {
    return receipts.filter(r => r.noticeId === noticeId).length;
  };

  const fetchHistory = async (isNext = true) => {
    setHistoryLoading(true);
    try {
      let q = query(
        collection(db, "notices"), 
        orderBy("createdAt", "desc"), 
        firestoreLimit(2)
      );

      if (isNext && lastVisible) {
        q = query(q, startAfter(lastVisible));
      }

      const snap = await getDocs(q);
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notice));
      
      if (docs.length < 2) setHasMore(false);
      else setHasMore(true);

      setHistoryNotices(docs);
      setLastVisible(snap.docs[snap.docs.length - 1]);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openHistory = () => {
    setShowHistory(true);
    fetchHistory(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notice Management</h1>
        <p className="text-secondary">Announce reviews, deadlines, and important updates to specific batches.</p>
      </div>

      {(success || error) && (
        <div className={`alert ${success ? 'alert-success' : 'alert-error'}`}>
          {success || error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Create Notice */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FaPlus className="text-accent" /> Create New Notice
            </h2>
            
            <form onSubmit={handleSendNotice} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-text-muted mb-2 block">Target Batch</label>
                <select 
                  className="select w-full"
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  required
                >
                  <option value="">Select a Batch (Year/Semester)</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.year})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-text-muted mb-2 block">Notice Title</label>
                <input 
                  type="text" 
                  className="input w-full" 
                  placeholder="e.g. Review Date Announcement"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-text-muted mb-2 block">Message Content</label>
                <textarea 
                  className="input w-full min-h-[150px] py-3" 
                  placeholder="Write your notice here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full py-4 gap-2"
                disabled={sending}
              >
                {sending ? <div className="spinner-sm" /> : <FaBell />}
                {sending ? "Sending..." : "Blast Notice to Students"}
              </button>
            </form>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaClock className="text-blue-400" /> Latest Notice
              </h2>
              <button 
                onClick={openHistory}
                className="flex items-center gap-2 text-[10px] font-bold uppercase text-text-muted hover:text-accent transition-colors bg-bg-secondary px-3 py-1.5 rounded-lg border border-border"
              >
                <FaHistory size={12} /> View History
              </button>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                <div className="h-40 w-full skeleton" />
              ) : notices.length === 0 ? (
                <p className="text-center py-10 text-text-muted italic">No notices sent yet.</p>
              ) : (
                <div key={notices[0].id} className="p-4 rounded-xl border border-border bg-bg-secondary/30">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-text-primary">{notices[0].title}</h4>
                      <p className="text-[10px] font-bold uppercase text-accent mt-0.5">
                        Batch: {batches.find(b => b.id === notices[0].batchId)?.name || "Unknown"}
                      </p>
                    </div>
                    <span className="text-[10px] text-text-muted font-bold">{new Date(notices[0].createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-secondary mb-4">{notices[0].content}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      <FaUsers size={12} />
                      {getReadCount(notices[0].id)} Confirmed
                    </div>
                    <button 
                      onClick={() => setSelectedNoticeId(notices[0].id)}
                      className="text-[10px] font-bold uppercase text-accent hover:underline"
                    >
                      View Receipts
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Modal */}
        {showHistory && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card w-full max-w-2xl overflow-hidden animate-scale-up">
              <div className="p-6 border-b border-border flex justify-between items-center bg-bg-primary/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <FaHistory />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Notice History</h3>
                    <p className="text-xs text-secondary">Browse previous announcements and read receipts</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                {historyLoading ? (
                  Array(3).fill(0).map((_, i) => <div key={i} className="h-24 w-full skeleton" />)
                ) : historyNotices.length === 0 ? (
                  <p className="text-center py-20 text-text-muted italic">No history found.</p>
                ) : (
                  historyNotices.map(notice => (
                    <div key={notice.id} className="p-4 rounded-xl border border-border hover:border-accent/30 transition-all bg-bg-secondary/30">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-text-primary">{notice.title}</h4>
                        <span className="text-[10px] text-text-muted font-bold">{new Date(notice.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-secondary line-clamp-2 mb-3">{notice.content}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className="text-[10px] font-bold text-accent uppercase">
                          Batch: {batches.find(b => b.id === notice.batchId)?.name || "Unknown"}
                        </span>
                        <button 
                          onClick={() => setSelectedNoticeId(notice.id)}
                          className="text-[10px] font-bold text-accent hover:underline flex items-center gap-1"
                        >
                          <FaUsers size={12} /> {getReadCount(notice.id)} Receipts
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-bg-secondary/50 border-t border-border flex items-center justify-between">
                <p className="text-xs text-text-muted italic">Showing 2 notices per page</p>
                <div className="flex gap-2">
                  <button 
                    disabled={true} 
                    className="btn btn-secondary btn-sm h-9 px-4 gap-2 opacity-50 cursor-not-allowed"
                  >
                    <FaChevronLeft size={10} /> Previous
                  </button>
                  <button 
                    onClick={() => fetchHistory(true)}
                    disabled={!hasMore || historyLoading}
                    className="btn btn-secondary btn-sm h-9 px-4 gap-2"
                  >
                    Next <FaChevronRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Read Receipts */}
        {selectedNoticeId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="glass-card w-full max-w-lg overflow-hidden animate-scale-up">
              <div className="p-6 border-b border-border flex justify-between items-center bg-bg-primary/50">
                <div>
                  <h3 className="text-xl font-bold">Read Receipts</h3>
                  <p className="text-xs text-secondary">
                    Groups that have acknowledged: <span className="text-accent">{notices.find(n => n.id === selectedNoticeId)?.title}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedNoticeId(null)}
                  className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {receipts.filter(r => r.noticeId === selectedNoticeId).length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-text-muted italic">No group has acknowledged this notice yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {receipts.filter(r => r.noticeId === selectedNoticeId).map(receipt => (
                      <div key={receipt.id} className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                          {receipt.groupId}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-emerald-800">Group {receipt.groupId}</p>
                          <p className="text-[10px] text-emerald-600 font-medium">
                            {new Date(receipt.readAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </p>
                        </div>
                        <FaCheckCircle className="ml-auto text-emerald-500" size={14} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-bg-secondary/50 border-t border-border flex justify-end">
                <button 
                  onClick={() => setSelectedNoticeId(null)}
                  className="btn btn-secondary px-6"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Templates */}
        <div className="space-y-6">
          <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FaCalendarAlt className="text-indigo-400" /> Quick Templates
            </h2>
            <div className="space-y-3">
              {DEFAULT_NOTICES.map((template, i) => (
                <button
                  key={i}
                  onClick={() => useTemplate(template)}
                  className="w-full text-left p-4 rounded-xl border border-border bg-white hover:border-indigo-400 hover:shadow-md transition-all group"
                >
                  <p className="text-xs font-bold uppercase text-indigo-500 mb-1">{template.title}</p>
                  <p className="text-[10px] text-text-muted line-clamp-2">{template.content}</p>
                  <div className="mt-2 text-[10px] font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to Use Template →
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 border-amber-200 bg-amber-50/30">
            <h3 className="text-sm font-bold text-amber-800 mb-2">How it works</h3>
            <ul className="text-xs space-y-2 text-amber-700 list-disc pl-4">
              <li>Notices are visible to all students in the selected batch.</li>
              <li>Students must confirm they have read the notice.</li>
              <li>You can track exactly how many students have acknowledged it.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
