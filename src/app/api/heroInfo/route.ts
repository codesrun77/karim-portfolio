import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

// البيانات الافتراضية في حالة عدم توفر البيانات في Firestore
const defaultHeroInfo = {
  name: "كريم السيد",
  title: "مهندس صوت محترف",
  bio: "أعمل في مجال هندسة الصوت منذ أكثر من 10 سنوات، قمت خلالها بالعمل في العديد من الأفلام والمسلسلات والإعلانات. أسعى دائماً لتقديم أفضل جودة صوتية ممكنة لجميع المشاريع.",
  skills: ["هندسة صوت", "مونتاج", "موسيقى", "إنتاج"]
};

if (!admin.apps.length) {
  if (process.env.FIREBASE_ADMIN_SDK) {
    try {
      // استخدام بيانات اعتماد Firebase Admin من المتغير البيئي
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
      });
      console.log("Firebase Admin initialized using FIREBASE_ADMIN_SDK");
    } catch (error) {
      console.error("فشل تهيئة Firebase Admin باستخدام بيانات الاعتماد من FIREBASE_ADMIN_SDK:", error);
      admin.initializeApp({
        credential: admin.credential.applicationDefault()
      });
    }
  } else {
    console.error("بيانات اعتماد Firebase Admin غير متوفرة في المتغير البيئي FIREBASE_ADMIN_SDK");
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
}

const dbAdmin = admin.firestore();

export async function GET() {
  try {
    console.log("استلام طلب GET للحصول على معلومات القسم الرئيسي باستخدام Firebase Admin");
    const docRef = dbAdmin.doc("siteData/heroInfo");
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      console.log("تم استرداد بيانات القسم الرئيسي من Firestore:", data);
      return NextResponse.json(data);
    } else {
      console.log("لا توجد بيانات في Firestore، إرجاع البيانات الافتراضية");
      return NextResponse.json(defaultHeroInfo);
    }
  } catch (error) {
    console.error("خطأ في استرداد معلومات القسم الرئيسي:", error);
    return NextResponse.json(defaultHeroInfo);
  }
}
