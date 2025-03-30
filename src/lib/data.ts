// src/lib/data.ts
// وظيفة لتحميل البيانات من localStorage

import { HeroInfo, PersonalInfo, Experience, Project, ContactInfo, SocialLink } from "@/types";
import { db } from "./firebase";
import { collection, doc, getDoc, setDoc, getDocs } from "firebase/firestore";

// القيم الافتراضية للبيانات إذا لم تكن موجودة في localStorage
const defaultHeroInfo: HeroInfo = {
  name: "كريم السيد",
  title: "مهندس صوت محترف",
  bio: "أعمل في مجال هندسة الصوت منذ أكثر من 10 سنوات، قمت خلالها بالعمل في العديد من الأفلام والمسلسلات والإعلانات. أسعى دائماً لتقديم أفضل جودة صوتية ممكنة لجميع المشاريع.",
  skills: ["هندسة صوت", "مونتاج", "موسيقى", "إنتاج"]
};

const defaultPersonalInfo: PersonalInfo[] = [
  {
    id: "info-1",
    title: "من أنا",
    content: "مهندس صوت محترف مع خبرة أكثر من 10 سنوات في المجال السمعي والصوتي"
  },
  {
    id: "info-2",
    title: "الخبرة",
    content: "عملت في العديد من الاستوديوهات الكبرى وشاركت في إنتاج أعمال فنية متميزة"
  },
  {
    id: "info-3",
    title: "المهارات",
    content: "متخصص في تسجيل وتنقية وتحرير الصوت، بالإضافة إلى الموسيقى التصويرية"
  }
];

const defaultExperiences: Experience[] = [
  {
    id: "exp-1",
    title: "مهندس صوت رئيسي",
    company: "استوديوهات الشرق للإنتاج",
    period: "2019 - الآن",
    description: "مسؤول عن جميع عمليات تسجيل وتحرير الصوت للأفلام والمسلسلات والإعلانات",
    icon: "FaHeadphones"
  },
  {
    id: "exp-2",
    title: "مصمم صوتي",
    company: "شركة الإنتاج الفني المتحدة",
    period: "2015 - 2019",
    description: "تصميم المؤثرات الصوتية وخلق بيئات صوتية مميزة للأعمال الدرامية",
    icon: "FaMusic"
  },
  {
    id: "exp-3",
    title: "منتج موسيقي",
    company: "استوديو الإبداع للصوتيات",
    period: "2013 - 2015",
    description: "إنتاج الموسيقى التصويرية والأغاني للعديد من الأعمال الفنية",
    icon: "FaMicrophone"
  }
];

const defaultProjects: Project[] = [
  {
    id: "project-1",
    title: "فيلم أصوات الحياة",
    description: "تصميم الصوت لفيلم وثائقي يستكشف الأصوات الطبيعية حول العالم",
    image: "/images/projects/project-1.jpg",
    category: "تصميم صوتي",
    link: "#"
  },
  {
    id: "project-2",
    title: "مسلسل صدى الماضي",
    description: "تسجيل وتنقية وتحرير الصوت لمسلسل درامي من 30 حلقة",
    image: "/images/projects/project-2.jpg",
    category: "إنتاج تلفزيوني",
    link: "#"
  },
  {
    id: "project-3",
    title: "أغنية 'طريق النور'",
    description: "إنتاج موسيقي كامل لأغنية منفردة حققت نجاحاً كبيراً",
    image: "/images/projects/project-3.jpg",
    category: "إنتاج موسيقي",
    link: "#"
  }
];

const defaultContactInfo: ContactInfo[] = [
  {
    id: "contact-1",
    icon: "FaEnvelope",
    title: "البريد الإلكتروني",
    value: "info@karimsound.com",
    link: "mailto:info@karimsound.com"
  },
  {
    id: "contact-2",
    icon: "FaPhone",
    title: "رقم الهاتف",
    value: "+971 50 123 4567",
    link: "tel:+971501234567"
  },
  {
    id: "contact-3",
    icon: "FaMapMarkerAlt",
    title: "الموقع",
    value: "دبي، الإمارات العربية المتحدة",
    link: "https://maps.google.com/?q=Dubai,UAE"
  }
];

const defaultSocialLinks: SocialLink[] = [
  { id: "linkedin", icon: "FaLinkedin", url: "https://linkedin.com/", label: "LinkedIn" },
  { id: "instagram", icon: "FaInstagram", url: "https://instagram.com/", label: "Instagram" },
  { id: "facebook", icon: "FaFacebook", url: "https://facebook.com/", label: "Facebook" },
  { id: "twitter", icon: "FaTwitter", url: "https://twitter.com/", label: "Twitter" }
];

// تحميل معلومات القسم الرئيسي
export const getHeroInfo = async (): Promise<HeroInfo> => {
  console.log("=== بدء تنفيذ getHeroInfo ===");
  
  // حماية من استدعاء الدالة على جانب الخادم
  if (typeof window === 'undefined') {
    console.log("getHeroInfo: تم الاستدعاء على جانب الخادم، استخدام القيم الافتراضية");
    return defaultHeroInfo;
  }
  
  try {
    // التحقق من وجود db قبل استخدامه
    if (!db) {
      console.log("getHeroInfo: Firestore غير متاح، استخدام القيم الافتراضية");
      return defaultHeroInfo;
    }
    
    console.log("محاولة قراءة بيانات القسم الرئيسي من Firestore...");
    // محاولة تحميل البيانات من Firestore - قراءة مباشرة من المستند
    const docRef = doc(db, "siteData", "heroInfo");
    console.log("تم إنشاء docRef:", docRef);
    
    const docSnap = await getDoc(docRef);
    console.log("تم الحصول على docSnap، هل الوثيقة موجودة؟", docSnap.exists());
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("تم الحصول على بيانات:", data);
      
      // استخدام البيانات مباشرة - متوافقة مع طريقة saveFirebaseHeroInfo في لوحة التحكم
      return data as HeroInfo;
    } else {
      console.log("لم يتم العثور على بيانات القسم الرئيسي في Firestore");
    }
    
    // محاولة استخدام localStorage كاحتياطي
    console.log("جاري محاولة القراءة من localStorage...");
    try {
      const savedHeroInfo = localStorage.getItem("heroInfo");
      if (savedHeroInfo) {
        console.log("تم العثور على بيانات في localStorage");
        return JSON.parse(savedHeroInfo);
      } else {
        console.log("لم يتم العثور على بيانات في localStorage");
      }
    } catch (localError) {
      console.error("خطأ في قراءة localStorage:", localError);
    }
  } catch (error) {
    console.error("خطأ في قراءة بيانات القسم الرئيسي:", error);
  }
  
  console.log("لم يتم العثور على أي بيانات، استخدام القيم الافتراضية");
  return defaultHeroInfo;
};

// تحميل المعلومات الشخصية
export const getPersonalInfo = async (): Promise<PersonalInfo[]> => {
  if (typeof window === 'undefined') {
    return defaultPersonalInfo;
  }
  
  try {
    if (!db) {
      return defaultPersonalInfo;
    }
    
    // قراءة مباشرة من siteData/personalInfo - نفس المسار المستخدم في لوحة التحكم
    const docRef = doc(db, "siteData", "personalInfo");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // التأكد من وجود مصفوفة items كما في لوحة التحكم
      if (data.items && Array.isArray(data.items)) {
        return data.items as PersonalInfo[];
      }
    }
    
    // محاولة استخدام localStorage كاحتياطي
    const savedPersonalInfo = localStorage.getItem("personalInfo");
    if (savedPersonalInfo) {
      return JSON.parse(savedPersonalInfo);
    }
  } catch (error) {
    console.error("خطأ في قراءة المعلومات الشخصية:", error);
  }
  
  return defaultPersonalInfo;
};

// تحميل الخبرات المهنية
export const getExperiences = async (): Promise<Experience[]> => {
  if (typeof window === 'undefined') {
    return defaultExperiences;
  }
  
  try {
    if (!db) {
      return defaultExperiences;
    }
    
    // قراءة مباشرة من siteData/experiences - نفس المسار المستخدم في لوحة التحكم
    const docRef = doc(db, "siteData", "experiences");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // التأكد من وجود مصفوفة items كما في لوحة التحكم
      if (data.items && Array.isArray(data.items)) {
        return data.items as Experience[];
      }
    }
    
    // محاولة استخدام localStorage كاحتياطي
    const savedExperiences = localStorage.getItem("experiences");
    if (savedExperiences) {
      return JSON.parse(savedExperiences);
    }
  } catch (error) {
    console.error("خطأ في قراءة الخبرات المهنية:", error);
  }
  
  return defaultExperiences;
};

// تحميل المشاريع
export const getProjects = async (): Promise<Project[]> => {
  if (typeof window === 'undefined') {
    return defaultProjects;
  }
  
  try {
    if (!db) {
      return defaultProjects;
    }
    
    // قراءة مباشرة من siteData/projects
    const docRef = doc(db, "siteData", "projects");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // التأكد من وجود مصفوفة items كما في لوحة التحكم
      if (data.items && Array.isArray(data.items)) {
        return data.items as Project[];
      }
    }
    
    // محاولة استخدام localStorage كاحتياطي
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
  } catch (error) {
    console.error("خطأ في قراءة المشاريع:", error);
  }
  
  return defaultProjects;
};

// تحميل معلومات الاتصال
export const getContactInfo = async (): Promise<ContactInfo[]> => {
  if (typeof window === 'undefined') {
    return defaultContactInfo;
  }
  
  try {
    if (!db) {
      return defaultContactInfo;
    }
    
    // قراءة مباشرة من siteData/contactInfo - نفس المسار المستخدم في لوحة التحكم
    const docRef = doc(db, "siteData", "contactInfo");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // التأكد من وجود مصفوفة items كما في لوحة التحكم
      if (data.items && Array.isArray(data.items)) {
        return data.items as ContactInfo[];
      }
    }
    
    // محاولة استخدام localStorage كاحتياطي
    const savedContactInfo = localStorage.getItem("contactInfo");
    if (savedContactInfo) {
      return JSON.parse(savedContactInfo);
    }
  } catch (error) {
    console.error("خطأ في قراءة معلومات الاتصال:", error);
  }
  
  return defaultContactInfo;
};

// تحميل وسائل التواصل الاجتماعي
export const getSocialLinks = async (): Promise<SocialLink[]> => {
  if (typeof window === 'undefined') {
    return defaultSocialLinks;
  }
  
  try {
    if (!db) {
      return defaultSocialLinks;
    }
    
    // قراءة مباشرة من siteData/socialLinks - نفس المسار المستخدم في لوحة التحكم
    const docRef = doc(db, "siteData", "socialLinks");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // التأكد من وجود مصفوفة items كما في لوحة التحكم
      if (data.items && Array.isArray(data.items)) {
        return data.items as SocialLink[];
      }
    }
    
    // محاولة استخدام localStorage كاحتياطي
    const savedSocialLinks = localStorage.getItem("socialLinks");
    if (savedSocialLinks) {
      return JSON.parse(savedSocialLinks);
    }
  } catch (error) {
    console.error("خطأ في قراءة وسائل التواصل الاجتماعي:", error);
  }
  
  return defaultSocialLinks;
};

// وظيفة تحميل معلومات الاتصال من Firestore
export const getFirebaseContactInfo = async (): Promise<ContactInfo[]> => {
  try {
    if (!db) {
      console.error("Firestore غير متاح");
      throw new Error("Firestore غير متاح");
    }
    
    const docRef = doc(db, "siteData", "contactInfo");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data().items as ContactInfo[];
    }
  } catch (error) {
    console.error("خطأ في استرجاع معلومات الاتصال:", error);
  }
  
  // إذا لم يكن هناك بيانات محفوظة أو حدث خطأ، استخدم القيم الافتراضية
  return defaultContactInfo;
};

// وظيفة حفظ معلومات الاتصال في Firestore
export const saveFirebaseContactInfo = async (contactInfo: ContactInfo[]): Promise<boolean> => {
  try {
    if (!db) {
      console.error("Firestore غير متاح");
      throw new Error("Firestore غير متاح");
    }
    
    await setDoc(doc(db, "siteData", "contactInfo"), { items: contactInfo });
    return true;
  } catch (error) {
    console.error("خطأ في حفظ معلومات الاتصال:", error);
    return false;
  }
}; 