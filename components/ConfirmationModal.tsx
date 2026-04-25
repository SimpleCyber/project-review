"use client";

import { FaExclamationTriangle } from "react-icons/fa";

interface ConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  isDanger = true,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isDanger ? "bg-rose-50 text-rose-500" : "bg-blue-50 text-blue-500"}`}>
              <FaExclamationTriangle size={32} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex gap-4 mt-10">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 px-6 rounded-xl font-bold text-white transition-colors shadow-lg ${
                isDanger ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "bg-accent hover:bg-accent-hover shadow-accent/20"
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
