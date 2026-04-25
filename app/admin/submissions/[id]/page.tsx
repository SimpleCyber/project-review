"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Submission, Batch, Student } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { 
  FaArrowLeft, FaGithub, FaLink, FaFilePdf, FaYoutube, 
  FaCalendarAlt, FaUserGraduate, FaLayerGroup, FaImage, FaUserFriends, FaEnvelope, FaIdCard 
} from "react-icons/fa";

export default function SubmissionDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const subDoc = await getDoc(doc(db, "submissions", id as string));
        if (subDoc.exists()) {
          const subData = { id: subDoc.id, ...subDoc.data() } as Submission;
          setSubmission(subData);

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

  if (loading) return <div className="space-y-6"><div className="h-20 w-40 skeleton" /><div className="h-96 skeleton" /></div>;
  if (!submission) return <div className="text-center py-20">Submission not found.</div>;

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
            <span className="badge badge-info">{submission.registrationId}</span>
            <span className="text-text-muted">•</span>
            <span>{batch?.name}</span>
            <span className="text-text-muted">•</span>
            <span>Group {submission.groupId}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted uppercase font-bold tracking-widest mb-1">Submitted On</p>
          <p className="font-semibold">{new Date(submission.submittedAt).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media & Links */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Links */}
          <div className="glass-card p-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href={submission.githubUrl} 
              target="_blank" 
              className="flex items-center gap-4 p-4 rounded-xl bg-bg-primary border border-border hover:border-accent group transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-accent group-hover:text-white transition-all">
                <FaGithub size={24} />
              </div>
              <div>
                <p className="text-xs text-text-muted font-bold uppercase">Repository</p>
                <p className="font-semibold text-sm truncate">View on GitHub</p>
              </div>
            </a>

            {submission.websiteUrl && (
              <a 
                href={submission.websiteUrl} 
                target="_blank" 
                className="flex items-center gap-4 p-4 rounded-xl bg-bg-primary border border-border hover:border-emerald-500 group transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <FaLink size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted font-bold uppercase">Live Demo</p>
                  <p className="font-semibold text-sm truncate">Visit Website</p>
                </div>
              </a>
            )}

            {submission.youtubeUrl && (
              <a 
                href={submission.youtubeUrl} 
                target="_blank" 
                className="flex items-center gap-4 p-4 rounded-xl bg-bg-primary border border-border hover:border-rose-500 group transition-all col-span-1 sm:col-span-2"
              >
                <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <FaYoutube size={24} />
                </div>
                <div>
                  <p className="text-xs text-text-muted font-bold uppercase">Video Link</p>
                  <p className="font-semibold text-sm">{submission.youtubeUrl}</p>
                </div>
              </a>
            )}
          </div>

          {/* Screenshots Gallery */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <FaImage className="text-accent" /> Project Screenshots
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {submission.screenshotUrls.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border shadow-lg">
                  <img src={url} alt={`Screenshot ${i+1}`} className="w-full h-auto hover:scale-105 transition-transform cursor-pointer" />
                </div>
              ))}
            </div>
          </div>

          {/* Group Members Section */}
          <div className="glass-card p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <FaUserFriends className="text-accent" /> Project Group Members
            </h3>
            {submission.members && submission.members.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {submission.members.map((member, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-bg-primary border border-border flex items-start gap-4 hover:border-accent/30 transition-all">
                    <div className="w-16 h-16 rounded-xl bg-accent-light overflow-hidden flex-shrink-0 border border-border">
                      {member.profilePictureUrl ? (
                         <img src={member.profilePictureUrl} alt={member.fullName} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-accent/20">
                            <FaUserGraduate size={32} />
                         </div>
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-text-primary truncate">{member.fullName}</p>
                      <p className="text-xs text-text-muted flex items-center gap-2">
                        <FaIdCard size={10} /> {member.registrationNumber}
                      </p>
                      <p className="text-xs text-text-muted flex items-center gap-2 truncate">
                        <FaEnvelope size={10} /> {member.collegeEmail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border-2 border-dashed border-border rounded-2xl text-text-muted italic">
                No member details provided yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: PDF Preview & Sidebar Info */}
        <div className="space-y-8">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
              <FaFilePdf className="text-rose-400" /> Research Paper
            </h3>
            {submission.researchPaperUrl ? (
              <div className="space-y-4">
                <div className="aspect-[3/4] bg-bg-primary rounded-xl overflow-hidden border border-border relative group">
                  <iframe 
                    src={`${submission.researchPaperUrl}#view=FitH`}
                    className="w-full h-full border-none"
                    title="Research Paper PDF"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-white font-semibold">PDF Review Enabled</p>
                  </div>
                </div>
                <a 
                  href={submission.researchPaperUrl} 
                  target="_blank" 
                  className="btn btn-secondary w-full"
                >
                  Open PDF in New Tab
                </a>
              </div>
            ) : (
              <p className="text-sm text-text-muted italic">No paper uploaded.</p>
            )}
          </div>


          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Internal Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border text-sm">
                <span className="text-text-muted">Total Screenshots</span>
                <span className="font-bold">{submission.screenshotUrls.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border text-sm">
                <span className="text-text-muted">Last Edit</span>
                <span className="font-bold text-xs">{new Date(submission.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
