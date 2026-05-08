"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { 
  doc, getDoc, collection, query, where, getDocs, limit, updateDoc, setDoc 
} from "firebase/firestore";
import { Batch, Submission, ProjectMember } from "@/lib/types";
import { useRouter } from "next/navigation";
import { 
  FaUserPlus, FaUserGraduate, FaEnvelope, FaPhone, FaIdCard, 
  FaCalendarAlt, FaCloudUploadAlt, FaTrash, FaCheckCircle, 
  FaExclamationTriangle, FaArrowLeft, FaUserCircle, FaSpinner
} from "react-icons/fa";
import Link from "next/link";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function ProfilePage() {
  const { studentData } = useAuth();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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
        
        let subData: Submission | null = null;
        if (!subSnap.empty) {
          subData = { id: subSnap.docs[0].id, ...subSnap.docs[0].data() } as Submission;
          setSubmission(subData);
          setMembers(subData.members || []);
        } else {
          // Initialize empty submission for profile
          const newId = `${studentData.batchId}_${studentData.groupId}`;
          const newDoc = {
            studentId: studentData.id,
            batchId: studentData.batchId,
            groupId: studentData.groupId,
            githubUrl: "",
            screenshotUrls: [],
            submittedAt: Date.now(),
            updatedAt: Date.now(),
            members: []
          };
          await setDoc(doc(db, "submissions", newId), newDoc);
          setSubmission({ id: newId, ...newDoc } as Submission);
        }

        const batchDoc = await getDoc(doc(db, "batches", studentData.batchId));
        if (batchDoc.exists()) {
          setBatch({ id: batchDoc.id, ...batchDoc.data() } as Batch);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load project group data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentData]);

  const addMember = () => {
    if (members.length >= 5) {
      setError("Maximum 5 members allowed.");
      return;
    }
    setMembers([
      ...members,
      {
        fullName: "",
        collegeEmail: "",
        personalEmail: "",
        phoneNumber: "",
        registrationNumber: "",
        dateOfBirth: "",
      }
    ]);
  };

  const removeMember = (index: number) => {
    setIndexToDelete(index);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteMember = () => {
    if (indexToDelete !== null) {
      setMembers(members.filter((_, i) => i !== indexToDelete));
      setIndexToDelete(null);
    }
    setIsDeleteModalOpen(false);
  };

  const updateMember = (index: number, field: keyof ProjectMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const handleImageUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
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

      updateMember(index, "profilePictureUrl", data.url);
    } catch (err: any) {
      setError(err.message || "Failed to upload profile picture.");
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSave = async () => {
    if (!submission) return;
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      // Basic validation
      for (const m of members) {
        if (!m.fullName || !m.collegeEmail || !m.registrationNumber) {
          throw new Error("Please fill required fields for all members.");
        }
      }

      await updateDoc(doc(db, "submissions", submission.id), {
        members,
        updatedAt: Date.now()
      });

      setSuccess("Group profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center"><FaSpinner className="animate-spin text-accent mx-auto" size={40} /></div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="btn btn-secondary btn-sm p-2">
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Project Group Profile</h1>
            <p className="text-secondary">Manage members of Group {studentData?.groupId} ({batch?.name})</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving || batch?.isLocked} 
          className="btn btn-primary px-8 gap-2"
        >
          {saving ? <div className="spinner" /> : <><FaCheckCircle /> Save Profile</>}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="grid grid-cols-1 gap-8">
        {members.map((member, index) => (
          <div key={index} className="glass-card p-8 relative group transition-all hover:border-accent/30">
            <button 
              onClick={() => removeMember(index)}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove Member"
            >
              <FaTrash size={14} />
            </button>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Profile Image Column */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-bg-primary border-2 border-dashed border-border group/img flex items-center justify-center">
                  {member.profilePictureUrl ? (
                    <img src={member.profilePictureUrl} alt={member.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <FaUserCircle size={64} className="text-text-muted opacity-20" />
                  )}
                  
                  {uploadingIndex === index ? (
                    <div className="absolute inset-0 bg-bg-primary/80 flex items-center justify-center">
                      <FaSpinner className="animate-spin text-accent" />
                    </div>
                  ) : (
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <FaCloudUploadAlt className="text-white" size={24} />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file);
                        }} 
                      />
                    </label>
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Profile Photo</span>
              </div>

              {/* Form Column */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase font-black text-text-muted">
                    <FaUserGraduate size={12} className="text-emerald-500" /> Full Name *
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. John Doe"
                    className="input input-sm"
                    value={member.fullName}
                    onChange={(e) => updateMember(index, "fullName", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase font-black text-text-muted">
                    <FaEnvelope size={12} className="text-rose-500" /> College Email *
                  </label>
                  <input 
                    type="email" 
                    placeholder="college@edu.com"
                    className="input input-sm"
                    value={member.collegeEmail}
                    onChange={(e) => updateMember(index, "collegeEmail", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase font-black text-text-muted">
                    <FaEnvelope size={12} className="text-blue-500" /> Personal Email
                  </label>
                  <input 
                    type="email" 
                    placeholder="personal@mail.com"
                    className="input input-sm"
                    value={member.personalEmail}
                    onChange={(e) => updateMember(index, "personalEmail", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase font-black text-text-muted">
                    <FaPhone size={12} className="text-amber-500" /> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    placeholder="+91 00000 00000"
                    className="input input-sm"
                    value={member.phoneNumber}
                    onChange={(e) => updateMember(index, "phoneNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase font-black text-text-muted">
                    <FaIdCard size={12} className="text-purple-500" /> Registration # *
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2026CS101"
                    className="input input-sm"
                    value={member.registrationNumber}
                    onChange={(e) => updateMember(index, "registrationNumber", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-1.5 mb-1.5 text-[10px] uppercase font-black text-text-muted">
                    <FaCalendarAlt size={12} className="text-teal-500" /> Date of Birth
                  </label>
                  <input 
                    type="date" 
                    className="input input-sm"
                    value={member.dateOfBirth}
                    onChange={(e) => updateMember(index, "dateOfBirth", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {members.length < 5 && (
          <button 
            onClick={addMember}
            className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-2xl hover:border-accent hover:bg-accent/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center text-accent group-hover:scale-110 transition-transform mb-4">
              <FaUserPlus size={20} />
            </div>
            <h3 className="font-bold text-lg">Add Group Member</h3>
            <p className="text-text-muted text-sm mt-1">Include 3 to 5 members in your project group.</p>
          </button>
        )}
      </div>

      {batch?.isLocked && (
        <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-sm">
          <FaExclamationTriangle />
          This batch is locked. You cannot modify group members at this time.
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Remove Member?"
        message={`Are you sure you want to remove ${indexToDelete !== null ? members[indexToDelete]?.fullName || "this member" : "this member"} from the group?`}
        onConfirm={confirmDeleteMember}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
