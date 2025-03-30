// حل لتتبع حالة التهيئة
let firebaseInitialized = false;

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, onAuthStateChanged, Auth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// تكوين Firebase - استخدام المتغيرات البيئية إذا كانت متاحة
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAvW9t2LxFjUl9LXLmE-9pjgPvAfHQRsLY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "karim-portfolio-43a13.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "karim-portfolio-43a13",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "karim-portfolio-43a13.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1058965750816",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1058965750816:web:df9cb4b6d69f471751a845"
};

// دالة لتسجيل أخطاء Firestore مع تحسين نوع الخطأ
const logFirestoreError = (error: Error | unknown) => {
  console.error("خطأ Firebase:", error);
  const firebaseError = error as { code?: string; message?: string };
  if (firebaseError.code) {
    console.error("رمز الخطأ:", firebaseError.code);
  }
  if (firebaseError.message) {
    console.error("رسالة الخطأ:", firebaseError.message);
  }
  return error;
};

// تعريف متغيرات Firebase بقيم افتراضية خارج الكتلة الشرطية
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;

// تحسين التحقق من بيئة العميل
const initializeFirebase = () => {
  if (!app && typeof window !== "undefined") {
    try {
      console.log("محاولة تهيئة Firebase...");
      
      // التحقق مما إذا كان قد تم تهيئة Firebase بالفعل
      app = getApps().length ? getApp() : initializeApp(firebaseConfig);
      console.log("Firebase App تم إنشاؤه:", app.name);
      
      db = getFirestore(app);
      console.log("Firestore تم تهيئته");
      
      // تمكين التخزين المحلي والعمل بدون اتصال مع معالجة أفضل للأخطاء
      if (db) {
        // تجنب الوعود غير المعالجة عند الاستضافة
        try {
          enableIndexedDbPersistence(db)
            .then(() => {
              console.log("تم تمكين الاحتفاظ بالبيانات محلياً في IndexedDB بنجاح!");
            })
            .catch((err: Error) => {
              const firebaseError = err as { code?: string };
              if (firebaseError.code === 'failed-precondition') {
                console.warn("فشل تمكين الاحتفاظ بالبيانات محلياً: يجب فتح التطبيق في علامة تبويب واحدة فقط.");
              } else if (firebaseError.code === 'unimplemented') {
                console.warn("فشل تمكين الاحتفاظ بالبيانات محلياً: المتصفح الحالي لا يدعم IndexedDB.");
              } else {
                console.error("خطأ في تمكين الاحتفاظ بالبيانات محلياً:", err);
              }
            });
        } catch (error) {
          console.error("خطأ في تهيئة IndexedDB:", error);
        }
      }
      
      storage = getStorage(app);
      console.log("Firebase Storage تم تهيئته");
      
      auth = getAuth(app);
      console.log("Firebase Auth تم تهيئته");
      
      // اختبار الاتصال بقاعدة البيانات بشكل آمن
      if (typeof window !== "undefined") {
        setTimeout(async () => {
          try {
            console.log("اختبار الاتصال بقاعدة البيانات...");
            if (db) {
              const testRef = doc(db, "siteData", "heroInfo");
              const testDoc = await getDoc(testRef);
              console.log("نتيجة اختبار الاتصال:", testDoc.exists() ? "تم العثور على البيانات" : "لم يتم العثور على البيانات");
            }
          } catch (error) {
            console.error("فشل اختبار الاتصال بقاعدة البيانات:", error);
          }
        }, 2000);
      }
      
      // التحقق من حالة المصادقة
      if (auth) {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            console.log("المستخدم مسجل دخول:", user.uid);
          } else {
            console.log("المستخدم غير مسجل دخول");
          }
        });
      }
      
      firebaseInitialized = true;
      console.log("تم تهيئة Firebase بنجاح");
    } catch (error) {
      console.error("خطأ في تهيئة Firebase:", error);
    }
  } else if (typeof window === "undefined") {
    console.log("Firebase لا يمكن تهيئته على الخادم (server-side)");
  } else {
    console.log("Firebase تم تهيئته بالفعل");
  }
};

// التهيئة الآمنة في بيئة العميل فقط
if (typeof window !== "undefined") {
  // تأخير بسيط لضمان تحميل النافذة بشكل كامل
  setTimeout(initializeFirebase, 0);
} else {
  console.log("Firebase لا يمكن تهيئته على الخادم (server-side)");
}

// دالة مساعدة للحصول على Firestore
const getFirestoreInstance = () => {
  if (typeof window !== "undefined" && !db) {
    initializeFirebase();
  }
  return db;
};

// دالة مساعدة للحصول على Auth
const getAuthInstance = () => {
  if (typeof window !== "undefined" && !auth) {
    initializeFirebase();
  }
  return auth;
};

// دالة مساعدة للحصول على Storage
const getStorageInstance = () => {
  if (typeof window !== "undefined" && !storage) {
    initializeFirebase();
  }
  return storage;
};

// تصدير العناصر المطلوبة
export { 
  app, 
  firebaseInitialized, 
  firebaseConfig,
  getFirestoreInstance as db,
  getAuthInstance as auth,
  getStorageInstance as storage
}; 