"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("مكون AuthCheck قيد التنفيذ...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("تغيير حالة المصادقة داخل AuthCheck:", user ? `مسجل الدخول: ${user.email}` : "غير مسجل الدخول");
      
      if (user) {
        console.log("المستخدم مسجل الدخول:", user.email);
        console.log("معرف المستخدم:", user.uid);
        setIsLoggedIn(true);
      } else {
        console.log("المستخدم غير مسجل الدخول، توجيه إلى صفحة تسجيل الدخول");
        setIsLoggedIn(false);
        router.replace("/admin/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">جاري التحقق من تسجيل الدخول...</p>
      </div>
    );
  }

  if (isLoggedIn) {
    return <>{children}</>;
  }

  // سيتم تنفيذ إعادة التوجيه قبل الوصول إلى هنا، ولكن نعيد null كإجراء وقائي
  return null;
};

export default AuthCheck; 