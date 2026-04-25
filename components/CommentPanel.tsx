"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp 
} from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { FaPaperPlane, FaUser, FaUserShield } from "react-icons/fa";

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  createdAt: any;
}

export default function CommentPanel({ submissionId }: { submissionId: string }) {
  const { user, isAdmin, studentData } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!submissionId) return;

    const q = query(
      collection(db, "comments"),
      where("submissionId", "==", submissionId),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(data);
      setLoading(false);
      
      // Scroll to bottom on new message
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    });

    return () => unsubscribe();
  }, [submissionId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const name = isAdmin ? "Faculty" : (studentData?.name || user.email?.split("@")[0] || "Student");
      await addDoc(collection(db, "comments"), {
        submissionId,
        text: newComment,
        userId: user.uid,
        userName: name,
        isAdmin: isAdmin,
        createdAt: serverTimestamp(),
      });
      setNewComment("");
    } catch (err) {
      console.error("Error sending comment:", err);
    }
  };

  return (
    <div className="flex flex-col h-[500px] glass-card overflow-hidden">
      <div className="p-4 border-b border-border bg-bg-secondary/50">
        <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-text-muted">
          Discussion & Feedback
        </h3>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
      >
        {loading ? (
          <div className="space-y-4">
             <div className="h-10 w-2/3 skeleton rounded-lg" />
             <div className="h-10 w-1/2 skeleton rounded-lg ml-auto" />
             <div className="h-16 w-3/4 skeleton rounded-lg" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 opacity-50 text-sm italic">
            No comments yet. Start the conversation!
          </div>
        ) : (
          comments.map((comment) => {
            const isMe = comment.userId === user?.uid;
            return (
              <div 
                key={comment.id} 
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className={`
                   max-w-[85%] rounded-2xl p-3 text-sm
                   ${isMe 
                     ? 'bg-accent text-white rounded-tr-none shadow-md' 
                     : 'bg-bg-primary border border-border rounded-tl-none'}
                `}>
                  <div className={`flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-tighter ${isMe ? 'text-white/80' : 'text-text-muted'}`}>
                    {comment.isAdmin ? <FaUserShield size={10} /> : <FaUser size={10} />}
                    {comment.userName}
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{comment.text}</p>
                </div>
                <span className="text-[9px] text-text-muted mt-1 px-2">
                  {comment.createdAt?.seconds 
                    ? new Date(comment.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : "Sending..."}
                </span>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-bg-secondary/30 border-t border-border">
        <div className="relative">
          <input
            type="text"
            placeholder="Type your message..."
            className="input pr-12 text-sm h-11"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accent-dark transition-colors"
          >
            <FaPaperPlane size={12} />
          </button>
        </div>
      </form>
    </div>
  );
}
