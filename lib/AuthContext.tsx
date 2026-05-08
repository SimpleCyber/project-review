"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Student } from "./types";

interface AuthContextValue {
  user: User | null;
  studentData: Student | null;
  isAdmin: boolean;
  loading: boolean;
  login: (year: number, semester: number, groupId: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (
    password: string,
    name: string,
    groupId: string,
    batchId: string,
    year: number,
    semester: number
  ) => Promise<void>;
  setStudentData: React.Dispatch<React.SetStateAction<Student | null>>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Constructs a deterministic internal email from year, semester, and groupId.
 * Example: "2025-2026_semester1_b15@projectreview.local"
 */
function makeEmail(year: number, semester: number, groupId: string): string {
  const yearRange = `${year}-${year + 1}`;
  return `${yearRange}_semester${semester}_${groupId.toLowerCase()}@projectreview.local`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Check if admin
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        if (firebaseUser.email?.toLowerCase() === adminEmail?.toLowerCase()) {
          setIsAdmin(true);
          setStudentData(null);
          setLoading(false);
        } else {
          setIsAdmin(false);
          // Fetch student data
          try {
            const studentDoc = await getDoc(doc(db, "students", firebaseUser.uid));
            if (studentDoc.exists()) {
              setStudentData({ id: studentDoc.id, ...studentDoc.data() } as Student);
            }
          } catch (err) {
            console.error("Error fetching student data:", err);
          } finally {
            setLoading(false);
          }
        }
      } else {
        setStudentData(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  async function login(year: number, semester: number, groupId: string, password: string) {
    const email = makeEmail(year, semester, groupId);
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function adminLogin(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function register(
    password: string,
    name: string,
    groupId: string,
    batchId: string,
    year: number,
    semester: number
  ) {
    const email = makeEmail(year, semester, groupId);
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "students", cred.user.uid), {
      groupId,
      batchId,
      name,
      createdAt: Date.now(),
    });
  }

  async function logout() {
    await signOut(auth);
    setStudentData(null);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider
      value={{ user, studentData, setStudentData, isAdmin, loading, login, adminLogin, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
