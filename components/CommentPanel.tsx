"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp 
} from "firebase/firestore";
import { useAuth } from "@/lib/AuthContext";
import { FaPaperPlane, FaUserShield, FaSmile, FaPaperclip } from "react-icons/fa";

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
    <div className="flex flex-col h-[600px] bg-white overflow-hidden rounded-xl">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-gray-100 bg-white z-10 shadow-sm relative">
        <div className="flex -space-x-2 mr-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-emerald-600 font-bold text-sm z-20">
            P
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-indigo-600 font-bold text-sm z-10">
            F
          </div>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 leading-tight">Project Discussion</h3>
          <p className="text-xs text-emerald-600 font-medium tracking-wide">● Online</p>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5] relative"
      >
        {/* Subtle patterned background for chat */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        {loading ? (
          <div className="space-y-6 relative z-10">
             <div className="h-16 w-2/3 bg-gray-200 animate-pulse rounded-2xl rounded-tl-sm" />
             <div className="h-12 w-1/2 bg-emerald-100 animate-pulse rounded-2xl rounded-tr-sm ml-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex items-center justify-center h-full relative z-10">
            <div className="bg-white/80 px-4 py-2 rounded-lg shadow-sm text-xs font-semibold text-gray-500 uppercase tracking-widest backdrop-blur-sm">
              Start the conversation
            </div>
          </div>
        ) : (
          <div className="space-y-3 relative z-10 pb-4">
            {comments.map((comment, index) => {
              const isMe = comment.userId === user?.uid;
              const prevComment = index > 0 ? comments[index - 1] : null;
              const isConsecutive = prevComment && prevComment.userId === comment.userId;
              
              const timeString = comment.createdAt?.seconds 
                ? new Date(comment.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : "•••";

              return (
                <div 
                  key={comment.id} 
                  className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                >
                  <div className={`
                    relative max-w-[80%] md:max-w-[70%] group flex flex-col
                    ${isMe ? 'items-end' : 'items-start'}
                  `}>
                    
                    {!isMe && !isConsecutive && (
                      <div className="flex items-center gap-1.5 mb-1 px-1">
                        <span className="text-[11px] font-bold text-gray-600 tracking-tight">
                          {comment.userName}
                        </span>
                        {comment.isAdmin && (
                          <span className="flex items-center gap-1 bg-indigo-100 text-indigo-700 px-1.5 py-[1px] rounded text-[8px] font-bold uppercase">
                            <FaUserShield size={8} /> Faculty
                          </span>
                        )}
                      </div>
                    )}

                    <div className={`
                       px-3.5 pt-2 pb-2.5 text-[0.95rem] relative shadow-sm break-words
                       ${isMe 
                         ? `bg-emerald text-white rounded-2xl ${!isConsecutive ? 'rounded-tr-sm' : ''}` 
                         : `bg-white text-gray-800 rounded-2xl border border-gray-100 ${!isConsecutive ? 'rounded-tl-sm' : ''}`}
                    `}>
                      <span className="leading-snug pr-12 inline-block whitespace-pre-wrap">{comment.text}</span>
                      <span className={`
                        absolute bottom-1 right-2 text-[10px] whitespace-nowrap font-medium
                        ${isMe ? 'text-white/80' : 'text-gray-400'}
                      `}>
                        {timeString}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] p-3 pt-0">
        <form onSubmit={handleSend} className="flex items-end gap-2 bg-white rounded-3xl p-1.5 pl-4 shadow-sm border border-gray-200">
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FaSmile size={20} />
          </button>
          
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 bg-transparent border-none outline-none text-gray-800 py-3 text-sm placeholder-gray-400"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          
          <button type="button" className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <FaPaperclip size={18} />
          </button>
          
          {newComment.trim() ? (
            <button 
              type="submit"
              className="w-10 h-10 shrink-0 rounded-full bg-emerald text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm ml-1"
            >
              <FaPaperPlane size={14} className="ml-[-2px] mt-[1px]" />
            </button>
          ) : (
            <div className="w-10 h-10 shrink-0 ml-1" />
          )}
        </form>
      </div>
    </div>
  );
}
