/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // تجاهل أخطاء ESLint عند البناء
    ignoreDuringBuilds: true,
  },
  typescript: {
    // تجاهل أخطاء TypeScript عند البناء
    ignoreBuildErrors: true,
  },
  // تكوين معالجة الصور
  images: {
    domains: ['firebasestorage.googleapis.com'],
    unoptimized: true, // تعزيز استقرار تحميل الصور
  },
  // تحسين تخزين الكود المؤقت
  experimental: {
    optimizeCss: true
  },
  // زيادة وقت الانتظار للتحميل
  staticPageGenerationTimeout: 180,
  // تجنب مشكلات تحميل بعض المكتبات
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false,
      path: false,
      os: false,
      net: false,
      tls: false
    };

    return config;
  },
  productionBrowserSourceMaps: false // تحسين الأداء في الإنتاج
};

export default nextConfig; 