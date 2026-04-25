"use client";

import { FaTimes, FaGithub, FaLink, FaYoutube, FaFilePdf, FaImage, FaUserFriends, FaUserGraduate, FaIdCard, FaEnvelope, FaExpand } from "react-icons/fa";
import Link from "next/link";
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
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      <div className={`
        fixed inset-y-0 right-0 z-50 w-full md:w-[600px] lg:w-[800px] bg-white text-gray-900
        shadow-2xl border-l border-gray-200 transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Project Review</h2>
            {student && (
              <p className="text-sm font-semibold text-gray-500 mt-1">
                {student.name} • {batch?.name} • Group {submission.groupId}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/submissions/${submission.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm uppercase tracking-wide"
            >
              <FaExpand size={12} /> Expand Focus
            </Link>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white hover:bg-rose-50 hover:text-rose-600 border hover:border-rose-200 border-gray-200 flex items-center justify-center transition-colors shadow-sm"
              title="Close Panel"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-[#f8fafc]">
          {/* Action Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href={submission.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md group transition-all">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all shrink-0">
                <FaGithub size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Repository</p>
                <p className="font-extrabold text-sm text-gray-800 truncate">View GitHub</p>
              </div>
            </a>

            {submission.websiteUrl && (
              <a href={submission.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-emerald-300 hover:shadow-md group transition-all">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                  <FaLink size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Live Demo</p>
                  <p className="font-extrabold text-sm text-gray-800 truncate">Visit Website</p>
                </div>
              </a>
            )}

            {submission.youtubeUrl && (
              <a href={submission.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-rose-300 hover:shadow-md group transition-all sm:col-span-2">
                <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
                  <FaYoutube size={22} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Video Link</p>
                  <p className="font-extrabold text-sm text-gray-800 truncate">{submission.youtubeUrl}</p>
                </div>
              </a>
            )}
          </div>

          {/* PDF */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
             <h3 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2">
               <FaFilePdf className="text-rose-500" /> Research Paper
             </h3>
             {submission.researchPaperUrl ? (
               <div className="space-y-4">
                 <div className="aspect-[16/10] bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                   <iframe 
                     src={`https://docs.google.com/viewer?url=${encodeURIComponent(submission.researchPaperUrl)}&embedded=true`}
                     className="w-full h-full border-none"
                     title="Research Paper PDF"
                   />
                 </div>
                 <a href={submission.researchPaperUrl} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold shadow-md hover:from-emerald-600 hover:to-emerald-700 transition-all text-sm">
                   Open full PDF
                 </a>
               </div>
             ) : (
               <p className="text-sm font-semibold text-gray-400 italic bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">No research paper uploaded.</p>
             )}
          </div>

          {/* Screenshots */}
          {submission.screenshotUrls && submission.screenshotUrls.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2">
                <FaImage className="text-blue-500" /> Screenshots
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {submission.screenshotUrls.map((url, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 hover:shadow-md transition-shadow">
                    <img src={url} alt={`Screenshot ${i+1}`} className="w-full h-auto" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          {submission.members && submission.members.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h3 className="text-lg font-extrabold text-gray-900 mb-5 flex items-center gap-2">
                <FaUserFriends className="text-emerald-500" /> Group Members
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {submission.members.map((member, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-4 hover:border-gray-300 transition-colors">
                     <div className="w-12 h-12 rounded-lg bg-gray-200 border border-gray-300 shrink-0 flex items-center justify-center overflow-hidden">
                       {member.profilePictureUrl ? (
                          <img src={member.profilePictureUrl} alt={member.fullName} className="w-full h-full object-cover" />
                       ) : (
                          <FaUserGraduate className="text-gray-400" />
                       )}
                     </div>
                     <div className="min-w-0">
                       <p className="text-[13px] font-extrabold text-gray-900 truncate">{member.fullName}</p>
                       <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5 mt-0.5 tracking-wider"><FaIdCard size={10} className="text-gray-400" /> {member.registrationNumber}</p>
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
