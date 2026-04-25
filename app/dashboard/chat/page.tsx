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

  if (loading) return <div className="h-96 w-full skeleton" />;

  if (!submission) {
    return (
      <div className="text-center py-20 text-text-muted glass-card border border-border">
        <FaComments size={48} className="mx-auto mb-4 opacity-20" />
        <p className="font-semibold">You haven't submitted a project yet.</p>
        <p className="text-sm">Submit your project first to join the discussion.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-2">Discussion & Feedback</h1>
        <p className="text-secondary">Chat directly with your administration regarding your submission.</p>
      </div>
      <div className="glass-card shadow-sm border border-border rounded-xl">
          <CommentPanel submissionId={submission.id} />
      </div>
    </div>
  );
}
