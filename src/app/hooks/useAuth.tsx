"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  });

  useEffect(() => {
    console.log("مكون useAuth قيد التنفيذ...");
    
    // التحقق من وجود كائن المصادقة
    if (!auth) {
      console.error("كائن المصادقة غير موجود!");
      setAuthState({
        user: null,
        loading: false
      });
      return;
    }
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("تغيير حالة المصادقة:", user ? `مسجل الدخول: ${user.email}` : "غير مسجل الدخول");
      
      setAuthState({
        user,
        loading: false
      });
    });

    return () => unsubscribe();
  }, []);

  return authState;
} 