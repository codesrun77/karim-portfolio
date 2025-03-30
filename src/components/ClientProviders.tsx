'use client';

import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';

// استيراد ديناميكي لمكون OfflineNotice لتجنب أخطاء الـ SSR
const OfflineNotice = dynamic(() => import('./OfflineNotice'), { ssr: false });

interface ClientProvidersProps {
  fontFamily?: string;
}

export default function ClientProviders({ fontFamily }: ClientProvidersProps) {
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