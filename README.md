# موقع كريم السيد

[![نشر على Vercel](https://img.shields.io/badge/نشر-Vercel-black?logo=vercel)](https://vercel.com)

موقع شخصي مبني بتقنية Next.js لعرض أعمال ومشاريع كريم السيد في مجال هندسة الصوت.

## المميزات

- عرض المشاريع والأعمال بتصميم متوافق مع جميع الأجهزة
- لوحة تحكم متكاملة لإدارة المحتوى
- صفحة هيرو متحركة مع إمكانية تحميل بطاقة الاتصال (vCard)
- قسم للمشاريع مع فلترة حسب التصنيفات
- قسم للتايم لاين لعرض المسيرة المهنية
- قسم للتواصل ووسائل الاتصال
- تخزين بيانات الموقع على Firebase

## التقنيات المستخدمة

- Next.js 15.x
- TypeScript
- Tailwind CSS
- Framer Motion
- Firebase (Firestore + Storage)
- React Icons

## متطلبات التشغيل

- Node.js 18.17 أو أحدث

## تثبيت وتشغيل المشروع محلياً

1. استنساخ المشروع:
```bash
git clone https://github.com/codesrun77/karim-portfolio.git
cd karim-portfolio
```

2. تثبيت الحزم المطلوبة:
```bash
npm install
```

3. إنشاء ملف البيئة المحلية `.env.local` وإضافة بيانات اعتماد Firebase:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. تشغيل خادم التطوير:
```bash
npm run dev
```

5. فتح المتصفح على عنوان [http://localhost:3000](http://localhost:3000)

## النشر على Vercel

يمكن نشر المشروع بسهولة على منصة Vercel باتباع الخطوات التالية:

1. قم بإنشاء حساب على [Vercel](https://vercel.com) إذا لم يكن لديك واحد.
2. قم بربط مستودع GitHub الخاص بالمشروع.
3. أضف متغيرات البيئة المطلوبة (نفس المتغيرات في ملف `.env.local`) في إعدادات المشروع.
4. انقر على "Deploy" لبدء عملية النشر.

تم تكوين المشروع باستخدام ملف `vercel.json` لتحسين أداء وأمان النشر.

## ترخيص المشروع

جميع الحقوق محفوظة © 2024 كريم السيد
