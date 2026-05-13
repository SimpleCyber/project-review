"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { 
  doc, getDoc, collection, query, where, getDocs, limit, setDoc, addDoc, updateDoc 
} from "firebase/firestore";
import { Batch, Submission, CustomDocument } from "@/lib/types";
import { useRouter } from "next/navigation";
import { 
  FaGithub, FaLink, FaYoutube, FaCloudUploadAlt, FaFilePdf, 
  FaTimes, FaImage, FaCheckCircle, FaExclamationTriangle, FaTrash,
  FaFileAlt, FaFilePowerpoint, FaFileContract, FaTag, FaCopyright, FaFileImage, FaBook
} from "react-icons/fa";
import ConfirmationModal from "@/components/ConfirmationModal";

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
  const [review1PptUrl, setReview1PptUrl] = useState("");
  const [review2PptUrl, setReview2PptUrl] = useState("");
  const [review3PptUrl, setReview3PptUrl] = useState("");
  const [finalReviewPptUrl, setFinalReviewPptUrl] = useState("");
  const [synopsisUrl, setSynopsisUrl] = useState("");
  const [sponsorshipLetterUrl, setSponsorshipLetterUrl] = useState("");
  const [copyrightUrl, setCopyrightUrl] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [blackBookUrl, setBlackBookUrl] = useState("");
  
  // Uploading state
  const [uploading, setUploading] = useState<string | null>(null);

  // Deletion State
  const [deleteType, setDeleteType] = useState<"screenshot" | "paper" | "review1Ppt" | "review2Ppt" | "review3Ppt" | "finalReviewPpt" | "synopsis" | "sponsorship" | "copyright" | "poster" | "blackBook" | null>(null);
  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [showAllScreenshots, setShowAllScreenshots] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!studentData) return;
      try {
        const q = query(
          collection(db, "submissions"), 
          where("batchId", "==", studentData.batchId),
          where("groupId", "==", studentData.groupId),
          limit(1)
        );
        const subSnap = await getDocs(q);
        if (!subSnap.empty) {
          const data = { id: subSnap.docs[0].id, ...subSnap.docs[0].data() } as Submission;
          setSubmission(data);
          setGithubUrl(data.githubUrl || "");
          setWebsiteUrl(data.websiteUrl || "");
          setYoutubeUrl(data.youtubeUrl || "");
          setScreenshots(data.screenshotUrls);
          setPaperUrl(data.researchPaperUrl || "");
          setReview1PptUrl(data.review1PptUrl || "");
          setReview2PptUrl(data.review2PptUrl || "");
          setReview3PptUrl(data.review3PptUrl || "");
          setFinalReviewPptUrl(data.finalReviewPptUrl || "");
          setSynopsisUrl(data.synopsisUrl || "");
          setSponsorshipLetterUrl(data.sponsorshipLetterUrl || "");
          setCopyrightUrl(data.copyrightUrl || "");
          setPosterUrl(data.posterUrl || "");
          setBlackBookUrl(data.blackBookUrl || "");
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



  const handleMultipleImageUploads = async (files: File[]) => {
    setUploading("screenshot");
    setError("");
    
    // Cap at remaining capacity
    const availableSlots = 6 - screenshots.length;
    const filesToUpload = files.slice(0, availableSlots);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/cloudinary/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.url;
      });

      const urls = await Promise.all(uploadPromises);
      setScreenshots(prev => [...prev, ...urls]);
    } catch (err: any) {
      setError(err.message || "Failed to upload one or more images.");
    } finally {
      setUploading(null);
    }
  };

  const removeScreenshot = (index: number) => {
    setIndexToDelete(index);
    setDeleteType("screenshot");
  };

  const confirmDelete = () => {
    if (deleteType === "screenshot" && indexToDelete !== null) {
      setScreenshots(prev => prev.filter((_, i) => i !== indexToDelete));
    } else if (deleteType === "paper") {
      setPaperUrl("");
    } else if (deleteType === "review1Ppt") {
      setReview1PptUrl("");
    } else if (deleteType === "review2Ppt") {
      setReview2PptUrl("");
    } else if (deleteType === "review3Ppt") {
      setReview3PptUrl("");
    } else if (deleteType === "finalReviewPpt") {
      setFinalReviewPptUrl("");
    } else if (deleteType === "synopsis") {
      setSynopsisUrl("");
    } else if (deleteType === "sponsorship") {
      setSponsorshipLetterUrl("");
    } else if (deleteType === "copyright") {
      setCopyrightUrl("");
    } else if (deleteType === "poster") {
      setPosterUrl("");
    } else if (deleteType === "blackBook") {
      setBlackBookUrl("");
    }
    setDeleteType(null);
    setIndexToDelete(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batch?.isLocked) return;
    
    setError("");
    setSuccess("");
    setSaving(true);

    if (githubUrl && !githubUrl.includes("github.com")) {
      setSaving(false);
      return setError("Please provide a valid GitHub repository URL.");
    }

    if (screenshots.length === 0) {
      setSaving(false);
      return setError("Please upload at least one project screenshot.");
    }

    try {
      let newResubmissionCount = submission?.resubmissionCount || 0;
      let newStatus = submission?.reviewStatus || "pending_review";
      let newComment = submission?.reviewComment || "";

      // If it was already reviewed, mark it for "Review Again" and increment count
      if (submission?.reviewStatus === "review_done") {
        newResubmissionCount += 1;
        newStatus = "pending_review";
        newComment = ""; // Clear old comment for the new version
      }

      const submissionData = {
        studentId: studentData!.id,
        batchId: studentData!.batchId,
        groupId: studentData!.groupId,
        githubUrl,
        websiteUrl,
        youtubeUrl,
        screenshotUrls: screenshots,
        researchPaperUrl: paperUrl,
        review1PptUrl,
        review2PptUrl,
        review3PptUrl,
        finalReviewPptUrl,
        synopsisUrl,
        sponsorshipLetterUrl,
        copyrightUrl,
        posterUrl,
        blackBookUrl,
        reviewStatus: newStatus,
        reviewComment: newComment,
        resubmissionCount: newResubmissionCount,
        updatedAt: Date.now(),
      };

      if (submission) {
        await updateDoc(doc(db, "submissions", submission.id), submissionData);
      } else {
        const newId = `${studentData!.batchId}_${studentData!.groupId}`;
        await setDoc(doc(db, "submissions", newId), {
          id: newId,
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

  const renderDocInput = (
    label: string,
    icon: React.ReactNode,
    value: string,
    onChange: (val: string) => void,
    placeholder: string
  ) => (
    <div>
      <label className="flex items-center gap-1.5 mb-1.5 text-[0.85rem] font-medium text-text-primary">
        {icon} {label}
      </label>
      <div className="relative mt-1">
        <input
          type="url"
          placeholder={placeholder}
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLocked}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in pb-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Project Submission</h1>
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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Core Links Section */}
        <div className="glass-card p-4 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FaLink className="text-accent" /> Links & Repositories
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-[0.85rem] font-medium text-text-primary" htmlFor="github">
                <FaGithub className="text-emerald" size={14} /> GitHub URL (Optional)
              </label>
              <div className="relative mt-1">
                <input
                  id="github"
                  type="url"
                  placeholder="https://github.com/user/repo"
                  className="input"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1.5 mb-1.5 text-[0.85rem] font-medium text-text-primary" htmlFor="website">
                <FaLink className="text-emerald" size={14} /> Website URL (Optional)
              </label>
              <div className="relative mt-1">
                <input
                  id="website"
                  type="url"
                  placeholder="https://your-project.vercel.app"
                  className="input"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-1.5 mb-1.5 text-[0.85rem] font-medium text-text-primary" htmlFor="youtube">
                <FaYoutube className="text-emerald" size={14} /> YouTube Demo Link (Optional)
              </label>
              <div className="relative mt-1">
                <input
                  id="youtube"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  className="input"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  disabled={isLocked}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots Section */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaImage className="text-blue-500" /> Project Screenshots <span className="text-rose-500 text-sm">*</span>
            </h2>
            <div className="flex items-center gap-4">
              {!isLocked && screenshots.length < 6 && (
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 text-xs font-bold cursor-pointer hover:bg-emerald-100 transition-all">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultipleImageUploads(Array.from(e.target.files));
                      }
                    }}
                    disabled={uploading === "screenshot"}
                  />
                  {uploading === "screenshot" ? <div className="spinner-sm" /> : <FaPlusIcon />}
                  {uploading === "screenshot" ? "Uploading..." : "Add Screenshots"}
                </label>
              )}
              {screenshots.length > 2 && (
                <button 
                  type="button"
                  onClick={() => setShowAllScreenshots(!showAllScreenshots)}
                  className="text-xs font-bold text-accent hover:underline uppercase tracking-wider"
                >
                  {showAllScreenshots ? "Show Less" : `View All ${screenshots.length}`}
                </button>
              )}
            </div>
          </div>
          
          {screenshots.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-bg-primary/50">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-400 mb-4">
                <FaImage size={32} />
              </div>
              <h3 className="text-lg font-bold mb-1">No screenshots yet</h3>
              <p className="text-sm text-text-muted mb-6 max-w-xs">Upload up to 6 screenshots to showcase your project UI or hardware setup.</p>
              {!isLocked && (
                <label className="btn btn-primary gap-2 cursor-pointer">
                   <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleMultipleImageUploads(Array.from(e.target.files));
                      }
                    }}
                    disabled={uploading === "screenshot"}
                  />
                  <FaCloudUploadAlt size={16} /> Select Images
                </label>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(showAllScreenshots ? screenshots : screenshots.slice(0, 2)).map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border border-border shadow-md group bg-bg-primary">
                  <img 
                    src={url} 
                    alt={`Screenshot ${i+1}`} 
                    className="w-full h-auto cursor-pointer hover:scale-105 transition-transform duration-500" 
                    onClick={() => setExpandedImage(url)}
                  />
                  {!isLocked && (
                    <button 
                      type="button"
                      onClick={() => removeScreenshot(i)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10 hover:bg-rose-600"
                    >
                      <FaTrash size={12} />
                    </button>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white font-bold uppercase">Screenshot {i+1}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents Section */}
        <div className="glass-card p-4 space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
            <FaFileAlt className="text-accent" /> Project Documents & Presentations
          </h2>
          <p className="text-xs text-text-muted mb-4">Provide public links (e.g. Google Drive, Google Docs) for your project documents and reviews.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Left Side Documents */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border pb-2">Core Documents</h3>
              {renderDocInput(
                "Research Paper Link",
                <FaFilePdf className="text-rose-400" size={14} />,
                paperUrl,
                setPaperUrl,
                "https://docs.google.com/..."
              )}
              {renderDocInput(
                "Synopsis Link",
                <FaFileAlt className="text-blue-400" size={14} />,
                synopsisUrl,
                setSynopsisUrl,
                "https://docs.google.com/..."
              )}
              {renderDocInput(
                "Sponsorship Letter Link",
                <FaFileContract className="text-purple-400" size={14} />,
                sponsorshipLetterUrl,
                setSponsorshipLetterUrl,
                "https://drive.google.com/..."
              )}
              {renderDocInput(
                "Copyright Link",
                <FaCopyright className="text-amber-400" size={14} />,
                copyrightUrl,
                setCopyrightUrl,
                "https://drive.google.com/..."
              )}
            </div>

            {/* Right Side PPTs */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted border-b border-border pb-2">Review Presentations (PPT)</h3>
              {renderDocInput(
                "Review 1 PPT",
                <FaFilePowerpoint className="text-orange-400" size={14} />,
                review1PptUrl,
                setReview1PptUrl,
                "https://docs.google.com/presentation/..."
              )}
              {renderDocInput(
                "Review 2 PPT",
                <FaFilePowerpoint className="text-orange-500" size={14} />,
                review2PptUrl,
                setReview2PptUrl,
                "https://docs.google.com/presentation/..."
              )}
              {renderDocInput(
                "Review 3 PPT",
                <FaFilePowerpoint className="text-orange-600" size={14} />,
                review3PptUrl,
                setReview3PptUrl,
                "https://docs.google.com/presentation/..."
              )}
              {renderDocInput(
                "Final Review PPT",
                <FaFilePowerpoint className="text-rose-500" size={14} />,
                finalReviewPptUrl,
                setFinalReviewPptUrl,
                "https://docs.google.com/presentation/..."
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">Final Submission Visuals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderDocInput(
                "Poster Link",
                <FaFileImage className="text-emerald-400" size={14} />,
                posterUrl,
                setPosterUrl,
                "https://drive.google.com/..."
              )}
              {renderDocInput(
                "Black Book Link",
                <FaBook className="text-zinc-600" size={14} />,
                blackBookUrl,
                setBlackBookUrl,
                "https://drive.google.com/..."
              )}
            </div>
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

      <ConfirmationModal
        isOpen={deleteType !== null}
        title={`Remove ${deleteType === "screenshot" ? "Screenshot" : deleteType === "paper" ? "Research Paper" : deleteType?.includes("Ppt") ? "Presentation" : deleteType === "synopsis" ? "Synopsis" : deleteType === "sponsorship" ? "Sponsorship Letter" : deleteType === "copyright" ? "Copyright" : deleteType === "poster" ? "Poster" : deleteType === "blackBook" ? "Black Book" : "Document"}?`}
        message={`Are you sure you want to remove this? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteType(null);
          setIndexToDelete(null);
        }}
      />

      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 cursor-zoom-out animate-fade-in backdrop-blur-sm"
          onClick={() => setExpandedImage(null)}
        >
          <img 
            src={expandedImage} 
            alt="Expanded Screenshot" 
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}
    </div>
  );
}

function FaPlusIcon({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>;
}
