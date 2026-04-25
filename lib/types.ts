export interface Batch {
  id: string;
  name: string;           // e.g. "2026 Batch 1"
  year: number;
  batchNumber: number;
  isLocked: boolean;
  maxGroups: number;      // Number of groups allowed (e.g. 6 means B1-B6)
  createdAt: number;      // timestamp ms
}

export interface Student {
  id: string;             // Firestore doc ID = Firebase Auth UID
  registrationId: string; // e.g. "CS2026001"
  email: string;          // student email
  groupId: string;        // e.g. "B1", "B2"
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

export interface Submission {
  id: string;
  studentId: string;       // Firebase Auth UID
  batchId: string;
  groupId: string;
  registrationId: string;
  githubUrl: string;
  websiteUrl?: string;
  screenshotUrls: string[];
  youtubeUrl?: string;
  researchPaperUrl?: string;
  members?: ProjectMember[];
  submittedAt: number;
  updatedAt: number;
}

export const GROUP_IDS = ["B1", "B2", "B3", "B4", "B5"] as const;
export type GroupId = typeof GROUP_IDS[number];
