"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { 
  doc, getDoc, collection, query, where, getDocs, limit, setDoc, addDoc, updateDoc 
} from "firebase/firestore";
import { Batch, Submission } from "@/lib/types";
import { useRouter } from "next/navigation";
import { 
  FaGithub, FaLink, FaYoutube, FaCloudUploadAlt, FaFilePdf, 
  FaTimes, FaImage, FaCheckCircle, FaExclamationTriangle, FaTrash 
} from "react-icons/fa";

export default function SubmissionPage() {
  const { studentData } = useAuth();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [githubUrl, setGithubUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [paperUrl, setPaperUrl] = useState("");
  
  // Uploading state
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!studentData) return;
      try {
        const q = query(collection(db, "submissions"), where("studentId", "==", studentData.id), limit(1));
        const subSnap = await getDocs(q);
        if (!subSnap.empty) {
          const data = { id: subSnap.docs[0].id, ...subSnap.docs[0].data() } as Submission;
          setSubmission(data);
          setGithubUrl(data.githubUrl);
          setWebsiteUrl(data.websiteUrl || "");
          setYoutubeUrl(data.youtubeUrl || "");
          setScreenshots(data.screenshotUrls);
          setPaperUrl(data.researchPaperUrl || "");
        }

        const batchDoc = await getDoc(doc(db, "batches", studentData.batchId));
        if (batchDoc.exists()) {
          setBatch({ id: batchDoc.id, ...batchDoc.data() } as Batch);
        }
      } catch (err) {
        console.error("Error fetching submission data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentData]);

  const handleFileUpload = async (file: File, type: "image" | "pdf") => {
    setUploading(type === "image" ? "screenshot" : "paper");
    setError("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (type === "image") {
        setScreenshots(prev => [...prev, data.url]);
      } else {
        setPaperUrl(data.url);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(null);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batch?.isLocked) return;
    
    setError("");
    setSuccess("");
    setSaving(true);

    if (!githubUrl.includes("github.com")) {
      setSaving(false);
      return setError("Please provide a valid GitHub repository URL.");
    }

    if (screenshots.length === 0) {
      setSaving(false);
      return setError("Please upload at least one project screenshot.");
    }

    if (!paperUrl) {
      setSaving(false);
      return setError("Please upload your research paper (PDF).");
    }

    try {
      const submissionData = {
        studentId: studentData!.id,
        batchId: studentData!.batchId,
        groupId: studentData!.groupId,
        registrationId: studentData!.registrationId,
        githubUrl,
        websiteUrl,
        youtubeUrl,
        screenshotUrls: screenshots,
        researchPaperUrl: paperUrl,
        updatedAt: Date.now(),
      };

      if (submission) {
        await updateDoc(doc(db, "submissions", submission.id), submissionData);
      } else {
        await addDoc(collection(db, "submissions"), {
          ...submissionData,
          submittedAt: Date.now(),
        });
      }

      setSuccess("Project submission saved successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message || "Failed to save submission.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-6"><div className="h-80 skeleton" /></div>;

  const isLocked = batch?.isLocked || false;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">Project Submission</h1>
        <p className="text-secondary">Provide all necessary details and links for your final year project.</p>
      </div>

      {(error || success) && (
        <div className={error ? "alert alert-error" : "alert alert-success"}>
          {error || success}
        </div>
      )}

      {isLocked && (
        <div className="locked-banner">
          <FaExclamationTriangle className="text-amber-500" />
          <p className="text-sm text-text-secondary">Submissions are locked. You cannot make any changes.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Links Section */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaLink className="text-accent" /> Links & Repositories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label" htmlFor="github">GitHub URL <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <FaGithub size={14} />
                </span>
                <input
                  id="github"
                  type="url"
                  placeholder="https://github.com/user/repo"
                  className="input pl-11"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  disabled={isLocked}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="website">Website URL (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <FaLink size={14} />
                </span>
                <input
                  id="website"
                  type="url"
                  placeholder="https://your-project.vercel.app"
                  className="input pl-11"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="label" htmlFor="youtube">YouTube Demo Link (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <FaYoutube size={14} />
                </span>
                <input
                  id="youtube"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  className="input pl-11"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Screenshots */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaImage className="text-emerald-400" /> Screenshots <span className="text-rose-500 text-sm">*</span>
            </h2>
            
            <div className="grid grid-cols-3 gap-3">
              {screenshots.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg border border-border bg-bg-primary overflow-hidden group">
                  <img src={url} alt="Screenshot" className="w-full h-full object-cover" />
                  {!isLocked && (
                    <button 
                      onClick={() => removeScreenshot(i)}
                      className="absolute inset-0 bg-rose-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash className="text-white" />
                    </button>
                  )}
                </div>
              ))}
              
              {!isLocked && screenshots.length < 6 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-accent-light">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "image")}
                    disabled={uploading === "screenshot"}
                  />
                  {uploading === "screenshot" ? <div className="spinner" /> : <><FaPlus className="text-text-muted mb-1" /><span className="text-[10px] text-text-muted font-bold uppercase">Add</span></>}
                </label>
              )}
            </div>
            <p className="text-xs text-text-muted italic">Upload up to 6 screenshots of your project UI/Hardware.</p>
          </div>

          {/* Research Paper */}
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaFilePdf className="text-rose-400" /> Research Paper <span className="text-rose-500 text-sm">*</span>
            </h2>

            {paperUrl ? (
              <div className="p-4 bg-accent-light border border-accent/20 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-400/10 flex items-center justify-center text-rose-400">
                    <FaFilePdf size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Document Uploaded</p>
                    <a href={paperUrl} target="_blank" className="text-xs text-accent hover:underline">View current PDF</a>
                  </div>
                </div>
                {!isLocked && (
                  <button 
                    onClick={() => setPaperUrl("")}
                    className="text-text-muted hover:text-rose-400 p-2"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            ) : (
              <label className={`
                dropzone flex flex-col items-center justify-center h-full min-h-[140px]
                ${isLocked ? "cursor-not-allowed opacity-50" : ""}
              `}>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="application/pdf"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "pdf")}
                  disabled={isLocked || uploading === "paper"}
                />
                {uploading === "paper" ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <FaCloudUploadAlt size={32} className="text-text-muted mb-3" />
                    <p className="text-sm font-medium mb-1">Click to upload Research Paper</p>
                    <p className="text-xs text-text-muted">PDF format only (Max 10MB)</p>
                  </>
                )}
              </label>
            )}
          </div>
        </div>

        {!isLocked && (
          <div className="flex justify-end gap-4 pt-6 border-t border-border">
            <button 
              type="button" 
              onClick={() => router.push("/dashboard")}
              className="btn btn-secondary px-8"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary px-12"
              disabled={saving || !!uploading}
            >
              {saving ? <div className="spinner" /> : "Save Submission"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function FaPlus({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>;
}
