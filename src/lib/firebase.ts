// استخدام 'use client' لضمان تنفيذ الكود فقط على جانب العميل
'use client';

// حل لتتبع حالة التهيئة
let firebaseInitialized = false;

/**
 * التحقق مما إذا كان الكود يعمل في المتصفح
 * هذا مهم لتجنب أخطاء تهيئة Firebase على جانب الخادم
 */
const isBrowser = () => typeof window !== 'undefined';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// المتغيرات العامة
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;

// تكوين Firebase - استخدام المتغيرات البيئية إذا كانت متاحة
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * تهيئة Firebase
 * 
 * تقوم بما يلي:
 * 1. التحقق مما إذا كنا في المتصفح
 * 2. تهيئة التطبيق إذا لم يكن مهيأ بالفعل
 * 3. تهيئة Firestore والتخزين والمصادقة
 * 4. تمكين التخزين المحلي إذا أمكن
 */
export const initializeFirebase = () => {
  try {
    // التنفيذ فقط في المتصفح وإذا لم تتم التهيئة من قبل
    if (isBrowser() && !firebaseInitialized) {
      // التحقق إذا كان هناك متغيرات بيئة مفقودة
      if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        console.error('⚠️ متغيرات بيئة Firebase مفقودة. الرجاء التحقق من ملف .env.local أو إعدادات Vercel');
        return;
      }

      console.log('🔥 تهيئة Firebase...');
      
      // تهيئة التطبيق إذا لم يكن هناك تطبيق موجود بالفعل
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);

      // محاولة تمكين IndexedDB للاستمرار في العمل دون اتصال
      try {
        if (db) {
          enableIndexedDbPersistence(db).catch((err) => {
            if (err.code === 'failed-precondition') {
              console.warn('التخزين المحلي غير متاح لأن المتصفح مفتوح في علامات تبويب متعددة.');
            } else if (err.code === 'unimplemented') {
              console.warn('المتصفح الحالي لا يدعم جميع ميزات التخزين المطلوبة.');
            } else {
              console.error('خطأ في تمكين التخزين المستمر:', err);
            }
          });
        }
      } catch (e) {
        console.warn('فشل تمكين التخزين المحلي:', e);
      }

      firebaseInitialized = true;
      console.log('✅ اكتملت تهيئة Firebase بنجاح');
    }
  } catch (error) {
    console.error('❌ خطأ في تهيئة Firebase:', error);
    firebaseInitialized = false;
  }
};

// دالة مساعدة للحصول على Firestore بطريقة آمنة
const getFirestoreInstance = (): Firestore | null => {
  if (!isBrowser()) {
    console.warn('محاولة الوصول إلى Firestore من جانب الخادم غير مدعومة');
    return null;
  }
  
  if (!firebaseInitialized) {
    initializeFirebase();
  }
  
  return db || null;
};

// دالة مساعدة للحصول على Auth
const getAuthInstance = (): Auth | null => {
  if (!isBrowser()) {
    console.warn('محاولة الوصول إلى Auth من جانب الخادم غير مدعومة');
    return null;
  }
  
  if (!firebaseInitialized) {
    initializeFirebase();
  }
  
  return auth || null;
};

// دالة مساعدة للحصول على Storage
const getStorageInstance = (): FirebaseStorage | null => {
  if (!isBrowser()) {
    console.warn('محاولة الوصول إلى Storage من جانب الخادم غير مدعومة');
    return null;
  }
  
  if (!firebaseInitialized) {
    initializeFirebase();
  }
  
  return storage || null;
};

// تأجيل التهيئة إلى مرحلة أمان في دورة حياة المتصفح
if (isBrowser()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFirebase);
  } else {
    initializeFirebase();
  }
  
  // تأكيد إضافي في حالة تأخر التحميل
  setTimeout(initializeFirebase, 1000);
} else {
  console.log("Firebase لا يمكن تهيئته على الخادم (server-side)");
}

// تصدير الدوال المساعدة
export { getFirestoreInstance, getAuthInstance, getStorageInstance };

// تصدير الكائنات المهيأة لسهولة الاستخدام
export { db, auth, storage, firebaseConfig }; 