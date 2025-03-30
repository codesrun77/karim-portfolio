import './globals.css'
import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import { Tajawal } from 'next/font/google'
import Script from 'next/script'
import Header from "@/components/Header";
import Footer from '@/components/Footer'
import ClientProviders from '@/components/ClientProviders'

const cairo = Cairo({ subsets: ['arabic'] })
const tajawal = Tajawal({ weight: ['400', '500', '700', '800'], subsets: ['arabic'] })

export const metadata: Metadata = {
  title: 'كريم السيد - مهندس صوت محترف',
  description: 'الموقع الرسمي لكريم السيد - مهندس صوت ومونتير محترف',
  icons: {
    icon: [
      { url: "/favicon.webp", type: "image/webp" },
    ],
    apple: [
      { url: "/favicon.webp", type: "image/webp" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.webp" type="image/webp" />
      </head>
      <body className={`${tajawal.className} bg-black text-white`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        
        {/* استخدام مكون ClientProviders بدلاً من المكونات المباشرة */}
        <ClientProviders fontFamily={tajawal.style.fontFamily} />
        
        <Script id="theme-detector">
          {`
            (function() {
              try {
                const savedTheme = localStorage.getItem('theme');
                if (savedTheme) {
                  document.documentElement.classList.add(savedTheme);
                  if (savedTheme === 'light') {
                    document.documentElement.classList.remove('dark');
                  }
                } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (e) {
                console.error('Theme detection failed:', e);
              }
            })();
          `}
        </Script>
      </body>
    </html>
  )
}
