'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FaExclamationTriangle, FaWifi, FaHome, FaRedo } from 'react-icons/fa';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // سجل الخطأ للتحليل
    console.error('خطأ في تطبيق بورتفوليو كريم:', error);
  }, [error]);

  // تحديد نوع الخطأ وتقديم رسالة مخصصة
  let errorMessage = 'حدث خطأ غير متوقع';
  let errorType = 'general';
  
  // التحقق من نوع الخطأ
  if (error.message?.includes('network') || error.message?.includes('اتصال') || error.message?.includes('connection')) {
    errorType = 'network';
    errorMessage = 'يبدو أن هناك مشكلة في الاتصال بالإنترنت';
  } else if (error.message?.includes('Firebase') || error.message?.includes('permission') || error.message?.includes('firestore')) {
    errorType = 'firebase';
    errorMessage = 'حدث خطأ أثناء الاتصال بقاعدة البيانات';
  } else if (error.message?.includes('timeout') || error.message?.includes('انتهت المهلة')) {
    errorType = 'timeout';
    errorMessage = 'استغرقت العملية وقتاً طويلاً';
  }
 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black p-4 text-center">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-blue-700/20">
        <div className="flex justify-center mb-6">
          {errorType === 'network' ? (
            <FaWifi className="text-6xl text-red-500 mb-4" />
          ) : (
            <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          {errorType === 'network' ? 'مشكلة في الاتصال' : 'حدث خطأ غير متوقع'}
        </h2>
        
        <p className="text-gray-300 mb-6">
          {errorMessage}
          {errorType === 'network' && (
            <span className="block mt-2 text-sm">
              تأكد من اتصالك بالإنترنت وحاول مرة أخرى.
            </span>
          )}
          {errorType === 'firebase' && (
            <span className="block mt-2 text-sm">
              قد تكون هناك مشكلة مؤقتة في الخادم، يرجى المحاولة مرة أخرى لاحقاً.
            </span>
          )}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-colors"
          >
            <FaRedo />
            <span>إعادة المحاولة</span>
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg text-white font-medium transition-colors"
          >
            <FaHome />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
      
      {/* معلومات إضافية للخطأ */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 max-w-md w-full bg-gray-800/30 backdrop-blur-md p-6 rounded-lg border border-red-900/20">
          <h3 className="text-lg font-bold text-red-400 mb-2">تفاصيل الخطأ (بيئة التطوير فقط)</h3>
          <p className="text-sm text-gray-400 overflow-auto max-h-32 whitespace-pre-wrap">
            {error.message || error.stack || JSON.stringify(error)}
          </p>
        </div>
      )}
    </div>
  );
} 