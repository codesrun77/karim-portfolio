// وظيفة لإعادة تهيئة جميع البيانات في Firebase
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import {
  HeroInfo,
  PersonalInfo,
  Experience,
  Project,
  ContactInfo,
  SocialLink
} from "@/types";

// البيانات الافتراضية
const defaultHeroInfo: HeroInfo = {
  name: "كريم السيد",
  title: "مهندس صوت محترف",
  bio: "أعمل في مجال هندسة الصوت منذ أكثر من 10 سنوات، قمت خلالها بالعمل في العديد من الأفلام والمسلسلات والإعلانات. أسعى دائماً لتقديم أفضل جودة صوتية ممكنة لجميع المشاريع.",
  skills: ["هندسة صوت", "مونتاج", "موسيقى", "إنتاج"]
};

const defaultPersonalInfo: PersonalInfo[] = [
  {
    id: "info-1",
    title: "التعليم",
    content: "بكاليريوس المعهد العالي للسينما - قسم هندسة صوت - عام التخرج 2012"
  },
  {
    id: "info-2",
    title: "تاريخ الميلاد",
    content: "12-9-1989"
  },
  {
    id: "info-3",
    title: "الجنسية",
    content: "مصري"
  },
  {
    id: "info-4",
    title: "بلد الاقامة",
    content: "الامارات"
  }
];

const defaultExperiences: Experience[] = [
  {
    id: "1",
    title: "مهندس صوت رئيسي",
    company: "استوديوهات الشرق للإنتاج",
    period: "2019 - الآن",
    description: "مسؤول عن جميع عمليات تسجيل وتحرير الصوت للأفلام والمسلسلات والإعلانات",
    icon: "FaHeadphones"
  },
  {
    id: "2",
    title: "مصمم صوتي",
    company: "شركة الإنتاج الفني المتحدة",
    period: "2015 - 2019",
    description: "تصميم المؤثرات الصوتية وخلق بيئات صوتية مميزة للأعمال الدرامية",
    icon: "FaMusic"
  },
  {
    id: "3",
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

// وظيفة لإعادة تهيئة جميع البيانات
export const initializeAllData = async (): Promise<boolean> => {
  try {
    console.log("===== بدء إعادة تهيئة جميع البيانات =====");
    
    if (!db) {
      console.error("قاعدة البيانات غير متاحة");
      return false;
    }
    
    // حفظ معلومات القسم الرئيسي
    console.log("جاري حفظ معلومات القسم الرئيسي...");
    await setDoc(doc(db, "siteData", "heroInfo"), defaultHeroInfo);
    console.log("✅ تم حفظ معلومات القسم الرئيسي");
    
    // حفظ المعلومات الشخصية
    console.log("جاري حفظ المعلومات الشخصية...");
    await setDoc(doc(db, "siteData", "personalInfo"), { items: defaultPersonalInfo });
    console.log("✅ تم حفظ المعلومات الشخصية");
    
    // حفظ الخبرات المهنية
    console.log("جاري حفظ الخبرات المهنية...");
    await setDoc(doc(db, "siteData", "experiences"), { items: defaultExperiences });
    console.log("✅ تم حفظ الخبرات المهنية");
    
    // حفظ المشاريع
    console.log("جاري حفظ المشاريع...");
    await setDoc(doc(db, "siteData", "projects"), { items: defaultProjects });
    console.log("✅ تم حفظ المشاريع");
    
    // حفظ معلومات الاتصال
    console.log("جاري حفظ معلومات الاتصال...");
    await setDoc(doc(db, "siteData", "contactInfo"), { items: defaultContactInfo });
    console.log("✅ تم حفظ معلومات الاتصال");
    
    // حفظ روابط التواصل الاجتماعي
    console.log("جاري حفظ روابط التواصل الاجتماعي...");
    await setDoc(doc(db, "siteData", "socialLinks"), { items: defaultSocialLinks });
    console.log("✅ تم حفظ روابط التواصل الاجتماعي");
    
    console.log("===== تمت إعادة تهيئة جميع البيانات بنجاح =====");
    
    // حفظ البيانات أيضًا في localStorage للاحتياط
    localStorage.setItem("heroInfo", JSON.stringify(defaultHeroInfo));
    localStorage.setItem("personalInfo", JSON.stringify(defaultPersonalInfo));
    localStorage.setItem("experiences", JSON.stringify(defaultExperiences));
    localStorage.setItem("projects", JSON.stringify(defaultProjects));
    localStorage.setItem("contactInfo", JSON.stringify(defaultContactInfo));
    localStorage.setItem("socialLinks", JSON.stringify(defaultSocialLinks));
    
    return true;
  } catch (error) {
    console.error("❌ خطأ في إعادة تهيئة البيانات:", error);
    return false;
  }
}; 