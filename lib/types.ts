export interface Batch {
  id: string;
  name: string;           // e.g. "2025-2026 Semester 1"
  year: number;
  batchNumber: number;    // 1 = Semester 1, 2 = Semester 2
  isLocked: boolean;
  maxGroups: number;      // Number of groups allowed (e.g. 15 means B1-B15)
  createdAt: number;      // timestamp ms
}

export interface Student {
  id: string;             // Firestore doc ID = Firebase Auth UID
  groupId: string;        // e.g. "B1", "B15"
  batchId: string;        // reference to Batch.id
  name: string;
  createdAt: number;
}

export interface ProjectMember {
  fullName: string;
  collegeEmail: string;
  personalEmail: string;
  phoneNumber: string;
  registrationNumber: string;
  dateOfBirth: string;
  profilePictureUrl?: string; // Cloudinary URL
}

export interface CustomDocument {
  label: string;
  url: string;
}

export type ReviewStatus = "pending_review" | "under_review" | "review_done";

export interface Submission {
  id: string;
  studentId: string;       // Firebase Auth UID
  batchId: string;
  groupId: string;
  githubUrl?: string;
  websiteUrl?: string;
  screenshotUrls: string[];
  youtubeUrl?: string;
  researchPaperUrl?: string;
  review1PptUrl?: string;
  review2PptUrl?: string;
  review3PptUrl?: string;
  finalReviewPptUrl?: string;
  synopsisUrl?: string;
  sponsorshipLetterUrl?: string;
  copyrightUrl?: string;
  posterUrl?: string;
  blackBookUrl?: string;
  customDocuments?: CustomDocument[];
  members?: ProjectMember[];
  reviewStatus?: ReviewStatus;
  reviewComment?: string;
  resubmissionCount?: number;
  submittedAt: number;
  updatedAt: number;
}

export interface Notice {
  id: string;
  batchId: string;
  title: string;
  content: string;
  createdAt: number;
  authorId: string;
}

export interface NoticeReadReceipt {
  id: string; // Firestore doc ID: noticeId_groupId
  noticeId: string;
  groupId: string;
  batchId: string;
  readAt: number;
}

export const GROUP_IDS = ["B1", "B2", "B3", "B4", "B5"] as const;
export type GroupId = typeof GROUP_IDS[number];
