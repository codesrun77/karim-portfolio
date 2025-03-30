"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    console.log("محاولة تسجيل الدخول مع البريد:", email);
    
    try {
      // محاولة تسجيل الدخول
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // تسجيل نجاح العملية
      console.log("تم تسجيل الدخول بنجاح:", userCredential.user.email);
      console.log("معرف المستخدم:", userCredential.user.uid);
      
      // اختبار ما إذا كان حدث تحديث للمستخدم في حالة المصادقة
      const currentUser = auth.currentUser;
      console.log("المستخدم الحالي بعد تسجيل الدخول:", currentUser?.email || "لا يوجد");
      
      // تأخير قصير لضمان تحديث حالة المصادقة
      setTimeout(() => {
        console.log("حالة المصادقة بعد تأخير:", auth.currentUser?.email || "لا يوجد");
        router.push("/admin");
      }, 1000);
    } catch (error: any) {
      console.error("خطأ في تسجيل الدخول:", error);
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
      } else if (error.code === "auth/too-many-requests") {
        setError("تم تعطيل الحساب مؤقتًا بسبب محاولات تسجيل دخول متكررة");
      } else {
        setError(`خطأ في تسجيل الدخول: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">تسجيل الدخول إلى لوحة التحكم</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={signIn}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">البريد الإلكتروني</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">كلمة المرور</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "جاري التسجيل..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
} 