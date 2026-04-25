"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp 
} from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { FaPaperPlane, FaImage, FaInfoCircle, FaTimes, FaCheck } from "react-icons/fa";

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  isAdmin: boolean;
  createdAt: any;
}

export default function CommentPanel({ submissionId, isFullScreen = false }: { submissionId: string, isFullScreen?: boolean }) {
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
      
      // Scroll to bottom
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

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const chatPartnerName = isAdmin ? "Student Submission" : "Administration";
  const chatPartnerEmail = isAdmin ? "student@example.com" : "admin@college.edu"; // Ideally fetched from DB, mocked for UI
  const initial = isAdmin ? "S" : "A";

  return (
    <div className={`flex flex-col bg-[#f8fafc] overflow-hidden ${isFullScreen ? 'h-full shadow-sm' : 'h-[600px] rounded-xl border border-gray-200 shadow-sm'}`}>
      
      {/* Header (Helpdesk Style) */}
      <div className={`flex items-center justify-between px-6 py-4 bg-white z-10 border-b border-gray-200 relative ${isFullScreen ? 'shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {initial}
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="font-extrabold text-gray-900 text-[15px] leading-tight">{chatPartnerName}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{chatPartnerEmail}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
            <FaInfoCircle size={14} />
          </button>
          {!isAdmin && (
            <button className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm">
              <FaTimes size={10} /> Unresolved
            </button>
          )}
          {isAdmin && (
            <button className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm">
              <FaCheck size={10} /> Resolved
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 relative"
      >
        {loading ? (
          <div className="space-y-6 relative z-10 opacity-50">
             <div className="h-16 w-1/2 bg-gray-200 animate-pulse rounded-2xl" />
             <div className="h-12 w-1/3 bg-gray-200 animate-pulse rounded-2xl ml-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-6 pb-4">
            {comments.map((comment, index) => {
              const isMe = comment.userId === user?.uid;
              const prevComment = index > 0 ? comments[index - 1] : null;
              const showSupportLabel = !isMe && (!prevComment || prevComment.userId !== comment.userId);

              return (
                <div key={comment.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex flex-col relative max-w-[85%] md:max-w-[75%]`}>
                    
                    {showSupportLabel && (
                      <div className="flex items-center gap-1.5 mb-1.5 px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {comment.isAdmin ? 'Support' : comment.userName}
                        </span>
                      </div>
                    )}

                    <div className={`
                       px-5 py-3.5 text-[0.95rem] shadow-sm break-words
                       ${isMe 
                         ? `bg-white text-gray-800 rounded-3xl border border-gray-200 font-medium` 
                         : `bg-[#0f172a] text-white rounded-3xl rounded-tl-sm font-medium`}
                    `}>
                      <span className="leading-relaxed inline-block whitespace-pre-wrap">{comment.text}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-[#f8fafc] border-t border-gray-100">
        <form onSubmit={handleSend} className="relative flex items-center max-w-5xl mx-auto">
          <div className="flex-1 bg-white rounded-full flex items-center shadow-sm border border-gray-200 pr-1 pl-4 h-14">
            <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <FaImage size={18} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-gray-800 py-2 px-3 text-[15px] placeholder-gray-400 font-medium"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            {newComment.trim() ? (
              <button 
                type="submit"
                className="w-10 h-10 shrink-0 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center hover:bg-purple-600 transition-colors shadow-sm ml-2 mr-1"
              >
                <FaPaperPlane size={15} className="ml-[-2px] mt-[1px]" />
              </button>
            ) : (
              <div className="w-10 h-10 shrink-0 ml-2 mr-1" />
            )}
          </div>
        </form>
      </div>
      
    </div>
  );
}
