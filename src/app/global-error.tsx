'use client';

import React from 'react';
import { FaExclamationTriangle, FaRedo, FaHome } from 'react-icons/fa';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // سجل الخطأ في وحدة التحكم
    console.error('خطأ عام في التطبيق:', error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>حدث خطأ - موقع كريم السيد</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gradient-to-b from-gray-900 to-black text-white min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-md p-8 rounded-xl shadow-xl border border-blue-700/20">
          <div className="flex justify-center mb-6">
            <FaExclamationTriangle className="text-6xl text-yellow-500 mb-4" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4 text-center">
            حدث خطأ غير متوقع
          </h2>
          
          <p className="text-gray-300 mb-6 text-center">
            نواجه مشكلة في تحميل الموقع. يرجى تحديث الصفحة أو العودة للصفحة الرئيسية.
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
      </body>
    </html>
  );
} 