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
  FaFileAlt, FaFilePowerpoint, FaFileContract, FaTag
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
  const [pptUrl, setPptUrl] = useState("");
  const [synopsisUrl, setSynopsisUrl] = useState("");
  const [sponsorshipLetterUrl, setSponsorshipLetterUrl] = useState("");
  const [customDocuments, setCustomDocuments] = useState<CustomDocument[]>([]);
  
  // Uploading state
  const [uploading, setUploading] = useState<string | null>(null);

  // Deletion State
  const [deleteType, setDeleteType] = useState<"screenshot" | "paper" | "ppt" | "synopsis" | "sponsorship" | "custom" | null>(null);
  const [indexToDelete, setIndexToDelete] = useState<number | null>(null);

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
          setGithubUrl(data.githubUrl);
          setWebsiteUrl(data.websiteUrl || "");
          setYoutubeUrl(data.youtubeUrl || "");
          setScreenshots(data.screenshotUrls);
          setPaperUrl(data.researchPaperUrl || "");
          setPptUrl(data.pptUrl || "");
          setSynopsisUrl(data.synopsisUrl || "");
          setSponsorshipLetterUrl(data.sponsorshipLetterUrl || "");
          setCustomDocuments(data.customDocuments || []);
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

  const handleFileUpload = async (file: File, type: "image" | "pdf" | "ppt" | "synopsis" | "sponsorship" | "custom", customIndex?: number) => {
    const uploadKey = type === "image" ? "screenshot" : type === "custom" ? `custom_${customIndex}` : type;
    setUploading(uploadKey);
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

      switch (type) {
        case "image":
          setScreenshots(prev => [...prev, data.url]);
          break;
        case "pdf":
          setPaperUrl(data.url);
          break;
        case "ppt":
          setPptUrl(data.url);
          break;
        case "synopsis":
          setSynopsisUrl(data.url);
          break;
        case "sponsorship":
          setSponsorshipLetterUrl(data.url);
          break;
        case "custom":
          if (customIndex !== undefined) {
            setCustomDocuments(prev => {
              const updated = [...prev];
              updated[customIndex] = { ...updated[customIndex], url: data.url };
              return updated;
            });
          }
          break;
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload file.");
    } finally {
      setUploading(null);
    }
  };

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

  const addCustomDocument = () => {
    setCustomDocuments(prev => [...prev, { label: "", url: "" }]);
  };

  const updateCustomDocLabel = (index: number, label: string) => {
    setCustomDocuments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], label };
      return updated;
    });
  };

  const removeCustomDocument = (index: number) => {
    setIndexToDelete(index);
    setDeleteType("custom");
  };

  const confirmDelete = () => {
    if (deleteType === "screenshot" && indexToDelete !== null) {
      setScreenshots(prev => prev.filter((_, i) => i !== indexToDelete));
    } else if (deleteType === "paper") {
      setPaperUrl("");
    } else if (deleteType === "ppt") {
      setPptUrl("");
    } else if (deleteType === "synopsis") {
      setSynopsisUrl("");
    } else if (deleteType === "sponsorship") {
      setSponsorshipLetterUrl("");
    } else if (deleteType === "custom" && indexToDelete !== null) {
      setCustomDocuments(prev => prev.filter((_, i) => i !== indexToDelete));
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

    if (!githubUrl.includes("github.com")) {
      setSaving(false);
      return setError("Please provide a valid GitHub repository URL.");
    }

    if (screenshots.length === 0) {
      setSaving(false);
      return setError("Please upload at least one project screenshot.");
    }

    try {
      const submissionData = {
        studentId: studentData!.id,
        batchId: studentData!.batchId,
        groupId: studentData!.groupId,
        githubUrl,
        websiteUrl,
        youtubeUrl,
        screenshotUrls: screenshots,
        researchPaperUrl: paperUrl,
        pptUrl,
        synopsisUrl,
        sponsorshipLetterUrl,
        customDocuments: customDocuments.filter(d => d.label && d.url),
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

  // Helper to render a document upload card
  const renderDocUpload = (
    label: string,
    icon: React.ReactNode,
    url: string,
    uploadType: "pdf" | "ppt" | "synopsis" | "sponsorship",
    accept: string,
    onDelete: () => void,
    required = false
  ) => (
    <div className="glass-card p-6 space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        {icon} {label} {required && <span className="text-rose-500 text-sm">*</span>}
      </h2>
      {url ? (
        <div className="p-4 bg-accent-light border border-accent/20 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold">Document Uploaded</p>
              <a href={url} target="_blank" className="text-xs text-accent hover:underline">View document</a>
            </div>
          </div>
          {!isLocked && (
            <button onClick={onDelete} className="text-text-muted hover:text-rose-400 p-2">
              <FaTimes />
            </button>
          )}
        </div>
      ) : (
        <label className={`
          dropzone flex flex-col items-center justify-center min-h-[120px]
          ${isLocked ? "cursor-not-allowed opacity-50" : ""}
        `}>
          <input 
            type="file" 
            className="hidden" 
            accept={accept}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], uploadType)}
            disabled={isLocked || uploading === uploadType}
          />
          {uploading === uploadType ? (
            <div className="spinner" />
          ) : (
            <>
              <FaCloudUploadAlt size={28} className="text-text-muted mb-2" />
              <p className="text-sm font-medium mb-1">Click to upload {label}</p>
              <p className="text-xs text-text-muted">{accept === "application/pdf" ? "PDF" : "PDF, PPT, PPTX, DOC, DOCX"} (Max 10MB)</p>
            </>
          )}
        </label>
      )}
    </div>
  );

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
              <label className="flex items-center gap-1.5 mb-1.5 text-[0.85rem] font-medium text-text-primary" htmlFor="github">
                <FaGithub className="text-emerald" size={14} /> GitHub URL <span className="text-rose-500">*</span>
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
                  required
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
                  multiple
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleMultipleImageUploads(Array.from(e.target.files));
                    }
                  }}
                  disabled={uploading === "screenshot"}
                />
                {uploading === "screenshot" ? <div className="spinner" /> : <><FaPlusIcon className="text-text-muted mb-1" /><span className="text-[10px] text-text-muted font-bold uppercase">Add</span></>}
              </label>
            )}
          </div>
          <p className="text-xs text-text-muted italic">Upload up to 6 screenshots of your project UI/Hardware.</p>
        </div>

        {/* Documents Section */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
            <FaFileAlt className="text-accent" /> Documents
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderDocUpload(
              "Research Paper",
              <FaFilePdf className="text-rose-400" size={20} />,
              paperUrl,
              "pdf",
              "application/pdf",
              () => setDeleteType("paper"),
              false
            )}
            {renderDocUpload(
              "PPT / Presentation",
              <FaFilePowerpoint className="text-orange-400" size={20} />,
              pptUrl,
              "ppt",
              ".pdf,.ppt,.pptx",
              () => setDeleteType("ppt")
            )}
            {renderDocUpload(
              "Synopsis",
              <FaFileAlt className="text-blue-400" size={20} />,
              synopsisUrl,
              "synopsis",
              ".pdf,.doc,.docx",
              () => setDeleteType("synopsis")
            )}
            {renderDocUpload(
              "Sponsorship Letter",
              <FaFileContract className="text-purple-400" size={20} />,
              sponsorshipLetterUrl,
              "sponsorship",
              ".pdf,.doc,.docx",
              () => setDeleteType("sponsorship")
            )}
          </div>
        </div>

        {/* Custom Documents Section */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaTag className="text-teal-400" /> Custom Documents
            </h2>
            {!isLocked && (
              <button 
                type="button" 
                onClick={addCustomDocument}
                className="btn btn-secondary btn-sm gap-2"
              >
                <FaPlusIcon className="text-accent" /> Add Document
              </button>
            )}
          </div>

          {customDocuments.length === 0 ? (
            <p className="text-sm text-text-muted italic text-center py-6">
              No custom documents added. Click "Add Document" to upload additional files.
            </p>
          ) : (
            <div className="space-y-4">
              {customDocuments.map((cd, i) => (
                <div key={i} className="p-4 border border-border rounded-xl bg-bg-primary space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Document label (e.g. Certificate, NOC)"
                      className="input input-sm flex-1"
                      value={cd.label}
                      onChange={(e) => updateCustomDocLabel(i, e.target.value)}
                      disabled={isLocked}
                    />
                    {!isLocked && (
                      <button
                        type="button"
                        onClick={() => removeCustomDocument(i)}
                        className="text-text-muted hover:text-rose-500 p-2"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>

                  {cd.url ? (
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <FaCheckCircle className="text-emerald-500" />
                      <a href={cd.url} target="_blank" className="text-sm text-emerald-700 hover:underline font-medium">View uploaded file</a>
                    </div>
                  ) : (
                    <label className="dropzone flex flex-col items-center justify-center min-h-[80px] !p-4">
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], "custom", i)}
                        disabled={isLocked || uploading === `custom_${i}`}
                      />
                      {uploading === `custom_${i}` ? (
                        <div className="spinner" />
                      ) : (
                        <>
                          <FaCloudUploadAlt size={20} className="text-text-muted mb-1" />
                          <p className="text-xs text-text-muted">Click to upload</p>
                        </>
                      )}
                    </label>
                  )}
                </div>
              ))}
            </div>
          )}
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
        title={`Remove ${deleteType === "screenshot" ? "Screenshot" : deleteType === "paper" ? "Research Paper" : deleteType === "ppt" ? "PPT" : deleteType === "synopsis" ? "Synopsis" : deleteType === "sponsorship" ? "Sponsorship Letter" : "Document"}?`}
        message={`Are you sure you want to remove this document? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteType(null);
          setIndexToDelete(null);
        }}
      />
    </div>
  );
}

function FaPlusIcon({ className }: { className?: string }) {
  return <svg className={className} width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>;
}
