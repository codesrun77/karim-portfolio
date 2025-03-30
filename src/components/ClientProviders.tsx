'use client';

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { initializeFirebase } from '@/lib/firebase';

// استيراد ديناميكي لمكون OfflineNotice لتجنب أخطاء الـ SSR
const OfflineNotice = dynamic(() => import('./OfflineNotice'), { ssr: false });

interface ClientProvidersProps {
  fontFamily?: string;
}

export default function ClientProviders({ fontFamily }: ClientProvidersProps) {
  // تهيئة Firebase عندما يتم تحميل المكون
  useEffect(() => {
    try {
      initializeFirebase();
    } catch (error) {
      console.error('فشل تهيئة Firebase في ClientProviders:', error);
    }
  }, []);

  return (
    <>
      <OfflineNotice />
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            fontFamily: fontFamily || 'inherit',
            direction: 'rtl'
          }
        }}
      />
    </>
  );
} 