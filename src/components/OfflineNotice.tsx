'use client';

import { useState, useEffect } from 'react';
import { FaWifi, FaExclamationTriangle } from 'react-icons/fa';

export default function OfflineNotice() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // التحقق من الحالة الأولية
    setIsOnline(navigator.onLine);
    
    // إضافة مستمعي الأحداث
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // تنظيف المستمعين عند إزالة المكون
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // لا تعرض شيئًا إذا كان المستخدم متصلاً
  if (isOnline) return null;
  
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-red-900/90 text-white p-2 flex items-center justify-center gap-2 text-sm backdrop-blur-sm animate-pulse">
      <FaWifi className="text-red-300" />
      <span>أنت غير متصل بالإنترنت. قد لا تكون بعض الميزات متاحة.</span>
    </div>
  );
} 