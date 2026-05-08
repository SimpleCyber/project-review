"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Submission, Batch, Student, ReviewStatus } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { 
  FaArrowLeft, FaGithub, FaLink, FaFilePdf, FaYoutube, 
  FaImage, FaUserFriends, FaEnvelope, FaIdCard, FaCheckCircle, FaClock, FaSearch, FaFilePowerpoint, FaFileAlt, FaFileContract, FaTag, FaCommentDots 
} from "react-icons/fa";
import CommentPanel from "@/components/CommentPanel";

const STATUS_CONFIG: Record<ReviewStatus, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  pending_review: { label: "Pending", icon: <FaClock size={12} />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  under_review: { label: "Reviewing", icon: <FaSearch size={12} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  review_done: { label: "Done", icon: <FaCheckCircle size={12} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
};

export default function SubmissionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  // Status updating state
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [showCommentInput, setShowCommentInput] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const subDoc = await getDoc(doc(db, "submissions", id as string));
        if (subDoc.exists()) {
          const subData = { id: subDoc.id, ...subDoc.data() } as Submission;
          setSubmission(subData);
          setReviewComment(subData.reviewComment || "");

          const [studDoc, batchDoc] = await Promise.all([
            getDoc(doc(db, "students", subData.studentId)),
            getDoc(doc(db, "batches", subData.batchId))
          ]);

          if (studDoc.exists()) setStudent({ id: studDoc.id, ...studDoc.data() } as Student);
          if (batchDoc.exists()) setBatch({ id: batchDoc.id, ...batchDoc.data() } as Batch);
        }
      } catch (err) {
        console.error("Error fetching submission details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleStatusChange = async (newStatus: ReviewStatus) => {
    if (!submission) return;
    setUpdatingStatus(true);
    try {
      if (newStatus === "review_done") {
        setShowCommentInput(true);
        setUpdatingStatus(false);
        return;
      }
      await updateDoc(doc(db, "submissions", submission.id), { reviewStatus: newStatus });
      setSubmission({ ...submission, reviewStatus: newStatus });
    } catch (err) { 
      console.error(err); 
    } finally { 
      setUpdatingStatus(false); 
    }
  };

  const handleSaveReviewComment = async () => {
    if (!submission) return;
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, "submissions", submission.id), { 
        reviewStatus: "review_done" as ReviewStatus, 
        reviewComment 
      });
      setSubmission({ ...submission, reviewStatus: "review_done", reviewComment });
      setShowCommentInput(false);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setUpdatingStatus(false); 
    }
  };

  if (loading) return <div className="space-y-6"><div className="h-20 w-40 skeleton" /><div className="h-96 skeleton" /></div>;
  if (!submission) return <div className="text-center py-20">Submission not found.</div>;

  const currentStatus = submission.reviewStatus || "pending_review";
  const statusInfo = STATUS_CONFIG[currentStatus];

  const renderDocLink = (label: string, url: string | undefined, icon: React.ReactNode, color: string, key?: React.Key) => {
    if (!url) return null;
    return (
      <a key={key} href={url} target="_blank" rel="noreferrer" className={`flex items-center gap-3 p-3 rounded-xl bg-bg-primary border border-border hover:border-${color}-300 transition-all`}>
        <div className={`w-8 h-8 rounded-lg bg-${color}-50 flex items-center justify-center text-${color}-500 shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1 flex justify-between items-center">
          <p className="text-xs font-bold text-gray-800 truncate">{label}</p>
          <p className="text-[10px] font-bold uppercase text-accent hover:underline ml-2">Open Link</p>
        </div>
      </a>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <button 
        onClick={() => router.back()}
        className="btn btn-secondary btn-sm gap-2 text-text-muted hover:text-primary"
      >
        <FaArrowLeft size={14} /> Back to Submissions
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">{student?.name || "Student Submission"}</h1>
          <p className="text-secondary flex items-center gap-2">
            <span className="badge badge-info text-sm">Group {submission.groupId}</span>
            <span className="text-text-muted">•</span>
            <span>{batch?.name}</span>
          </p>
        </div>
        <div className="text-right flex flex-col md:items-end">
          <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Submitted On</p>
          <p className="font-semibold">{new Date(submission.submittedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Media & Links */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Main Links */}
          <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href={submission.githubUrl} target="_blank" className="flex items-center gap-4 p-4 rounded-xl bg-bg-primary border hover:border-accent transition-all">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400"><FaGithub size={24} /></div>
              <div><p className="text-xs text-text-muted font-bold uppercase">Repository</p><p className="font-semibold text-sm">View GitHub</p></div>
            </a>
            {submission.websiteUrl && (
              <a href={submission.websiteUrl} target="_blank" className="flex items-center gap-4 p-4 rounded-xl bg-bg-primary border hover:border-emerald-500 transition-all">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><FaLink size={24} /></div>
                <div><p className="text-xs text-text-muted font-bold uppercase">Live Demo</p><p className="font-semibold text-sm">Visit Website</p></div>
              </a>
            )}
            {submission.youtubeUrl && (
              <a href={submission.youtubeUrl} target="_blank" className="col-span-1 sm:col-span-2 flex items-center gap-4 p-4 rounded-xl bg-bg-primary border hover:border-rose-500 transition-all">
                <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500"><FaYoutube size={24} /></div>
                <div className="min-w-0"><p className="text-xs text-text-muted font-bold uppercase">Video Link</p><p className="font-semibold text-sm truncate">{submission.youtubeUrl}</p></div>
              </a>
            )}
          </div>

          {/* Structured Documents List */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FaFileAlt className="text-accent" /> Submitted Document Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {renderDocLink("Research Paper", submission.researchPaperUrl, <FaFilePdf size={16} />, "rose")}
              {renderDocLink("PPT / Presentation", submission.pptUrl, <FaFilePowerpoint size={16} />, "orange")}
              {renderDocLink("Synopsis", submission.synopsisUrl, <FaFileAlt size={16} />, "blue")}
              {renderDocLink("Sponsorship Letter", submission.sponsorshipLetterUrl, <FaFileContract size={16} />, "purple")}
              {submission.customDocuments?.map((cd, i) => renderDocLink(cd.label, cd.url, <FaTag size={16} />, "teal", i))}
            </div>

            {!submission.researchPaperUrl && !submission.pptUrl && !submission.synopsisUrl && !submission.sponsorshipLetterUrl && (!submission.customDocuments || submission.customDocuments.length === 0) && (
              <p className="text-sm font-semibold text-gray-400 italic bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">No documents uploaded.</p>
            )}
          </div>

          {/* Screenshots Gallery */}
          {submission.screenshotUrls && submission.screenshotUrls.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <FaImage className="text-blue-500" /> Screenshots
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {submission.screenshotUrls.map((url, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border shadow-md">
                    <img src={url} alt={`Screenshot ${i+1}`} className="w-full h-auto hover:scale-105 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Group Members Section */}
          {submission.members && submission.members.length > 0 && (
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <FaUserFriends className="text-emerald-500" /> Group Members
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {submission.members.map((member, i) => (
                  <div key={i} className="p-3 rounded-xl bg-bg-primary border border-border flex items-center gap-3 hover:border-accent/30 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-border">
                      {member.profilePictureUrl ? (
                         <img src={member.profilePictureUrl} alt={member.fullName} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FaIdCard size={18} />
                         </div>
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-text-primary truncate">{member.fullName}</p>
                      <p className="text-xs text-text-muted flex items-center gap-2"><FaIdCard size={10} /> {member.registrationNumber}</p>
                      <p className="text-xs text-text-muted flex items-center gap-2 truncate"><FaEnvelope size={10} /> {member.collegeEmail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Review Status & Chat */}
        <div className="space-y-8">
          
          {/* Status Control Panel */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><FaCheckCircle className="text-emerald-500" /> Review Status</h3>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusInfo.bg} ${statusInfo.color} border mb-6`}>
              {statusInfo.icon} {statusInfo.label}
            </div>

            {submission.reviewComment && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-[10px] text-emerald-600 font-bold uppercase mb-2">Faculty Comment</p>
                <p className="text-sm text-gray-800">{submission.reviewComment}</p>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Update Status</p>
              <div className="flex flex-col gap-2">
                {(Object.keys(STATUS_CONFIG) as ReviewStatus[]).map((status) => {
                  const config = STATUS_CONFIG[status];
                  return (
                    <button 
                      key={status} 
                      onClick={() => handleStatusChange(status)} 
                      disabled={updatingStatus || currentStatus === status} 
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border w-full transition-all ${
                        currentStatus === status ? `${config.bg} ${config.color} shadow-sm border-${config.color}` : "bg-bg-primary text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {config.icon} Mark as {config.label}
                    </button>
                  );
                })}
              </div>

              {showCommentInput && (
                <div className="mt-4 p-4 bg-bg-primary rounded-xl border animate-fade-in">
                  <textarea 
                    className="input text-sm mb-3" 
                    rows={4} 
                    placeholder="Enter official review feedback..." 
                    value={reviewComment} 
                    onChange={(e) => setReviewComment(e.target.value)} 
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSaveReviewComment} disabled={updatingStatus} className="btn btn-primary w-full btn-sm"><FaCheckCircle /> Save Feedback</button>
                    <button onClick={() => setShowCommentInput(false)} className="btn btn-secondary btn-sm px-4"><FaTimes size={12} /></button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="glass-card p-0 overflow-hidden flex flex-col h-[350px]">
            <div className="px-4 py-3 bg-bg-primary border-b border-border flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2"><FaCommentDots className="text-accent" /> Discussion</h2>
              <p className="text-[10px] font-semibold uppercase text-gray-500">With students</p>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <CommentPanel submissionId={submission.id} isFullScreen />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
