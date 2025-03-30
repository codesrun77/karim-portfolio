import { collection, doc, setDoc, getDocs, getDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

// أنواع البيانات
export interface Project {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  desc: string;
  year: string;
}

export interface PersonalInfo {
  id: string;
  icon: string;
  title: string;
  info: string;
  extra: string | null;
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
  icon: string;
}

export interface ContactInfo {
  id: string;
  icon: string;
  title: string;
  value?: string;
  subtitle?: string;
  link: string;
  color?: string;
}

export interface SocialLink {
  id: string;
  icon: string;
  url: string;
  label: string;
}

export interface HeroInfo {
  name: string;
  title: string;
  bio: string;
  skills: string[];
}

// وظائف الحفظ والاسترجاع

// معلومات الاتصال
export const saveFirebaseContactInfo = async (contactInfo: ContactInfo[]): Promise<boolean> => {
  try {
    // حفظ جميع معلومات الاتصال دفعة واحدة
    await setDoc(doc(db, "siteData", "contactInfo"), { items: contactInfo });
    console.log("تم حفظ معلومات الاتصال في Firestore بنجاح");
    return true;
  } catch (error) {
    console.error("خطأ في حفظ معلومات الاتصال في Firestore:", error);
    return false;
  }
};

export const getFirebaseContactInfo = async (): Promise<ContactInfo[] | null> => {
  try {
    const docRef = doc(db, "siteData", "contactInfo");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.items as ContactInfo[];
    } else {
      console.log("لا توجد بيانات اتصال في Firestore");
      return null;
    }
  } catch (error) {
    console.error("خطأ في جلب معلومات الاتصال من Firestore:", error);
    return null;
  }
};

// المعلومات الشخصية
export const saveFirebasePersonalInfo = async (personalInfo: PersonalInfo[]): Promise<boolean> => {
  try {
    await setDoc(doc(db, "siteData", "personalInfo"), { items: personalInfo });
    console.log("تم حفظ المعلومات الشخصية في Firestore بنجاح");
    return true;
  } catch (error) {
    console.error("خطأ في حفظ المعلومات الشخصية في Firestore:", error);
    return false;
  }
};

export const getFirebasePersonalInfo = async (): Promise<PersonalInfo[] | null> => {
  try {
    const docRef = doc(db, "siteData", "personalInfo");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.items as PersonalInfo[];
    } else {
      console.log("لا توجد معلومات شخصية في Firestore");
      return null;
    }
  } catch (error) {
    console.error("خطأ في جلب المعلومات الشخصية من Firestore:", error);
    return null;
  }
};

// الخبرات المهنية
export const saveFirebaseExperiences = async (experiences: Experience[]): Promise<boolean> => {
  try {
    await setDoc(doc(db, "siteData", "experiences"), { items: experiences });
    console.log("تم حفظ الخبرات المهنية في Firestore بنجاح");
    return true;
  } catch (error) {
    console.error("خطأ في حفظ الخبرات المهنية في Firestore:", error);
    return false;
  }
};

export const getFirebaseExperiences = async (): Promise<Experience[] | null> => {
  try {
    const docRef = doc(db, "siteData", "experiences");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.items as Experience[];
    } else {
      console.log("لا توجد خبرات مهنية في Firestore");
      return null;
    }
  } catch (error) {
    console.error("خطأ في جلب الخبرات المهنية من Firestore:", error);
    return null;
  }
};

// المشاريع
export const saveFirebaseProjects = async (projects: Project[]): Promise<boolean> => {
  try {
    await setDoc(doc(db, "siteData", "projects"), { items: projects });
    console.log("تم حفظ المشاريع في Firestore بنجاح");
    return true;
  } catch (error) {
    console.error("خطأ في حفظ المشاريع في Firestore:", error);
    return false;
  }
};

export const getFirebaseProjects = async (): Promise<Project[] | null> => {
  try {
    const docRef = doc(db, "siteData", "projects");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.items as Project[];
    } else {
      console.log("لا توجد مشاريع في Firestore");
      return null;
    }
  } catch (error) {
    console.error("خطأ في جلب المشاريع من Firestore:", error);
    return null;
  }
};

// معلومات القسم الرئيسي
export const saveFirebaseHeroInfo = async (heroInfo: HeroInfo): Promise<boolean> => {
  try {
    console.log("بدء عملية حفظ معلومات القسم الرئيسي في Firestore...");
    
    if (!db) {
      console.error("قاعدة البيانات غير متاحة");
      return false;
    }
    
    // طباعة البيانات قبل الحفظ للتشخيص
    console.log("بيانات القسم الرئيسي التي سيتم حفظها:", heroInfo);
    console.log("مسار الحفظ: siteData/heroInfo");
    
    // حفظ البيانات مباشرة (بدون وضعها في مصفوفة items)
    await setDoc(doc(db, "siteData", "heroInfo"), heroInfo);
    console.log("تم حفظ معلومات القسم الرئيسي في Firestore بنجاح");
    
    // حفظ البيانات أيضًا في localStorage للتأكد من توفرها دائمًا
    localStorage.setItem("heroInfo", JSON.stringify(heroInfo));
    console.log("تم نسخ البيانات للتخزين المحلي أيضًا");
    
    return true;
  } catch (error) {
    console.error("خطأ في حفظ معلومات القسم الرئيسي في Firestore:", error);
    return false;
  }
};

export const getFirebaseHeroInfo = async (): Promise<HeroInfo | null> => {
  try {
    const docRef = doc(db, "siteData", "heroInfo");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as HeroInfo;
    } else {
      console.log("لا توجد معلومات للقسم الرئيسي في Firestore");
      return null;
    }
  } catch (error) {
    console.error("خطأ في جلب معلومات القسم الرئيسي من Firestore:", error);
    return null;
  }
};

// روابط التواصل الاجتماعي
export const saveFirebaseSocialLinks = async (socialLinks: SocialLink[]): Promise<boolean> => {
  try {
    await setDoc(doc(db, "siteData", "socialLinks"), { items: socialLinks });
    console.log("تم حفظ روابط التواصل الاجتماعي في Firestore بنجاح");
    return true;
  } catch (error) {
    console.error("خطأ في حفظ روابط التواصل الاجتماعي في Firestore:", error);
    return false;
  }
};

export const getFirebaseSocialLinks = async (): Promise<SocialLink[] | null> => {
  try {
    const docRef = doc(db, "siteData", "socialLinks");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.items as SocialLink[];
    } else {
      console.log("لا توجد روابط تواصل اجتماعي في Firestore");
      return null;
    }
  } catch (error) {
    console.error("خطأ في جلب روابط التواصل الاجتماعي من Firestore:", error);
    return null;
  }
}; 