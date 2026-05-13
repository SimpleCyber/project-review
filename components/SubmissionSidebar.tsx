"use client";

import { useState } from "react";
import { FaTimes, FaGithub, FaLink, FaYoutube, FaFilePdf, FaImage, FaUserFriends, FaUserGraduate, FaIdCard, FaEnvelope, FaExpand, FaFilePowerpoint, FaFileAlt, FaFileContract, FaTag, FaCheckCircle, FaClock, FaSearch, FaCopyright, FaFileImage, FaBook } from "react-icons/fa";
import Link from "next/link";
import { Submission, Student, Batch, ReviewStatus } from "@/lib/types";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

interface SubmissionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  student?: Student;
  batch?: Batch;
  onStatusUpdate?: (submissionId: string, status: ReviewStatus, comment?: string) => void;
}

const STATUS_CONFIG: Record<ReviewStatus, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  pending_review: { label: "Pending", icon: <FaClock size={12} />, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  under_review: { label: "Reviewing", icon: <FaSearch size={12} />, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  review_done: { label: "Done", icon: <FaCheckCircle size={12} />, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
};

export default function SubmissionSidebar({ isOpen, onClose, submission, student, batch, onStatusUpdate }: SubmissionSidebarProps) {
  const { isAdmin } = useAuth();
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [reviewComment, setReviewComment] = useState(submission?.reviewComment || "");
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showAllScreenshots, setShowAllScreenshots] = useState(false);

  if (!isOpen || !submission) return null;

  const currentStatus = submission.reviewStatus || "pending_review";
  const statusInfo = STATUS_CONFIG[currentStatus];

  const handleStatusChange = async (newStatus: ReviewStatus) => {
    setUpdatingStatus(true);
    try {
      if (newStatus === "review_done") {
        setShowCommentInput(true);
        setUpdatingStatus(false);
        return;
      }
      await updateDoc(doc(db, "submissions", submission.id), { reviewStatus: newStatus });
      if (onStatusUpdate) onStatusUpdate(submission.id, newStatus);
      submission.reviewStatus = newStatus;
    } catch (err) { console.error(err); } 
    finally { setUpdatingStatus(false); }
  };

  const handleSaveReviewComment = async () => {
    setUpdatingStatus(true);
    try {
      await updateDoc(doc(db, "submissions", submission.id), { reviewStatus: "review_done" as ReviewStatus, reviewComment });
      submission.reviewStatus = "review_done";
      submission.reviewComment = reviewComment;
      setShowCommentInput(false);
      if (onStatusUpdate) onStatusUpdate(submission.id, "review_done", reviewComment);
    } catch (err) { console.error(err); } 
    finally { setUpdatingStatus(false); }
  };

  const renderDocLink = (label: string, url: string | undefined, icon: React.ReactNode, color: string, key?: React.Key) => {
    if (!url) return null;
    return (
      <a key={key} href={url} target="_blank" rel="noreferrer" className={`flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-${color}-300 hover:shadow-md group transition-all`}>
        <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center text-${color}-500 shrink-0`}>{icon}</div>
        <div className="min-w-0"><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">{label}</p><p className="font-extrabold text-sm text-gray-800 truncate">View Document</p></div>
      </a>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className={`fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[800px] bg-white shadow-2xl flex flex-col ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Project Review</h2>
            {student && (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-semibold text-gray-500">{student.name} • {batch?.name} • Group {submission.groupId}</p>
                {submission.resubmissionCount && submission.resubmissionCount > 0 && (
                  <span className="badge badge-amber text-[10px] px-2 py-0 animate-pulse">Resubmission {submission.resubmissionCount}</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/admin/submissions/${submission.id}`} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-xs font-bold hover:bg-emerald-50"><FaExpand /> Expand</Link>
            <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-rose-50 border flex items-center justify-center"><FaTimes /></button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc]">
            {/* Status */}
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="text-lg font-extrabold mb-4 flex items-center gap-2"><FaCheckCircle className="text-emerald-500" /> Review Status</h3>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusInfo.bg} ${statusInfo.color} border mb-4`}>
                {statusInfo.icon} {statusInfo.label}
              </div>
              
              {submission.reviewComment && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] text-emerald-600 font-bold uppercase mb-2">Faculty Comment</p>
                  <p className="text-sm text-gray-800">{submission.reviewComment}</p>
                </div>
              )}

              {isAdmin && (
                <div className="mt-6 space-y-4">
                  <div className="flex gap-2">
                    {(Object.keys(STATUS_CONFIG) as ReviewStatus[]).map((status) => {
                      const config = STATUS_CONFIG[status];
                      return (
                        <button key={status} onClick={() => handleStatusChange(status)} disabled={updatingStatus || currentStatus === status} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border ${currentStatus === status ? `${config.bg} ${config.color}` : "bg-white text-gray-500 hover:bg-gray-50"}`}>
                          {config.icon} {config.label}
                        </button>
                      );
                    })}
                  </div>
                  {showCommentInput && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border">
                      <textarea className="w-full p-3 border rounded-lg text-sm bg-white" rows={3} placeholder="Review comments..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} />
                      <div className="flex gap-2 mt-2">
                        <button onClick={handleSaveReviewComment} disabled={updatingStatus} className="btn btn-primary btn-sm"><FaCheckCircle /> Save & Mark Done</button>
                        <button onClick={() => setShowCommentInput(false)} className="btn btn-secondary btn-sm">Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-4">
              <a href={submission.githubUrl} target="_blank" className="flex items-center gap-4 p-4 rounded-2xl bg-white border hover:shadow-md">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600"><FaGithub size={22} /></div>
                <div><p className="text-[10px] font-bold text-gray-400 uppercase">Repo</p><p className="font-bold text-sm">View GitHub</p></div>
              </a>
              {submission.websiteUrl && (
                <a href={submission.websiteUrl} target="_blank" className="flex items-center gap-4 p-4 rounded-2xl bg-white border hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500"><FaLink size={22} /></div>
                  <div><p className="text-[10px] font-bold text-gray-400 uppercase">Demo</p><p className="font-bold text-sm">Visit Website</p></div>
                </a>
              )}
              {submission.youtubeUrl && (
                <a href={submission.youtubeUrl} target="_blank" className="col-span-2 flex items-center gap-4 p-4 rounded-2xl bg-white border hover:shadow-md">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500"><FaYoutube size={22} /></div>
                  <div><p className="text-[10px] font-bold text-gray-400 uppercase">Video</p><p className="font-bold text-sm truncate">{submission.youtubeUrl}</p></div>
                </a>
              )}
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border p-6">
              <h3 className="text-lg font-extrabold mb-5 flex items-center gap-2"><FaFileAlt className="text-accent" /> Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderDocLink("Research Paper", submission.researchPaperUrl, <FaFilePdf size={22} />, "rose")}
                {renderDocLink("Synopsis", submission.synopsisUrl, <FaFileAlt size={22} />, "blue")}
                {renderDocLink("Sponsorship", submission.sponsorshipLetterUrl, <FaFileContract size={22} />, "purple")}
                {renderDocLink("Copyright", submission.copyrightUrl, <FaCopyright size={22} />, "amber")}
                {renderDocLink("Review 1 PPT", submission.review1PptUrl, <FaFilePowerpoint size={22} />, "orange")}
                {renderDocLink("Review 2 PPT", submission.review2PptUrl, <FaFilePowerpoint size={22} />, "orange")}
                {renderDocLink("Review 3 PPT", submission.review3PptUrl, <FaFilePowerpoint size={22} />, "orange")}
                {renderDocLink("Final PPT", submission.finalReviewPptUrl, <FaFilePowerpoint size={22} />, "rose")}
                {renderDocLink("Poster", submission.posterUrl, <FaFileImage size={22} />, "emerald")}
                {renderDocLink("Black Book", submission.blackBookUrl, <FaBook size={22} />, "zinc")}
              </div>
            </div>

            {/* Screenshots */}
            {submission.screenshotUrls && submission.screenshotUrls.length > 0 && (
              <div className="bg-white rounded-2xl border p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-extrabold flex items-center gap-2"><FaImage className="text-blue-500" /> Screenshots</h3>
                  {submission.screenshotUrls.length > 2 && (
                    <button 
                      onClick={() => setShowAllScreenshots(!showAllScreenshots)}
                      className="text-xs font-bold text-accent hover:underline uppercase tracking-wider"
                    >
                      {showAllScreenshots ? "Show Less" : `View All ${submission.screenshotUrls.length}`}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(showAllScreenshots ? submission.screenshotUrls : submission.screenshotUrls.slice(0, 2)).map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      alt={`Screenshot ${i}`} 
                      className="rounded-xl border cursor-pointer hover:scale-105 transition-transform" 
                      onClick={() => setExpandedImage(url)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
      </div>
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in backdrop-blur-sm"
          onClick={() => setExpandedImage(null)}
        >
          <img 
            src={expandedImage} 
            alt="Expanded Screenshot" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" 
          />
        </div>
      )}
    </>
  );
}
