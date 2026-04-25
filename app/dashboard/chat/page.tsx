"use client";

import { useAuth } from "@/lib/AuthContext";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { Submission } from "@/lib/types";
import CommentPanel from "@/components/CommentPanel";
import { FaComments } from "react-icons/fa";

export default function ChatPage() {
  const { studentData } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!studentData) return;
      try {
        const q = query(collection(db, "submissions"), where("studentId", "==", studentData.id), limit(1));
        const subSnap = await getDocs(q);
        if (!subSnap.empty) {
          setSubmission({ id: subSnap.docs[0].id, ...subSnap.docs[0].data() } as Submission);
        }
      } catch (err) {
        console.error("Error fetching submission for chat:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [studentData]);

  if (loading) return <div className="h-screen w-full skeleton" />;

  if (!submission) {
    return (
      <div className="text-center py-20 text-text-muted bg-white border border-border shadow-sm rounded-xl h-[calc(100vh-80px)] flex flex-col items-center justify-center">
        <FaComments size={48} className="mx-auto mb-4 opacity-20" />
        <p className="font-semibold text-lg">You haven't submitted a project yet.</p>
        <p className="text-sm">Submit your project first to join the full discussion.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in -mx-6 -my-6 lg:-mx-10 lg:-my-10 h-screen flex flex-col bg-white">
      <CommentPanel submissionId={submission.id} isFullScreen={true} />
    </div>
  );
}
