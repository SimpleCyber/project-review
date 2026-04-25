"use client";

import { FaTimes, FaGithub, FaLink, FaYoutube, FaFilePdf, FaImage, FaUserFriends, FaUserGraduate, FaIdCard, FaEnvelope } from "react-icons/fa";
import CommentPanel from "./CommentPanel";
import { Submission, Student, Batch } from "@/lib/types";

interface SubmissionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission;
  student?: Student;
  batch?: Batch;
}

export default function SubmissionSidebar({ isOpen, onClose, submission, student, batch }: SubmissionSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[800px] bg-bg-primary 
        shadow-2xl border-l border-border transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-bg-secondary sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold">Project Submission & Review</h2>
            {student && (
              <p className="text-sm text-text-muted mt-1">
                {student.name} • {batch?.name} • Group {submission.groupId}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-bg-primary hover:bg-accent hover:text-white flex items-center justify-center transition-colors border border-border"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Action Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border hover:border-accent group transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                <FaGithub size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-text-muted font-bold uppercase">Repository</p>
                <p className="font-semibold text-sm truncate">View GitHub</p>
              </div>
            </a>

            {submission.websiteUrl && (
              <a href={submission.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border hover:border-emerald-500 group transition-all">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                  <FaLink size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-bold uppercase">Live Demo</p>
                  <p className="font-semibold text-sm truncate">Visit Website</p>
                </div>
              </a>
            )}

            {submission.youtubeUrl && (
              <a href={submission.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-bg-secondary border border-border hover:border-rose-500 group transition-all sm:col-span-2">
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
                  <FaYoutube size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-text-muted font-bold uppercase">Video Link</p>
                  <p className="font-semibold text-sm truncate">{submission.youtubeUrl}</p>
                </div>
              </a>
            )}
          </div>

          {/* Discussion */}
          <div className="border border-border rounded-xl overflow-hidden bg-bg-secondary shadow-sm">
            <CommentPanel submissionId={submission.id} />
          </div>

          {/* PDF */}
          <div className="bg-bg-secondary rounded-xl border border-border p-6 shadow-sm">
             <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
               <FaFilePdf className="text-rose-500" /> Research Paper
             </h3>
             {submission.researchPaperUrl ? (
               <div className="space-y-4">
                 <div className="aspect-[16/10] bg-bg-primary rounded-xl overflow-hidden border border-border">
                   <iframe 
                     src={`https://docs.google.com/viewer?url=${encodeURIComponent(submission.researchPaperUrl)}&embedded=true`}
                     className="w-full h-full border-none"
                     title="Research Paper PDF"
                   />
                 </div>
                 <a href={submission.researchPaperUrl} target="_blank" rel="noreferrer" className="btn btn-secondary w-full">Open PDF</a>
               </div>
             ) : (
               <p className="text-sm text-text-muted italic">No paper uploaded.</p>
             )}
          </div>

          {/* Screenshots */}
          {submission.screenshotUrls && submission.screenshotUrls.length > 0 && (
            <div className="bg-bg-secondary rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <FaImage className="text-accent" /> Screenshots
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {submission.screenshotUrls.map((url, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-border shadow-sm">
                    <img src={url} alt={`Screenshot ${i+1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {submission.members && submission.members.length > 0 && (
            <div className="bg-bg-secondary rounded-xl border border-border p-6 shadow-sm mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                <FaUserFriends className="text-accent" /> Group Members
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {submission.members.map((member, i) => (
                  <div key={i} className="p-3 rounded-xl bg-bg-primary border border-border flex items-center gap-3">
                     <div className="w-12 h-12 rounded-lg bg-accent-light shrink-0 flex items-center justify-center overflow-hidden">
                       {member.profilePictureUrl ? (
                          <img src={member.profilePictureUrl} alt={member.fullName} className="w-full h-full object-cover" />
                       ) : (
                          <FaUserGraduate className="text-accent/40" />
                       )}
                     </div>
                     <div className="min-w-0">
                       <p className="text-sm font-bold truncate">{member.fullName}</p>
                       <p className="text-[10px] text-text-muted flex items-center gap-1"><FaIdCard size={8} /> {member.registrationNumber}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
