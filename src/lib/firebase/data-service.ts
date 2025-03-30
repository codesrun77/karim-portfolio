/**
 * خدمة البيانات - ملف موحد للتعامل مع جميع عمليات قراءة وكتابة البيانات في Firebase
 */
import { db, storage } from "../firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where, deleteDoc, addDoc, updateDoc, orderBy, limit } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import {
  HeroInfo,
  PersonalInfo,
  Experience,
  Project,
  SocialLink,
  CVInfo,
  TimelineItem,
  VideoInfo,
  Category,
  ContactVCard
} from "@/types";
import { getFirestore, Firestore } from 'firebase/firestore';

// استيراد getFirestoreInstance من ملف كاستم
const getFirestoreInstance = () => db;

// بيانات افتراضية للاستخدام عند عدم توفر البيانات
const DEFAULT_DATA = {
  heroInfo: {
    name: "كريم السيد",
    title: "مهندس صوت محترف",
    bio: "أعمل في مجال هندسة الصوت منذ أكثر من 10 سنوات، قمت خلالها بالعمل في العديد من الأفلام والمسلسلات والإعلانات. أسعى دائماً لتقديم أفضل جودة صوتية ممكنة لجميع المشاريع.",
    skills: ["هندسة صوت", "مونتاج", "موسيقى", "إنتاج"]
  },
  // إضافة بيانات افتراضية للتصنيفات
  categories: [
    { id: "all", name: "كل الأعمال", isActive: true, order: 0 },
    { id: "قنوات-تلفزيونية", name: "قنوات تلفزيونية", isActive: true, order: 1 },
    { id: "أفلام", name: "أفلام", isActive: true, order: 2 },
    { id: "مسلسلات", name: "مسلسلات", isActive: true, order: 3 },
    { id: "برامج", name: "برامج", isActive: true, order: 4 }
  ],
  videoInfo: {
    id: "video-1",
    title: "الفيديو التعريفي",
    description: "نبذة عن خبراتي ومهاراتي في مجال هندسة الصوت",
    videoUrl: "https://www.youtube.com/watch?v=yfZox-wm-Kg",
    isActive: true,
    lastUpdate: new Date().toISOString()
  },
  personalInfo: [
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
  ],
  experiences: [
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
  ],
  projects: [
    {
      id: "project-1",
      title: "فيلم أصوات الحياة",
      description: "تصميم الصوت لفيلم وثائقي يستكشف الأصوات الطبيعية حول العالم",
      image: "/images/projects/project-1.jpg",
      category: "تصميم صوتي",
      year: 2022,
      isActive: true
    },
    {
      id: "project-2",
      title: "مسلسل صدى الماضي",
      description: "تسجيل وتنقية وتحرير الصوت لمسلسل درامي من 30 حلقة",
      image: "/images/projects/project-2.jpg",
      category: "إنتاج تلفزيوني",
      year: 2021,
      isActive: true
    },
    {
      id: "project-3",
      title: "أغنية 'طريق النور'",
      description: "إنتاج موسيقي كامل لأغنية منفردة حققت نجاحاً كبيراً",
      image: "/images/projects/project-3.jpg",
      category: "إنتاج موسيقي",
      year: 2020,
      isActive: true
    }
  ],
  contactInfo: [
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
  ],
  socialLinks: [
    { id: "linkedin", icon: "FaLinkedin", url: "https://linkedin.com/", label: "LinkedIn" },
    { id: "instagram", icon: "FaInstagram", url: "https://instagram.com/", label: "Instagram" },
    { id: "facebook", icon: "FaFacebook", url: "https://facebook.com/", label: "Facebook" },
    { id: "twitter", icon: "FaTwitter", url: "https://twitter.com/", label: "Twitter" }
  ],
  cvFiles: [
    {
      id: "cv-1",
      title: "السيرة الذاتية الرئيسية",
      fileUrl: "/cv/CV_default.pdf",
      description: "السيرة الذاتية الكاملة متضمنة كافة المعلومات والخبرات",
      version: "1.0",
      downloadCount: 0,
      lastUpdate: new Date().toISOString(),
      isActive: true
    }
  ],
  timelineItems: [
    {
      id: "timeline-1",
      year: '2021',
      title: 'مهندس صوت',
      company: 'قناه الشرق Bloobmerg',
      category: 'tv' as 'tv',
      icon: "FaTv",
      isActive: true
    },
    {
      id: "timeline-2",
      year: '2018',
      title: 'مخرج برامج',
      company: 'Alroya Voice (قناة إذاعية)',
      category: 'tv' as 'tv',
      icon: "FaMicrophone",
      isActive: true
    },
    {
      id: "timeline-3",
      year: '2018',
      title: 'مخرج برامج',
      company: 'DRN (قناة إذاعية)',
      category: 'tv' as 'tv',
      icon: "FaMicrophone",
      isActive: true
    },
    {
      id: "timeline-4",
      year: '2017',
      title: 'مهندس صوت',
      company: 'ON LIVE (قناة تلفزيونية)',
      category: 'tv' as 'tv',
      icon: "FaTv",
      isActive: true
    },
    {
      id: "timeline-5",
      year: '2017',
      title: 'مونتير صوت',
      company: 'فيلم ياباني أصلي',
      category: 'film' as 'film',
      icon: "FaFilm",
      isActive: true
    },
    {
      id: "timeline-6",
      year: '2017',
      title: 'مهندس صوت',
      company: 'برنامج تعالى اشرب شاي',
      category: 'program' as 'program',
      icon: "FaYoutube",
      isActive: true
    }
  ] as TimelineItem[]
};

export const defaultHeroInfo: HeroInfo = {
  name: "كريم السيد",
  title: "مهندس صوت محترف",
  bio: "أعمل في مجال هندسة الصوت منذ أكثر من 10 سنوات، قمت خلالها بالعمل في العديد من الأفلام والمسلسلات والإعلانات. أسعى دائماً لتقديم أفضل جودة صوتية ممكنة لجميع المشاريع.",
  skills: ["هندسة صوت", "مونتاج", "موسيقى", "إنتاج"],
  profileImage: "/images/profile.jpg",
  showProfileImage: true
};

/**
 * خدمة البيانات - تتعامل مع عمليات القراءة والكتابة من/إلى Firebase
 * الميزات الرئيسية:
 * 1. توحيد طريقة تخزين واسترجاع البيانات
 * 2. تخزين البيانات في localStorage كاحتياطي
 * 3. استخدام قيم افتراضية عند فشل الاتصال
 */
export const DataService = {
  /**
   * قراءة البيانات من Firebase
   * @param collectionName اسم المجموعة (مثل "siteData")
   * @param documentName اسم المستند (مثل "heroInfo")
   * @param defaultValue القيمة الافتراضية في حالة عدم وجود بيانات
   * @returns البيانات المطلوبة أو القيمة الافتراضية
   */
  async getData<T>(collectionName: string, documentName: string, defaultValue: T): Promise<T> {
    console.log(`[DataService] قراءة البيانات: ${collectionName}/${documentName}`);
    
    // حماية من الاستدعاء على جانب الخادم
    if (typeof window === 'undefined') {
      console.log(`[DataService] تم الاستدعاء على جانب الخادم، استخدام القيم الافتراضية`);
      return defaultValue;
    }
    
    try {
      // الحصول على مثيل Firestore
      const firestore = getFirestoreInstance();
      if (!firestore) {
        throw new Error("Firestore غير متاح");
      }
      
      // محاولة قراءة البيانات من Firestore
      const docRef = doc(firestore as Firestore, collectionName, documentName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`[DataService] تم الحصول على البيانات: ${documentName}`, data);
        
        // تخزين البيانات في localStorage كنسخة احتياطية
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(`${collectionName}_${documentName}`, JSON.stringify(data.items || data));
          } catch (error) {
            console.warn(`[DataService] خطأ في تخزين البيانات في localStorage:`, error);
          }
        }
        
        // إرجاع البيانات - هل هي ضمن حقل items أو مباشرة
        return (data.items !== undefined ? data.items : data) as T;
      } else {
        throw new Error(`البيانات غير موجودة: ${documentName}`);
      }
    } catch (error) {
      console.error(`[DataService] خطأ في قراءة البيانات: ${documentName}`, error);
      
      // محاولة استعادة البيانات من localStorage
      if (typeof localStorage !== 'undefined') {
        try {
          const storedData = localStorage.getItem(`${collectionName}_${documentName}`);
          if (storedData) {
            const parsedData = JSON.parse(storedData) as T;
            console.log(`[DataService] تم الحصول على البيانات من localStorage: ${documentName}`);
            return parsedData;
          }
        } catch (error) {
          console.warn(`[DataService] خطأ في قراءة البيانات من localStorage:`, error);
        }
      }
      
      console.log(`[DataService] استخدام القيم الافتراضية لـ: ${documentName}`);
      return defaultValue;
    }
  },
  
  /**
   * حفظ البيانات في Firebase
   * @param collectionName اسم المجموعة (مثل "siteData")
   * @param documentName اسم المستند (مثل "heroInfo")
   * @param data البيانات المراد حفظها
   * @param useItemsWrapper ما إذا كان يجب تغليف البيانات في كائن items
   * @returns نجاح العملية
   */
  async saveData<T>(
    collectionName: string, 
    documentName: string, 
    data: T, 
    useItemsWrapper: boolean = true
  ): Promise<boolean> {
    console.log(`[DataService] حفظ البيانات: ${collectionName}/${documentName}`, data);
    
    // حماية من الاستدعاء على جانب الخادم
    if (typeof window === 'undefined') {
      console.log(`[DataService] تم الاستدعاء على جانب الخادم، لا يمكن حفظ البيانات`);
      return false;
    }

    // حفظ في localStorage أولاً لضمان وجود نسخة محفوظة على أي حال
    this.saveToLocalStorage(documentName, data);
    
    // التحقق من حالة الاتصال بالإنترنت
    if (!navigator.onLine) {
      console.warn(`[DataService] لا يوجد اتصال بالإنترنت، تم الحفظ في localStorage فقط`);
      // يمكننا إضافة آلية لمزامنة البيانات لاحقاً عند عودة الاتصال
      return false;
    }
    
    try {
      // التحقق من وجود db
      if (!db) {
        console.error(`[DataService] Firestore غير متاح، تم الحفظ في localStorage فقط`);
        return false;
      }
      
      // تنسيق البيانات حسب المطلوب
      const dataToSave = useItemsWrapper ? { items: data } : data;
      
      // حفظ البيانات في Firestore مع محاولات إعادة المحاولة
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;
      
      while (retryCount < maxRetries && !success) {
        try {
          console.log(`[DataService] محاولة الحفظ في Firestore (${retryCount + 1}/${maxRetries})...`);
          await setDoc(doc(db, collectionName, documentName), dataToSave as any);
          console.log(`[DataService] تم حفظ البيانات في Firestore: ${documentName}`);
          success = true;
        } catch (error: any) {
          retryCount++;
          if (error?.code === 'unavailable' || error?.code === 'failed-precondition' || error?.message?.includes('offline')) {
            console.warn(`[DataService] خطأ في الاتصال بـ Firestore: ${error.message || 'غير معروف'}`);
            if (retryCount < maxRetries) {
              // انتظار قبل إعادة المحاولة
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
              console.log(`[DataService] إعادة المحاولة...`);
            } else {
              console.error(`[DataService] فشل في حفظ البيانات بعد ${maxRetries} محاولات`);
              return false;
            }
          } else {
            // خطأ غير متعلق بالاتصال
            console.error(`[DataService] خطأ في حفظ البيانات: ${documentName}`, error);
            return false;
          }
        }
      }
      
      return success;
    } catch (error) {
      console.error(`[DataService] خطأ في حفظ البيانات: ${documentName}`, error);
      return false;
    }
  },
  
  /**
   * حفظ البيانات في localStorage
   */
  saveToLocalStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`[DataService] تم حفظ البيانات في localStorage: ${key}`);
    } catch (error) {
      console.error(`[DataService] خطأ في حفظ البيانات في localStorage: ${key}`, error);
    }
  },
  
  /**
   * قراءة البيانات من localStorage
   */
  getFromLocalStorage<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        console.log(`[DataService] تم الحصول على البيانات من localStorage: ${key}`);
        return JSON.parse(data) as T;
      }
    } catch (error) {
      console.error(`[DataService] خطأ في قراءة البيانات من localStorage: ${key}`, error);
    }
    
    console.log(`[DataService] استخدام القيم الافتراضية لـ: ${key}`);
    return defaultValue;
  },
  
  // دوال مختصرة للاستخدام المباشر
  
  // القسم الرئيسي
  getHeroInfo: async (): Promise<HeroInfo> => {
    try {
      console.log("تحميل معلومات Hero من Firestore...");
      
      // الحصول على بيانات HeroInfo
      const heroInfo = await DataService.getData<HeroInfo>("siteData", "heroInfo", defaultHeroInfo);
      console.log("تم تحميل معلومات Hero بنجاح:", heroInfo);
      
      return heroInfo;
    } catch (error) {
      console.error("خطأ في تحميل معلومات Hero:", error);
      return defaultHeroInfo;
    }
  },
  
  saveHeroInfo: async (heroInfo: HeroInfo): Promise<boolean> => {
    try {
      console.log("حفظ معلومات Hero في Firestore...");
      
      // حفظ بيانات HeroInfo
      const result = await DataService.saveData<HeroInfo>("siteData", "heroInfo", heroInfo, false);
      console.log("تم حفظ معلومات Hero بنجاح:", result);
      
      return result;
    } catch (error) {
      console.error("خطأ في حفظ معلومات Hero:", error);
      return false;
    }
  },
  
  // معلومات شخصية
  getPersonalInfo: async (): Promise<PersonalInfo[]> => {
    console.log("[DataService] بدء استدعاء getPersonalInfo");
    try {
      // تحقق إذا كنا في بيئة الخادم
      if (typeof window === 'undefined') {
        console.log("[DataService] استدعاء من الخادم، إرجاع البيانات الافتراضية");
        return DEFAULT_DATA.personalInfo;
      }
      
      // قراءة البيانات من Firestore
      try {
        if (!db) {
          console.error("[DataService] Firestore غير متاح");
          return DEFAULT_DATA.personalInfo;
        }
        
        console.log("[DataService] محاولة قراءة المعلومات الشخصية من Firestore (المسار الرئيسي)");
        // المسار الرئيسي: siteData/personalInfo
        const docRef = doc(db as Firestore, "siteData", "personalInfo");
        const docSnap = await getDoc(docRef);
        
        console.log("[DataService] نتيجة الاستعلام:", docSnap.exists() ? "توجد بيانات" : "لا توجد بيانات");
        
        if (docSnap.exists() && docSnap.data()) {
          const firebaseData = docSnap.data();
          
          console.log("[DataService] هيكل البيانات المسترجعة:", Object.keys(firebaseData));
          
          // استخراج البيانات حسب الهيكل
          let personalInfo: PersonalInfo[] = [];
          
          if (firebaseData.items && Array.isArray(firebaseData.items)) {
            // البيانات موجودة ضمن مفتاح items
            personalInfo = firebaseData.items;
            console.log(`[DataService] استخدام البيانات من items - عدد ${personalInfo.length} عنصر`);
          } else if (Array.isArray(firebaseData)) {
            // البيانات مباشرة كمصفوفة
            personalInfo = firebaseData;
            console.log(`[DataService] استخدام البيانات كمصفوفة مباشرة - عدد ${personalInfo.length} عنصر`);
          } else {
            // بيانات بتنسيق آخر، محاولة تنسيقها
            console.warn("[DataService] المعلومات الشخصية بتنسيق غير متوقع:", typeof firebaseData);
            if (typeof firebaseData === 'object') {
              const processedData = Object.entries(firebaseData).map(([key, value]: [string, any]) => {
                if (key === 'items' && Array.isArray(value)) {
                  console.log("[DataService] استخراج البيانات من كائن بمفتاح items");
                  return value;
                }
                return {
                  id: key,
                  title: value.title || key,
                  content: value.content || value.toString(),
                  icon: value.icon || ""
                };
              }).flat();
              
              // تصفية العناصر غير الصالحة
              personalInfo = processedData.filter(item => item && typeof item === 'object');
              console.log(`[DataService] البيانات بعد المعالجة من كائن - عدد ${personalInfo.length} عنصر`);
            }
          }
          
          // تحقق من وجود عناصر بعد معالجة البيانات
          if (personalInfo.length === 0) {
            console.warn("[DataService] لم يتم استخراج أي بيانات من الاستجابة");
            
            // إذا كان هناك بيانات، لكنها ليست بالتنسيق الصحيح
            if (Object.keys(firebaseData).length > 0) {
              console.log("[DataService] محاولة تحليل الهيكل المتاح:", typeof firebaseData);
              try {
                // محاولة تحويل من الصيغة الخام
                const rawItems = Array.isArray(firebaseData) ? firebaseData : [firebaseData];
                personalInfo = rawItems.map((item, index) => ({
                  id: `info-${index}`,
                  title: item.title || `معلومات ${index}`,
                  content: item.content || item.value || "بلا معلومات",
                  icon: item.icon || ""
                }));
                console.log(`[DataService] تحويل البيانات الخام - عدد ${personalInfo.length} عنصر`);
              } catch (e) {
                console.error("[DataService] فشل تحويل البيانات:", e);
              }
            }
          }
          
          if (personalInfo.length > 0) {
            // تسجيل البيانات المستخرجة
            console.log(`[DataService] المعلومات الشخصية النهائية - عدد ${personalInfo.length} عنصر`);
            // حفظ البيانات محلياً للاستخدام عند انقطاع الاتصال
            localStorage.setItem("personalInfo", JSON.stringify(personalInfo));
            
            return personalInfo;
          }
        } else {
          console.warn("[DataService] المستند فارغ أو غير موجود");
        }
      } catch (error) {
        console.error("[DataService] خطأ في قراءة المعلومات الشخصية من المسار الرئيسي:", error);
      }
      
      // استخدام البيانات المحلية كخيار أخير
      try {
        const localData = localStorage.getItem("personalInfo");
        if (localData) {
          const parsedData = JSON.parse(localData);
          console.log(`[DataService] استخدام بيانات محلية مخزنة - عدد ${parsedData.length} عنصر`);
          return parsedData;
        } else {
          console.log("[DataService] لا توجد بيانات محلية مخزنة");
        }
      } catch (e) {
        console.error("[DataService] خطأ في تحليل البيانات المحلية:", e);
      }
      
      // استخدام البيانات الافتراضية كملاذ أخير
      console.log(`[DataService] استخدام البيانات الافتراضية - عدد ${DEFAULT_DATA.personalInfo.length} عنصر`);
      return DEFAULT_DATA.personalInfo;
    } catch (error) {
      console.error("[DataService] خطأ غير متوقع في استرداد المعلومات الشخصية:", error);
      return DEFAULT_DATA.personalInfo;
    }
  },
  
  savePersonalInfo: async (data: PersonalInfo[]): Promise<boolean> => {
    console.log("[DataService] بدء محاولة حفظ المعلومات الشخصية - عدد عناصر:", data.length);
    try {
      if (!db) {
        console.error("[DataService] حفظ المعلومات الشخصية: Firestore غير متاح");
        return false;
      }
      
      // تحقق من صحة البيانات قبل الحفظ
      if (!Array.isArray(data)) {
        console.error("[DataService] خطأ: البيانات المراد حفظها ليست مصفوفة");
        return false;
      }
      
      // تنقية البيانات من أي قيم غير صالحة
      const validData = data.filter(item => 
        item && typeof item === 'object' && 
        item.id && typeof item.id === 'string' &&
        item.title && typeof item.title === 'string'
      );
      
      if (validData.length !== data.length) {
        console.warn(`[DataService] تمت إزالة ${data.length - validData.length} عناصر غير صالحة من البيانات قبل الحفظ`);
      }
      
      // تحديث البيانات في Firestore مع تنسيق items
      console.log("[DataService] حفظ المعلومات الشخصية في المسار: siteData/personalInfo");
      console.log("[DataService] هيكل البيانات المحفوظة: { items: [...] }");
      
      const personalInfoRef = doc(db as Firestore, "siteData", "personalInfo");
      
      await setDoc(personalInfoRef, { items: validData });
      console.log("[DataService] تم حفظ المعلومات الشخصية بنجاح في Firestore");
      
      // تحديث البيانات محلياً أيضاً
      try {
        localStorage.setItem("personalInfo", JSON.stringify(validData));
        console.log("[DataService] تم حفظ المعلومات الشخصية في التخزين المحلي");
      } catch (localError) {
        console.warn("[DataService] تعذر حفظ المعلومات الشخصية في التخزين المحلي:", localError);
      }
      
      return true;
    } catch (error) {
      console.error("[DataService] فشل في حفظ المعلومات الشخصية:", error);
      return false;
    }
  },
  
  // الخبرات
  getExperiences: async (): Promise<Experience[]> => {
    console.log("[DataService] جاري تحميل الخبرات المهنية...");
    
    // حماية من استدعاء الدالة على جانب الخادم
    if (typeof window === 'undefined') {
      console.log("[DataService] getExperiences: تم الاستدعاء على جانب الخادم، إرجاع القيم الافتراضية");
      return DEFAULT_DATA.experiences;
    }
    
    try {
      // الحصول على مثيل Firestore
      const firestore = getFirestoreInstance();
      if (!firestore) {
        console.error("[DataService] Firestore غير متاح، استخدام البيانات الافتراضية");
        return DEFAULT_DATA.experiences;
      }
      
      // محاولة قراءة البيانات من Firestore
      const docRef = doc(firestore as Firestore, "siteData", "experiences");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.items && Array.isArray(data.items)) {
          console.log("[DataService] تم العثور على بيانات الخبرات في Firestore:", data.items.length);
          
          // تحديث التخزين المحلي بأحدث البيانات
          localStorage.setItem("experiences", JSON.stringify(data.items));
          
          return data.items;
        }
      }
      
      // محاولة استعادة البيانات من localStorage
      const localData = localStorage.getItem("experiences");
      if (localData) {
        try {
          const experiences = JSON.parse(localData);
          console.log("[DataService] تم قراءة الخبرات من التخزين المحلي:", experiences.length);
          return experiences;
        } catch (e) {
          console.error("[DataService] خطأ في تحليل بيانات الخبرات من التخزين المحلي:", e);
        }
      }
      
      // استخدام البيانات الافتراضية
      console.log("[DataService] استخدام البيانات الافتراضية للخبرات");
      return DEFAULT_DATA.experiences;
    } catch (error) {
      console.error("[DataService] خطأ في قراءة بيانات الخبرات:", error);
      return DEFAULT_DATA.experiences;
    }
  },
  
  saveExperiences: async (data: Experience[]): Promise<boolean> => {
    return await DataService.saveData<Experience[]>("siteData", "experiences", data);
  },
  
  // المشاريع
  getProjects: async (): Promise<Project[]> => {
    console.log("[DataService] بدء قراءة المشاريع...");
    
    // حماية من استدعاء الدالة على جانب الخادم
    if (typeof window === 'undefined') {
      console.log("[DataService] getProjects: تم الاستدعاء على جانب الخادم، إرجاع مصفوفة فارغة");
      return [];
    }
    
    try {
      // محاولة قراءة البيانات من التخزين المحلي أولاً
      const localData = localStorage.getItem("projects");
      let projects: Project[] = [];
      
      if (localData) {
        try {
          projects = JSON.parse(localData);
          console.log("[DataService] تم قراءة المشاريع من التخزين المحلي:", projects.length);
        } catch (e) {
          console.error("[DataService] خطأ في تحليل بيانات المشاريع من التخزين المحلي:", e);
        }
      }
      
      // إذا كان المستخدم غير متصل بالإنترنت، استخدم البيانات المخزنة محليًا فقط
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.log("[DataService] المستخدم غير متصل بالإنترنت، استخدام البيانات المحلية فقط");
        return projects.length > 0 ? projects : DEFAULT_DATA.projects;
      }
      
      // الحصول على مثيل Firestore
      const firestore = getFirestoreInstance();
      if (!firestore) {
        console.log("[DataService] Firestore غير متاح، استخدام البيانات المحلية");
        return projects.length > 0 ? projects : DEFAULT_DATA.projects;
      }
      
      // محاولة قراءة البيانات من Firestore من مسارات متعددة
      let firebaseData: any = null;
      
      // المسار الرئيسي
      try {
        const docRef = doc(firestore as Firestore, "siteData", "projects");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          firebaseData = docSnap.data();
          console.log("[DataService] تم قراءة المشاريع من المسار الرئيسي");
        }
      } catch (error) {
        console.warn("[DataService] فشل قراءة المشاريع من المسار الرئيسي:", error);
      }
      
      // إذا فشلت المحاولة الأولى، جرب المسار البديل
      if (!firebaseData) {
        try {
          const docRef = doc(firestore as Firestore, "public_data", "projects");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            firebaseData = docSnap.data();
            console.log("[DataService] تم قراءة المشاريع من المسار البديل");
          }
        } catch (error) {
          console.warn("[DataService] فشل قراءة المشاريع من المسار البديل:", error);
        }
      }
      
      // إذا فشلت المحاولة الثانية، جرب المسار الثالث
      if (!firebaseData) {
        try {
          const docRef = doc(firestore as Firestore, "user_content", "projects");
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            firebaseData = docSnap.data();
            console.log("[DataService] تم قراءة المشاريع من مسار المستخدم");
          }
        } catch (error) {
          console.warn("[DataService] فشل قراءة المشاريع من مسار المستخدم:", error);
        }
      }
      
      // استخراج البيانات إذا وجدت
      if (firebaseData && firebaseData.items && Array.isArray(firebaseData.items)) {
        console.log("[DataService] تم العثور على بيانات المشاريع في Firestore:", firebaseData.items.length);
        
        // تنظيف ومعالجة البيانات للتأكد من صحة التصنيفات
        const cleanedProjects = firebaseData.items.map((project: any) => ({
          id: project.id || `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: project.title || "مشروع جديد",
          description: project.description || "",
          image: project.image || "/images/default.jpg",
          category: project.category || "أخرى",
          year: project.year || new Date().getFullYear(),
          isActive: project.isActive !== undefined ? project.isActive : true,
          link: project.link || ""
        }));
        
        // تحديث التخزين المحلي بأحدث البيانات
        localStorage.setItem("projects", JSON.stringify(cleanedProjects));
        
        return cleanedProjects;
      }
      
      // استخدام البيانات المحلية إذا لم نجد شيئًا في Firestore
      if (projects.length > 0) {
        console.log("[DataService] استخدام البيانات المحلية بسبب عدم وجود بيانات في Firestore");
        return projects;
      }
      
      // استخدام البيانات الافتراضية إذا لم يكن هناك بيانات محلية أو في Firestore
      console.log("[DataService] استخدام البيانات الافتراضية للمشاريع");
      return DEFAULT_DATA.projects;
    } catch (error) {
      console.error("[DataService] خطأ غير متوقع في قراءة المشاريع:", error);
      
      // محاولة استخدام البيانات المحلية في حالة الخطأ
      try {
        const localData = localStorage.getItem("projects");
        if (localData) {
          const projects = JSON.parse(localData);
          console.log("[DataService] استخدام البيانات المحلية بعد حدوث خطأ");
          return projects;
        }
      } catch (e) {
        console.error("[DataService] خطأ في قراءة البيانات المحلية:", e);
      }
      
      // إرجاع البيانات الافتراضية كحل أخير
      return DEFAULT_DATA.projects;
    }
  },
  
  saveProjects: async (data: Project[]): Promise<boolean> => {
    const startTime = Date.now();
    console.log("[DataService] بدء حفظ المشاريع... الوقت:" + new Date().toLocaleTimeString());
    try {
      if (!data || !Array.isArray(data)) {
        console.error("[DataService] بيانات المشاريع غير صالحة:", data);
        return false;
      }

      // تنظيف ومعالجة البيانات - جعل العملية أبسط وأسرع
      const cleanedData = data.map(project => ({
        id: project.id || `project-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: project.title || "مشروع جديد",
        description: project.description || "",
        image: project.image || "/images/default.jpg",
        category: project.category || "أخرى",
        year: project.year || new Date().getFullYear(),
        isActive: project.isActive !== undefined ? project.isActive : true,
        link: project.link || ""
      }));

      // حفظ البيانات محليًا أولًا لضمان سرعة الاستجابة
      try {
        localStorage.setItem("projects", JSON.stringify(cleanedData));
        console.log("[DataService] تم حفظ المشاريع في التخزين المحلي");
      } catch (e) {
        console.warn("[DataService] خطأ في حفظ البيانات محلياً:", e);
        // استمر رغم ذلك
      }
      
      // التحقق من حالة الاتصال بالإنترنت
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.warn("[DataService] لا يوجد اتصال بالإنترنت، تم الحفظ في التخزين المحلي فقط");
        return true; // نعتبر العملية ناجحة حتى لو كانت محلية فقط (سنزامن لاحقاً)
      }
      
      // التحقق من وجود قاعدة البيانات
      if (!db) {
        console.error("[DataService] Firestore غير متاح، تم الحفظ في التخزين المحلي فقط");
        return true; // نعتبر العملية ناجحة (سيتم مزامنة البيانات لاحقاً)
      }
      
      // البيانات المراد حفظها - تم التبسيط لسرعة أفضل
      const dataToSave = { 
        items: cleanedData,
        updatedAt: new Date().toISOString()
      };
      
      // الحفظ باستخدام كائن واحد مع تقليل الاتصالات الشبكية
      try {
        const docRef = doc(db as Firestore, "siteData", "projects");
        await setDoc(docRef, dataToSave, { merge: true });
        
        const endTime = Date.now();
        const timeTaken = endTime - startTime;
        console.log(`[DataService] تم حفظ المشاريع بنجاح. استغرق: ${timeTaken}ms`);
        
        return true;
      } catch (error) {
        console.error("[DataService] خطأ في حفظ المشاريع:", error);
        
        // محاولة استخدام مسار بديل في حالة الخطأ
        try {
          const docRef = doc(db as Firestore, "public_data", "projects");
          await setDoc(docRef, dataToSave, { merge: true });
          console.log("[DataService] تم حفظ المشاريع في المسار البديل");
          return true;
        } catch (fallbackError) {
          console.error("[DataService] فشل في حفظ المشاريع في جميع المسارات:", fallbackError);
          return false;
        }
      }
    } catch (error) {
      console.error("[DataService] خطأ غير متوقع في حفظ المشاريع:", error);
      return false; // فشل الحفظ
    }
  },
  
  // معلومات الاتصال
  getContactInfo: async (): Promise<ContactInfo[]> => {
    console.log("[DataService] جاري تحميل معلومات الاتصال...");
    
    // حماية من استدعاء الدالة على جانب الخادم
    if (typeof window === 'undefined') {
      console.log("[DataService] getContactInfo: تم الاستدعاء على جانب الخادم، إرجاع القيم الافتراضية");
      return DEFAULT_DATA.contactInfo;
    }
    
    try {
      // الحصول على مثيل Firestore
      const firestore = getFirestoreInstance();
      if (!firestore) {
        console.error("[DataService] Firestore غير متاح، استخدام البيانات الافتراضية");
        return DEFAULT_DATA.contactInfo;
      }
      
      // محاولة قراءة البيانات من Firestore
      const docRef = doc(firestore as Firestore, "siteData", "contactInfo");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.items && Array.isArray(data.items)) {
          console.log("[DataService] تم العثور على بيانات الاتصال في Firestore:", data.items.length);
          
          // تحديث التخزين المحلي بأحدث البيانات
          localStorage.setItem("contactInfo", JSON.stringify(data.items));
          
          return data.items as ContactInfo[];
        }
      }
      
      // محاولة استعادة البيانات من localStorage
      const localData = localStorage.getItem("contactInfo");
      if (localData) {
        try {
          const contactInfo = JSON.parse(localData) as ContactInfo[];
          console.log("[DataService] تم قراءة معلومات الاتصال من التخزين المحلي:", contactInfo.length);
          return contactInfo;
        } catch (e) {
          console.error("[DataService] خطأ في تحليل بيانات الاتصال من التخزين المحلي:", e);
        }
      }
      
      // استخدام البيانات الافتراضية
      console.log("[DataService] استخدام البيانات الافتراضية لمعلومات الاتصال");
      return DEFAULT_DATA.contactInfo;
    } catch (error) {
      console.error("[DataService] خطأ في قراءة بيانات الاتصال:", error);
      return DEFAULT_DATA.contactInfo;
    }
  },
  
  saveContactInfo: async (data: ContactInfo[]): Promise<boolean> => {
    console.log("[DataService] بدء حفظ معلومات الاتصال - عدد العناصر:", data.length);
    try {
      // الحصول على مثيل Firestore
      const firestore = getFirestoreInstance();
      if (!firestore) {
        console.error("[DataService] حفظ معلومات الاتصال: Firestore غير متاح");
        return false;
      }
      
      // تحقق من صحة البيانات قبل الحفظ
      if (!Array.isArray(data)) {
        console.error("[DataService] خطأ: بيانات الاتصال المراد حفظها ليست مصفوفة");
        return false;
      }
      
      // تنقية البيانات من أي قيم غير صالحة
      const validData = data.filter(item => 
        item && typeof item === 'object' && 
        item.id && typeof item.id === 'string' &&
        item.title && typeof item.title === 'string'
      );
      
      if (validData.length !== data.length) {
        console.warn(`[DataService] تمت إزالة ${data.length - validData.length} عناصر غير صالحة من بيانات الاتصال قبل الحفظ`);
      }
      
      // تحديث البيانات في Firestore مع تنسيق items
      console.log("[DataService] حفظ معلومات الاتصال في المسار: siteData/contactInfo");
      
      const contactInfoRef = doc(firestore, "siteData", "contactInfo");
      
      await setDoc(contactInfoRef, { items: validData });
      console.log("[DataService] تم حفظ معلومات الاتصال بنجاح في Firestore");
      
      // تحديث البيانات محلياً أيضاً
      try {
        localStorage.setItem("contactInfo", JSON.stringify(validData));
        console.log("[DataService] تم حفظ معلومات الاتصال في التخزين المحلي");
      } catch (localError) {
        console.warn("[DataService] تعذر حفظ معلومات الاتصال في التخزين المحلي:", localError);
      }
      
      return true;
    } catch (error) {
      console.error("[DataService] فشل في حفظ معلومات الاتصال:", error);
      return false;
    }
  },
  
  // روابط التواصل الاجتماعي
  getSocialLinks: async (): Promise<SocialLink[]> => {
    console.log("[DataService] جاري تحميل روابط التواصل الاجتماعي...");
    
    // حماية من استدعاء الدالة على جانب الخادم
    if (typeof window === 'undefined') {
      console.log("[DataService] getSocialLinks: تم الاستدعاء على جانب الخادم، إرجاع القيم الافتراضية");
      return DEFAULT_DATA.socialLinks;
    }
    
    try {
      // الحصول على مثيل Firestore
      const firestore = getFirestoreInstance();
      if (!firestore) {
        console.error("[DataService] Firestore غير متاح، استخدام البيانات الافتراضية");
        return DEFAULT_DATA.socialLinks;
      }
      
      // محاولة قراءة البيانات من Firestore
      const docRef = doc(firestore as Firestore, "siteData", "socialLinks");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.items && Array.isArray(data.items)) {
          console.log("[DataService] تم العثور على روابط التواصل الاجتماعي في Firestore:", data.items.length);
          
          // تحديث التخزين المحلي بأحدث البيانات
          localStorage.setItem("socialLinks", JSON.stringify(data.items));
          
          return data.items as SocialLink[];
        }
      }
      
      // محاولة استعادة البيانات من localStorage
      const localData = localStorage.getItem("socialLinks");
      if (localData) {
        try {
          const socialLinks = JSON.parse(localData) as SocialLink[];
          console.log("[DataService] تم قراءة روابط التواصل الاجتماعي من التخزين المحلي:", socialLinks.length);
          return socialLinks;
        } catch (e) {
          console.error("[DataService] خطأ في تحليل روابط التواصل الاجتماعي من التخزين المحلي:", e);
        }
      }
      
      // استخدام البيانات الافتراضية
      console.log("[DataService] استخدام البيانات الافتراضية لروابط التواصل الاجتماعي");
      return DEFAULT_DATA.socialLinks;
    } catch (error) {
      console.error("[DataService] خطأ في قراءة روابط التواصل الاجتماعي:", error);
      return DEFAULT_DATA.socialLinks;
    }
  },
  
  saveSocialLinks: async (data: SocialLink[]): Promise<boolean> => {
    console.log("[DataService] بدء حفظ روابط التواصل الاجتماعي - عدد العناصر:", data.length);
    try {
      // الحصول على مثيل Firestore
      const firestore = getFirestoreInstance();
      if (!firestore) {
        console.error("[DataService] حفظ روابط التواصل الاجتماعي: Firestore غير متاح");
        return false;
      }
      
      // تحقق من صحة البيانات قبل الحفظ
      if (!Array.isArray(data)) {
        console.error("[DataService] خطأ: روابط التواصل الاجتماعي المراد حفظها ليست مصفوفة");
        return false;
      }
      
      // تنقية البيانات من أي قيم غير صالحة
      const validData = data.filter(item => 
        item && typeof item === 'object' && 
        item.id && typeof item.id === 'string' &&
        item.url && typeof item.url === 'string'
      );
      
      if (validData.length !== data.length) {
        console.warn(`[DataService] تمت إزالة ${data.length - validData.length} عناصر غير صالحة من روابط التواصل الاجتماعي قبل الحفظ`);
      }
      
      // تحديث البيانات في Firestore مع تنسيق items
      console.log("[DataService] حفظ روابط التواصل الاجتماعي في المسار: siteData/socialLinks");
      
      const socialLinksRef = doc(firestore, "siteData", "socialLinks");
      
      await setDoc(socialLinksRef, { items: validData });
      console.log("[DataService] تم حفظ روابط التواصل الاجتماعي بنجاح في Firestore");
      
      // تحديث البيانات محلياً أيضاً
      try {
        localStorage.setItem("socialLinks", JSON.stringify(validData));
        console.log("[DataService] تم حفظ روابط التواصل الاجتماعي في التخزين المحلي");
      } catch (localError) {
        console.warn("[DataService] تعذر حفظ روابط التواصل الاجتماعي في التخزين المحلي:", localError);
      }
      
      return true;
    } catch (error) {
      console.error("[DataService] فشل في حفظ روابط التواصل الاجتماعي:", error);
      return false;
    }
  },
  
  // السيرة الذاتية
  getCVFiles: async (): Promise<CVInfo[]> => {
    console.log("[DataService] بدء استدعاء getCVFiles");
    try {
      // تحقق إذا كنا في بيئة الخادم
      if (typeof window === 'undefined') {
        console.log("[DataService] استدعاء من الخادم، إرجاع البيانات الافتراضية");
        return DEFAULT_DATA.cvFiles;
      }
      
      // قراءة البيانات من Firestore
      try {
        if (!db) {
          console.error("[DataService] Firestore غير متاح");
          return DEFAULT_DATA.cvFiles;
        }
        
        console.log("[DataService] محاولة قراءة بيانات السيرة الذاتية من Firestore");
        // المسار: siteData/cvFiles
        const docRef = doc(db as Firestore, "siteData", "cvFiles");
        const docSnap = await getDoc(docRef);
        
        console.log("[DataService] نتيجة الاستعلام:", docSnap.exists() ? "توجد بيانات" : "لا توجد بيانات");
        
        if (docSnap.exists() && docSnap.data()) {
          const firebaseData = docSnap.data();
          console.log("[DataService] هيكل البيانات المسترجعة:", Object.keys(firebaseData));
          
          // استخراج البيانات حسب الهيكل
          let cvFiles: CVInfo[] = [];
          
          if (firebaseData.items && Array.isArray(firebaseData.items)) {
            // البيانات موجودة ضمن مفتاح items
            cvFiles = firebaseData.items;
            console.log(`[DataService] استخدام البيانات من items - عدد ${cvFiles.length} عنصر`);
          } else if (Array.isArray(firebaseData)) {
            // البيانات مباشرة كمصفوفة
            cvFiles = firebaseData;
            console.log(`[DataService] استخدام البيانات كمصفوفة مباشرة - عدد ${cvFiles.length} عنصر`);
          }
          
          // تحقق من وجود عناصر بعد معالجة البيانات
          if (cvFiles.length > 0) {
            // تسجيل البيانات المستخرجة
            console.log(`[DataService] بيانات السيرة الذاتية - عدد ${cvFiles.length} عنصر`);
            // حفظ البيانات محلياً للاستخدام عند انقطاع الاتصال
            localStorage.setItem("cvFiles", JSON.stringify(cvFiles));
            
            return cvFiles;
          }
        }
      } catch (error) {
        console.error("[DataService] خطأ في قراءة بيانات السيرة الذاتية:", error);
      }
      
      // استخدام البيانات المحلية كخيار أخير
      try {
        const localData = localStorage.getItem("cvFiles");
        if (localData) {
          const parsedData = JSON.parse(localData);
          console.log(`[DataService] استخدام بيانات محلية مخزنة - عدد ${parsedData.length} عنصر`);
          return parsedData;
        } else {
          console.log("[DataService] لا توجد بيانات محلية مخزنة");
        }
      } catch (e) {
        console.error("[DataService] خطأ في تحليل البيانات المحلية:", e);
      }
      
      // استخدام البيانات الافتراضية كملاذ أخير
      console.log(`[DataService] استخدام البيانات الافتراضية - عدد ${DEFAULT_DATA.cvFiles.length} عنصر`);
      return DEFAULT_DATA.cvFiles;
    } catch (error) {
      console.error("[DataService] خطأ غير متوقع في استرداد بيانات السيرة الذاتية:", error);
      return DEFAULT_DATA.cvFiles;
    }
  },
  
  saveCVFiles: async (data: CVInfo[]): Promise<boolean> => {
    console.log("[DataService] بدء محاولة حفظ بيانات السيرة الذاتية - عدد عناصر:", data.length);
    try {
      if (!db) {
        console.error("[DataService] حفظ بيانات السيرة الذاتية: Firestore غير متاح");
        return false;
      }
      
      // تحقق من صحة البيانات قبل الحفظ
      if (!Array.isArray(data)) {
        console.error("[DataService] خطأ: البيانات المراد حفظها ليست مصفوفة");
        return false;
      }
      
      // تنقية البيانات من أي قيم غير صالحة
      const validData = data.filter(item => 
        item && typeof item === 'object' && 
        item.id && typeof item.id === 'string' &&
        item.title && typeof item.title === 'string'
      );
      
      if (validData.length !== data.length) {
        console.warn(`[DataService] تمت إزالة ${data.length - validData.length} عناصر غير صالحة من البيانات قبل الحفظ`);
      }
      
      // تحديث البيانات في Firestore مع تنسيق items
      console.log("[DataService] حفظ بيانات السيرة الذاتية في المسار: siteData/cvFiles");
      
      const cvFilesRef = doc(db as Firestore, "siteData", "cvFiles");
      
      await setDoc(cvFilesRef, { items: validData });
      console.log("[DataService] تم حفظ بيانات السيرة الذاتية بنجاح في Firestore");
      
      // تحديث البيانات محلياً أيضاً
      try {
        localStorage.setItem("cvFiles", JSON.stringify(validData));
        console.log("[DataService] تم حفظ بيانات السيرة الذاتية في التخزين المحلي");
      } catch (localError) {
        console.warn("[DataService] تعذر حفظ بيانات السيرة الذاتية في التخزين المحلي:", localError);
      }
      
      return true;
    } catch (error) {
      console.error("[DataService] فشل في حفظ بيانات السيرة الذاتية:", error);
      return false;
    }
  },
  
  // تحديث عداد التنزيل للسيرة الذاتية
  incrementCVDownloadCount: async (cvId: string): Promise<boolean> => {
    try {
      if (!db) {
        console.error("[DataService] تحديث عداد التنزيل: Firestore غير متاح");
        return false;
      }
      
      // الحصول على بيانات السيرة الذاتية
      const cvFiles = await DataService.getCVFiles();
      const cvIndex = cvFiles.findIndex(cv => cv.id === cvId);
      
      if (cvIndex === -1) {
        console.error(`[DataService] لم يتم العثور على السيرة الذاتية بالمعرف: ${cvId}`);
        return false;
      }
      
      // زيادة العداد
      const updatedCV = {
        ...cvFiles[cvIndex],
        downloadCount: (cvFiles[cvIndex].downloadCount || 0) + 1
      };
      
      // تحديث المصفوفة
      const updatedCVFiles = [...cvFiles];
      updatedCVFiles[cvIndex] = updatedCV;
      
      // حفظ البيانات المحدثة
      return await DataService.saveCVFiles(updatedCVFiles);
    } catch (error) {
      console.error("[DataService] خطأ في تحديث عداد التنزيل:", error);
      return false;
    }
  },
  
  // إعادة تهيئة جميع البيانات
  initializeAllData: async (): Promise<boolean> => {
    console.log("===== بدء إعادة تهيئة جميع البيانات =====");
    try {
      // التأكد من وجود اتصال بقاعدة البيانات
      if (typeof window === 'undefined' || !db) {
        console.error("Firestore غير متاح أو المتصفح غير متاح");
        return false;
      }
      
      // حذف البيانات القديمة أولاً (مبسط)
      try {
        console.log("مسح البيانات القديمة...");
        
        await setDoc(doc(db, "siteData", "heroInfo"), {});
        await setDoc(doc(db, "siteData", "personalInfo"), {});
        await setDoc(doc(db, "siteData", "experiences"), {});
        await setDoc(doc(db, "siteData", "projects"), {});
        await setDoc(doc(db, "siteData", "contactInfo"), {});
        await setDoc(doc(db, "siteData", "socialLinks"), {});
        
        console.log("تم مسح البيانات القديمة بنجاح");
      } catch (error) {
        console.error("خطأ في مسح البيانات القديمة:", error);
        // نستمر على الرغم من وجود خطأ
      }
      
      // نستخدم تأخيراً بسيطاً للسماح بتطبيق العمليات
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // حفظ البيانات الجديدة بشكل متتالي بدلاً من متوازي لتجنب المشاكل
      console.log("=== حفظ البيانات الجديدة (متتالي) ===");
      
      try {
        console.log("حفظ heroInfo...");
        await setDoc(doc(db, "siteData", "heroInfo"), DEFAULT_DATA.heroInfo);
        
        console.log("حفظ personalInfo...");
        await setDoc(doc(db, "siteData", "personalInfo"), { items: DEFAULT_DATA.personalInfo });
        
        console.log("حفظ experiences...");
        await setDoc(doc(db, "siteData", "experiences"), { items: DEFAULT_DATA.experiences });
        
        console.log("حفظ projects...");
        await setDoc(doc(db, "siteData", "projects"), { items: DEFAULT_DATA.projects });
        
        console.log("حفظ contactInfo...");
        await setDoc(doc(db, "siteData", "contactInfo"), { items: DEFAULT_DATA.contactInfo });
        
        console.log("حفظ socialLinks...");
        await setDoc(doc(db, "siteData", "socialLinks"), { items: DEFAULT_DATA.socialLinks });
        
        // حفظ البيانات في localStorage أيضاً
        try {
          localStorage.setItem("heroInfo", JSON.stringify(DEFAULT_DATA.heroInfo));
          localStorage.setItem("personalInfo", JSON.stringify(DEFAULT_DATA.personalInfo));
          localStorage.setItem("experiences", JSON.stringify(DEFAULT_DATA.experiences));
          localStorage.setItem("projects", JSON.stringify(DEFAULT_DATA.projects));
          localStorage.setItem("contactInfo", JSON.stringify(DEFAULT_DATA.contactInfo));
          localStorage.setItem("socialLinks", JSON.stringify(DEFAULT_DATA.socialLinks));
          console.log("تم حفظ جميع البيانات الافتراضية في localStorage");
        } catch (localError) {
          console.error("خطأ في حفظ البيانات في localStorage:", localError);
        }
        
        console.log("===== تمت إعادة تهيئة جميع البيانات بنجاح =====");
        return true;
      } catch (error) {
        console.error("خطأ أثناء حفظ البيانات الجديدة:", error);
        return false;
      }
    } catch (error) {
      console.error("===== خطأ في إعادة تهيئة البيانات =====", error);
      return false;
    }
  },
  
  /**
   * عملية فحص الصحة والتصحيح الذاتي للبيانات
   * تتحقق من وجود البيانات ومطابقتها للبنية المتوقعة
   * وتقوم بإصلاح أي مشاكل
   */
  repairData: async (): Promise<boolean> => {
    console.log("===== بدء إصلاح وتوحيد هياكل البيانات =====");
    
    try {
      // التأكد من وجود اتصال بقاعدة البيانات
      if (typeof window === 'undefined' || !db) {
        console.error("Firestore غير متاح أو المتصفح غير متاح");
        return false;
      }
      
      // 1. جمع جميع البيانات المتاحة من المسارات المختلفة
      console.log("جمع البيانات من جميع المسارات المحتملة...");
      const collections = ["siteData", "public_data", "site_content"];
      const documentTypes = ["heroInfo", "personalInfo", "experiences", "projects", "contactInfo", "socialLinks"];
      
      // كائنات لتخزين البيانات المجمعة
      const collectedData: { [key: string]: any } = {};
      
      // جمع البيانات من مسارات مختلفة
      for (const collection of collections) {
        for (const docType of documentTypes) {
          try {
            console.log(`فحص ${collection}/${docType}...`);
            const docRef = doc(db, collection, docType);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const data = docSnap.data();
              console.log(`✅ تم العثور على بيانات في ${collection}/${docType}`);
              
              // تخزين البيانات حسب النوع
              if (!collectedData[docType]) {
                collectedData[docType] = [];
              }
              
              // إضافة البيانات المستردة (مع مراعاة هياكل البيانات المختلفة)
              if (data.items) {
                // البيانات موجودة ضمن مفتاح items
                collectedData[docType].push({
                  source: `${collection}/${docType}`,
                  data: data.items,
                  isArray: Array.isArray(data.items),
                  timestamp: data.updatedAt || new Date().toISOString()
                });
              } else {
                // البيانات مباشرة في المستند
                collectedData[docType].push({
                  source: `${collection}/${docType}`,
                  data: data,
                  isArray: false,
                  timestamp: data.updatedAt || new Date().toISOString()
                });
              }
            }
          } catch (error) {
            console.error(`خطأ في فحص ${collection}/${docType}:`, error);
          }
        }
      }
      
      // البحث عن البيانات في site_content مع حقل type
      try {
        console.log("البحث في مجموعة site_content عن وثائق بحقل type...");
        const siteContentRef = collection(db, "site_content");
        const querySnapshot = await getDocs(siteContentRef);
        
        querySnapshot.forEach((docSnap: any) => {
          const data = docSnap.data();
          if (data.type && documentTypes.includes(data.type) && data.items) {
            if (!collectedData[data.type]) {
              collectedData[data.type] = [];
            }
            
            collectedData[data.type].push({
              source: `site_content/${docSnap.id}`,
              data: data.items,
              isArray: Array.isArray(data.items),
              timestamp: data.updatedAt || new Date().toISOString()
            });
            console.log(`✅ تم العثور على بيانات في site_content لنوع: ${data.type}`);
          }
        });
      } catch (error) {
        console.error("خطأ في البحث في مجموعة site_content:", error);
      }
      
      // 2. جمع البيانات من التخزين المحلي إذا كان متاحًا
      try {
        for (const docType of documentTypes) {
          const localData = localStorage.getItem(docType);
          if (localData) {
            try {
              const parsedData = JSON.parse(localData);
              console.log(`✅ تم العثور على بيانات في localStorage لنوع: ${docType}`);
              
              if (!collectedData[docType]) {
                collectedData[docType] = [];
              }
              
              collectedData[docType].push({
                source: `localStorage/${docType}`,
                data: parsedData,
                isArray: Array.isArray(parsedData),
                timestamp: new Date().toISOString() // لا يوجد طابع زمني للتخزين المحلي
              });
            } catch (parseError) {
              console.error(`خطأ في تحليل بيانات localStorage لنوع: ${docType}:`, parseError);
            }
          }
        }
      } catch (localStorageError) {
        console.error("خطأ في الوصول إلى localStorage:", localStorageError);
      }
      
      // 3. دمج البيانات واختيار أحدث إصدار لكل نوع
      console.log("===== دمج وتوحيد البيانات =====");
      const mergedData: { [key: string]: any } = {};
      
      for (const docType of documentTypes) {
        if (collectedData[docType] && collectedData[docType].length > 0) {
          console.log(`معالجة نوع البيانات: ${docType} (${collectedData[docType].length} مصادر)`);
          
          // ترتيب البيانات حسب الطابع الزمني (الأحدث أولاً)
          collectedData[docType].sort((a: any, b: any) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          
          // اختيار المصدر الأحدث
          const latestSource = collectedData[docType][0];
          console.log(`اختيار المصدر الأحدث: ${latestSource.source} (${latestSource.timestamp})`);
          
          // تحويل البيانات إلى الهيكل الصحيح
          let processedData;
          
          switch (docType) {
            case "heroInfo":
              // التأكد من وجود جميع حقول HeroInfo
              processedData = {
                name: latestSource.data.name || "",
                title: latestSource.data.title || "",
                bio: latestSource.data.bio || "",
                skills: Array.isArray(latestSource.data.skills) ? latestSource.data.skills : 
                        (typeof latestSource.data.skills === 'string' ? latestSource.data.skills.split(',').map((s: string) => s.trim()) : [])
              };
              break;
              
            case "personalInfo":
              // تحويل personalInfo إلى المصفوفة الصحيحة
              if (latestSource.isArray) {
                processedData = latestSource.data.map((item: any) => ({
                  id: item.id || `info-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: item.title || item.info || "",
                  content: item.content || item.info || "",
                  icon: item.icon || "FaInfoCircle"
                }));
              } else {
                processedData = [latestSource.data].map((item: any) => ({
                  id: item.id || `info-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: item.title || item.info || "",
                  content: item.content || item.info || "",
                  icon: item.icon || "FaInfoCircle"
                }));
              }
              break;
              
            case "experiences":
              // تحويل experiences إلى المصفوفة الصحيحة
              if (latestSource.isArray) {
                processedData = latestSource.data.map((item: any) => ({
                  id: item.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: item.title || "",
                  company: item.company || "",
                  period: item.period || "",
                  description: item.description || "",
                  icon: item.icon || "FaBriefcase"
                }));
              } else {
                processedData = [latestSource.data].map((item: any) => ({
                  id: item.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: item.title || "",
                  company: item.company || "",
                  period: item.period || "",
                  description: item.description || "",
                  icon: item.icon || "FaBriefcase"
                }));
              }
              break;
              
            case "projects":
              // تحويل projects إلى المصفوفة الصحيحة
              if (latestSource.isArray) {
                processedData = latestSource.data.map((item: any) => ({
                  id: item.id || `proj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: item.title || "",
                  category: item.category || "other",
                  description: item.description || item.desc || "",
                  image: item.image || item.imageUrl || "",
                  year: item.year || new Date().getFullYear(),
                  isActive: item.isActive !== undefined ? item.isActive : true
                }));
              } else {
                processedData = [latestSource.data].map((item: any) => ({
                  id: item.id || `proj-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: item.title || "",
                  category: item.category || "other",
                  description: item.description || item.desc || "",
                  image: item.image || item.imageUrl || "",
                  year: item.year || new Date().getFullYear(),
                  isActive: item.isActive !== undefined ? item.isActive : true
                }));
              }
              break;
              
            case "contactInfo":
              // تحويل contactInfo إلى المصفوفة الصحيحة
              if (latestSource.isArray) {
                processedData = latestSource.data.map((item: any) => ({
                  id: item.id || `contact-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: item.title || "",
                  value: item.value || item.subtitle || "",
                  icon: item.icon || "FaEnvelope",
                  link: item.link || ""
                }));
              } else {
                processedData = [latestSource.data].map((item: any) => ({
                  id: item.id || `contact-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  title: item.title || "",
                  value: item.value || item.subtitle || "",
                  icon: item.icon || "FaEnvelope",
                  link: item.link || ""
                }));
              }
              break;
              
            case "socialLinks":
              // تحويل socialLinks إلى المصفوفة الصحيحة
              if (latestSource.isArray) {
                processedData = latestSource.data.map((item: any) => ({
                  id: item.id || item.platform || `social-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                  icon: item.icon || "FaLink",
                  url: item.url || "",
                  label: item.label || item.id || ""
                }));
              } else if (typeof latestSource.data === 'object' && !Array.isArray(latestSource.data)) {
                // تحويل كائن إلى مصفوفة
                processedData = Object.entries(latestSource.data).map(([key, value]) => ({
                  id: key,
                  icon: `Fa${key.charAt(0).toUpperCase() + key.slice(1)}`,
                  url: value as string,
                  label: key.charAt(0).toUpperCase() + key.slice(1)
                }));
              } else {
                processedData = [];
              }
              break;
              
            default:
              processedData = latestSource.data;
          }
          
          mergedData[docType] = processedData;
          console.log(`✅ تم معالجة بيانات ${docType} بنجاح`);
        } else {
          console.log(`⚠️ لا توجد بيانات متاحة لنوع: ${docType}، استخدام البيانات الافتراضية`);
          mergedData[docType] = DEFAULT_DATA[docType as keyof typeof DEFAULT_DATA];
        }
      }
      
      // 4. حفظ البيانات الموحدة في المسار الرئيسي
      console.log("===== حفظ البيانات الموحدة =====");
      
      for (const docType of documentTypes) {
        try {
          console.log(`حفظ ${docType}...`);
          let success = false;
          
          if (docType === "heroInfo") {
            // heroInfo لا يستخدم حقل items
            success = await DataService.saveData(
              "siteData", 
              docType, 
              mergedData[docType],
              false
            );
          } else {
            // باقي الأنواع تستخدم حقل items
            success = await DataService.saveData(
              "siteData", 
              docType, 
              mergedData[docType],
              true
            );
          }
          
          // تحديث التخزين المحلي
          if (success) {
            console.log(`✅ تم حفظ ${docType} في Firestore بنجاح`);
            localStorage.setItem(docType, JSON.stringify(mergedData[docType]));
            console.log(`✅ تم حفظ ${docType} في localStorage بنجاح`);
          } else {
            console.error(`❌ فشل في حفظ ${docType} في Firestore`);
            localStorage.setItem(docType, JSON.stringify(mergedData[docType]));
            console.log(`⚠️ تم حفظ ${docType} في localStorage فقط`);
          }
        } catch (error) {
          console.error(`❌ خطأ في حفظ ${docType}:`, error);
        }
      }
      
      // تم الانتهاء من عملية الإصلاح
      console.log("===== تم الانتهاء من إصلاح وتوحيد هياكل البيانات بنجاح =====");
      return true;
    } catch (error) {
      console.error("❌ خطأ عام في عملية إصلاح البيانات:", error);
      return false;
    }
  },
  
  // التايم لاين (الخط الزمني)
  getTimelineItems: async (): Promise<TimelineItem[]> => {
    console.log("[DataService] بدء استدعاء getTimelineItems");
    try {
      // تحقق إذا كنا في بيئة الخادم
      if (typeof window === 'undefined') {
        console.log("[DataService] استدعاء من الخادم، إرجاع البيانات الافتراضية");
        return DEFAULT_DATA.timelineItems;
      }
      
      // قراءة البيانات من Firestore
      try {
        if (!db) {
          console.error("[DataService] Firestore غير متاح");
          return DEFAULT_DATA.timelineItems;
        }
        
        console.log("[DataService] محاولة قراءة بيانات التايم لاين من Firestore");
        // المسار: siteData/timelineItems
        const docRef = doc(db as Firestore, "siteData", "timelineItems");
        const docSnap = await getDoc(docRef);
        
        console.log("[DataService] نتيجة الاستعلام:", docSnap.exists() ? "توجد بيانات" : "لا توجد بيانات");
        
        if (docSnap.exists() && docSnap.data()) {
          const firebaseData = docSnap.data();
          console.log("[DataService] هيكل البيانات المسترجعة:", Object.keys(firebaseData));
          
          // استخراج البيانات حسب الهيكل
          let timelineItems: TimelineItem[] = [];
          
          if (firebaseData.items && Array.isArray(firebaseData.items)) {
            // البيانات موجودة ضمن مفتاح items
            timelineItems = firebaseData.items;
            console.log(`[DataService] استخدام البيانات من items - عدد ${timelineItems.length} عنصر`);
          } else if (Array.isArray(firebaseData)) {
            // البيانات مباشرة كمصفوفة
            timelineItems = firebaseData;
            console.log(`[DataService] استخدام البيانات كمصفوفة مباشرة - عدد ${timelineItems.length} عنصر`);
          }
          
          // تحقق من وجود عناصر بعد معالجة البيانات
          if (timelineItems.length > 0) {
            // تسجيل البيانات المستخرجة
            console.log(`[DataService] بيانات التايم لاين - عدد ${timelineItems.length} عنصر`);
            // حفظ البيانات محلياً للاستخدام عند انقطاع الاتصال
            localStorage.setItem("timelineItems", JSON.stringify(timelineItems));
            
            return timelineItems;
          }
        }
      } catch (error) {
        console.error("[DataService] خطأ في قراءة بيانات التايم لاين:", error);
      }
      
      // استخدام البيانات المحلية كخيار أخير
      try {
        const localData = localStorage.getItem("timelineItems");
        if (localData) {
          const parsedData = JSON.parse(localData);
          console.log(`[DataService] استخدام بيانات محلية مخزنة - عدد ${parsedData.length} عنصر`);
          return parsedData;
        } else {
          console.log("[DataService] لا توجد بيانات محلية مخزنة");
        }
      } catch (e) {
        console.error("[DataService] خطأ في تحليل البيانات المحلية:", e);
      }
      
      // استخدام البيانات الافتراضية كملاذ أخير
      console.log(`[DataService] استخدام البيانات الافتراضية - عدد ${DEFAULT_DATA.timelineItems.length} عنصر`);
      return DEFAULT_DATA.timelineItems;
    } catch (error) {
      console.error("[DataService] خطأ غير متوقع في استرداد بيانات التايم لاين:", error);
      return DEFAULT_DATA.timelineItems;
    }
  },
  
  saveTimelineItems: async (data: TimelineItem[]): Promise<boolean> => {
    console.log("[DataService] بدء محاولة حفظ بيانات التايم لاين - عدد عناصر:", data.length);
    try {
      if (!db) {
        console.error("[DataService] حفظ بيانات التايم لاين: Firestore غير متاح");
        return false;
      }
      
      // تحقق من صحة البيانات قبل الحفظ
      if (!Array.isArray(data)) {
        console.error("[DataService] خطأ: البيانات المراد حفظها ليست مصفوفة");
        return false;
      }
      
      // تنقية البيانات من أي قيم غير صالحة
      const validData = data.filter(item => 
        item && typeof item === 'object' && 
        item.id && typeof item.id === 'string' &&
        item.title && typeof item.title === 'string'
      );
      
      if (validData.length !== data.length) {
        console.warn(`[DataService] تمت إزالة ${data.length - validData.length} عناصر غير صالحة من البيانات قبل الحفظ`);
      }
      
      // تحديث البيانات في Firestore مع تنسيق items
      console.log("[DataService] حفظ بيانات التايم لاين في المسار: siteData/timelineItems");
      
      const timelineItemsRef = doc(db as Firestore, "siteData", "timelineItems");
      
      await setDoc(timelineItemsRef, { items: validData });
      console.log("[DataService] تم حفظ بيانات التايم لاين بنجاح في Firestore");
      
      // تحديث البيانات محلياً أيضاً
      try {
        localStorage.setItem("timelineItems", JSON.stringify(validData));
        console.log("[DataService] تم حفظ بيانات التايم لاين في التخزين المحلي");
      } catch (localError) {
        console.warn("[DataService] تعذر حفظ بيانات التايم لاين في التخزين المحلي:", localError);
      }
      
      return true;
    } catch (error) {
      console.error("[DataService] فشل في حفظ بيانات التايم لاين:", error);
      return false;
    }
  },
};

// تصدير الدوال المساعدة والكائنات لتسهيل الاستخدام
export const {
  getHeroInfo, saveHeroInfo,
  getPersonalInfo, savePersonalInfo,
  getExperiences, saveExperiences,
  getProjects, saveProjects,
  getContactInfo, saveContactInfo,
  getSocialLinks, saveSocialLinks,
  initializeAllData,
  repairData,
  getCVFiles, saveCVFiles, incrementCVDownloadCount,
  getTimelineItems, saveTimelineItems
} = DataService;

// إضافة دوال التصنيفات
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('[DataService] جاري تحميل التصنيفات من Firebase...');
    
    // تحقق إذا كنا في بيئة الخادم
    if (typeof window === 'undefined') {
      console.log('[DataService] تم الاستدعاء على جانب الخادم، استخدام القيم الافتراضية');
      return DEFAULT_DATA.categories;
    }
    
    // الحصول على مثيل Firestore
    const firestore = getFirestoreInstance();
    if (!firestore) {
      console.error('[DataService] Firestore غير متاح، استخدام البيانات الافتراضية');
      return DEFAULT_DATA.categories;
    }
    
    // محاولة الحصول على البيانات من localStorage أولاً
    const localData = localStorage.getItem("categories");
    if (localData) {
      try {
        const categories = JSON.parse(localData) as Category[];
        console.log('[DataService] تم قراءة التصنيفات من التخزين المحلي:', categories.length);
        return categories;
      } catch (e) {
        console.error('[DataService] خطأ في تحليل بيانات التصنيفات من التخزين المحلي:', e);
      }
    }
    
    // محاولة الحصول على البيانات من Firebase
    const docRef = doc(firestore as Firestore, "siteData", "categories");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().items) {
      console.log('[DataService] تم العثور على التصنيفات!', docSnap.data().items.length);
      
      // تحديث التخزين المحلي بأحدث البيانات
      localStorage.setItem("categories", JSON.stringify(docSnap.data().items));
      
      return docSnap.data().items as Category[];
    }
    
    // محاولة بديلة من مسار آخر
    try {
      const docRefAlt = doc(firestore as Firestore, "public_data", "categories");
      const docSnapAlt = await getDoc(docRefAlt);
      
      if (docSnapAlt.exists() && docSnapAlt.data().items) {
        console.log('[DataService] تم العثور على التصنيفات في المسار البديل!', docSnapAlt.data().items.length);
        
        // تحديث التخزين المحلي بأحدث البيانات
        localStorage.setItem("categories", JSON.stringify(docSnapAlt.data().items));
        
        return docSnapAlt.data().items as Category[];
      }
    } catch (altError) {
      console.warn('[DataService] خطأ في قراءة التصنيفات من المسار البديل:', altError);
    }
    
    // إرجاع البيانات الافتراضية إذا لم يتم العثور على بيانات
    console.log('[DataService] لم يتم العثور على تصنيفات، إرجاع البيانات الافتراضية');
    return DEFAULT_DATA.categories;
  } catch (error) {
    console.error('[DataService] خطأ في تحميل التصنيفات:', error);
    
    // محاولة استخدام البيانات المحلية في حالة الخطأ
    try {
      const localData = localStorage.getItem("categories");
      if (localData) {
        const categories = JSON.parse(localData) as Category[];
        console.log('[DataService] استخدام البيانات المحلية بعد حدوث خطأ');
        return categories;
      }
    } catch (e) {
      console.error('[DataService] خطأ في قراءة البيانات المحلية للتصنيفات:', e);
    }
    
    // إرجاع البيانات الافتراضية في حالة الخطأ
    return DEFAULT_DATA.categories;
  }
};

export const saveCategories = async (categories: Category[]): Promise<boolean> => {
  try {
    console.log('جاري حفظ التصنيفات في Firebase...', categories.length);
    
    // تحقق إذا كنا في بيئة الخادم
    if (typeof window === 'undefined') {
      console.log('تم الاستدعاء على جانب الخادم، لا يمكن حفظ البيانات');
      return false;
    }
    
    // التحقق من وجود db
    if (!db) {
      console.error('Firestore غير متاح');
      return false;
    }
    
    // حفظ البيانات في المسار الرئيسي
    const docRef = doc(db, "siteData", "categories");
    await setDoc(docRef, { items: categories });
    console.log('تم حفظ التصنيفات بنجاح في المسار الرئيسي!');
    
    // حفظ في مسار بديل للتأكد
    try {
      const docRefAlt = doc(db, "public_data", "categories");
      await setDoc(docRefAlt, { items: categories });
      console.log('تم حفظ التصنيفات بنجاح في المسار البديل أيضاً!');
    } catch (altError) {
      console.warn('لم يتم حفظ التصنيفات في المسار البديل، لكن تم الحفظ في المسار الرئيسي', altError);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ التصنيفات:', error);
    
    // محاولة بديلة
    try {
      if (!db) {
        console.error('Firestore غير متاح');
        return false;
      }
      
      const docRefBackup = doc(db, "public_data", "categories");
      await setDoc(docRefBackup, { items: categories });
      console.log('تم حفظ التصنيفات بنجاح في المسار البديل!');
      return true;
    } catch (backupError) {
      console.error('فشل حفظ التصنيفات في جميع المسارات:', backupError);
      return false;
    }
  }
};

// وظيفة للحصول على روابط الهيدر
export const getHeaderLinks = async (): Promise<{name: string, url: string, isActive: boolean}[]> => {
  try {
    console.log('جاري تحميل روابط الهيدر من Firebase...');
    
    // محاولة الحصول على البيانات من Firebase
    const docRef = doc(db, "siteData", "header");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().links) {
      console.log('تم العثور على روابط الهيدر!', docSnap.data().links.length);
      return docSnap.data().links;
    }
    
    // محاولة بديلة من مسار آخر
    const docRefAlt = doc(db, "public_data", "header");
    const docSnapAlt = await getDoc(docRefAlt);
    
    if (docSnapAlt.exists() && docSnapAlt.data().links) {
      console.log('تم العثور على روابط الهيدر في المسار البديل!', docSnapAlt.data().links.length);
      return docSnapAlt.data().links;
    }
    
    // إرجاع البيانات الافتراضية إذا لم يتم العثور على بيانات
    console.log('لم يتم العثور على روابط الهيدر، إرجاع البيانات الافتراضية');
    return [
      { name: "الرئيسية", url: "/", isActive: true },
      { name: "الفيديو", url: "/#video", isActive: true },
      { name: "نبذة عني", url: "/#info", isActive: true },
      { name: "الخبرات", url: "/#experience", isActive: true },
      { name: "المسار الزمني", url: "/#timeline", isActive: true },
      { name: "أعمالي", url: "/#works", isActive: true },
      { name: "تواصل معي", url: "/#contact", isActive: true },
      { name: "لوحة التحكم", url: "/admin", isActive: true }
    ];
  } catch (error) {
    console.error('خطأ في تحميل روابط الهيدر:', error);
    
    // إرجاع البيانات الافتراضية في حالة الخطأ
    return [
      { name: "الرئيسية", url: "/", isActive: true },
      { name: "الفيديو", url: "/#video", isActive: true },
      { name: "نبذة عني", url: "/#info", isActive: true },
      { name: "الخبرات", url: "/#experience", isActive: true },
      { name: "المسار الزمني", url: "/#timeline", isActive: true },
      { name: "أعمالي", url: "/#works", isActive: true },
      { name: "تواصل معي", url: "/#contact", isActive: true },
      { name: "لوحة التحكم", url: "/admin", isActive: true }
    ];
  }
};

export const saveHeaderLinks = async (links: {name: string, url: string, isActive: boolean}[]): Promise<boolean> => {
  try {
    console.log('جاري حفظ روابط الهيدر في Firebase...', links.length);
    
    // حفظ البيانات في المسار الرئيسي
    const docRef = doc(db, "siteData", "header");
    await setDoc(docRef, { links });
    console.log('تم حفظ روابط الهيدر بنجاح في المسار الرئيسي!');
    
    // حفظ في مسار بديل للتأكد
    try {
      const docRefAlt = doc(db, "public_data", "header");
      await setDoc(docRefAlt, { links });
      console.log('تم حفظ روابط الهيدر بنجاح في المسار البديل أيضاً!');
    } catch (altError) {
      console.warn('لم يتم حفظ روابط الهيدر في المسار البديل، لكن تم الحفظ في المسار الرئيسي', altError);
    }
    
    return true;
  } catch (error) {
    console.error('خطأ في حفظ روابط الهيدر:', error);
    
    // محاولة بديلة
    try {
      const docRefBackup = doc(db, "public_data", "header");
      await setDoc(docRefBackup, { links });
      console.log('تم حفظ روابط الهيدر بنجاح في المسار البديل!');
      return true;
    } catch (backupError) {
      console.error('فشل حفظ روابط الهيدر في جميع المسارات:', backupError);
      return false;
    }
  }
};

// وظيفة تحويل روابط YouTube العادية إلى روابط embed
const convertYouTubeUrlToEmbed = (url: string): string => {
  if (!url) return '';
  
  // التحقق من شكل الرابط وعمل التحويل المناسب
  if (url.includes('youtube.com/watch?v=')) {
    // استخراج معرف الفيديو من الرابط العادي
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes('youtu.be/')) {
    // استخراج معرف الفيديو من الرابط المختصر
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes('youtube.com/embed/')) {
    // الرابط بالفعل بصيغة embed
    return url;
  }
  
  // إذا لم يكن رابط يوتيوب معروف، إرجاع الرابط كما هو
  return url;
};

// توحيد روابط يوتيوب ليتم تخزينها بالتنسيق العادي
const normalizeYouTubeUrl = (url: string): string => {
  if (!url) return '';
  
  // إذا كان الرابط بصيغة embed، تحويله إلى رابط عادي
  if (url.includes('youtube.com/embed/')) {
    const videoId = url.split('/embed/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
  }
  
  // إذا كان مختصرًا، تحويله إلى الصيغة الكاملة
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
  }
  
  // إرجاع الرابط كما هو إذا كان بالتنسيق المطلوب
  return url;
};

/**
 * الحصول على بيانات الفيديو التعريفي
 */
export const getVideoInfo = async (): Promise<VideoInfo> => {
  try {
    console.log("جاري تحميل بيانات الفيديو التعريفي...");
    
    // التحقق من وجود بيانات في localStorage للاستخدام السريع
    let localData: VideoInfo | null = null;
    
    try {
      const storedData = localStorage.getItem("videoInfo");
      if (storedData) {
        localData = JSON.parse(storedData) as VideoInfo;
        console.log("تم العثور على بيانات الفيديو في التخزين المحلي:", localData);
      }
    } catch (e) {
      console.warn("خطأ في قراءة بيانات الفيديو من التخزين المحلي:", e);
    }
    
    // في حالة عدم وجود اتصال بالإنترنت
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log("لا يوجد اتصال بالإنترنت، استخدام البيانات المحلية");
      return localData || DEFAULT_DATA.videoInfo;
    }
    
    // محاولة الحصول على البيانات من Firestore
    const dataService = DataService;
    const videoInfo = await dataService.getData<VideoInfo>(
      "siteData", 
      "videoInfo", 
      DEFAULT_DATA.videoInfo
    );
    
    console.log("تم استلام بيانات الفيديو من Firestore:", videoInfo);
    console.log("حالة تفعيل الفيديو:", videoInfo.isActive);
    
    // تحديث التخزين المحلي بأحدث البيانات
    try {
      localStorage.setItem("videoInfo", JSON.stringify(videoInfo));
    } catch (e) {
      console.warn("خطأ في حفظ بيانات الفيديو في التخزين المحلي:", e);
    }
    
    return videoInfo;
  } catch (error) {
    console.error("خطأ في تحميل بيانات الفيديو التعريفي:", error);
    
    // محاولة استخدام البيانات المحلية في حالة الخطأ
    try {
      const storedData = localStorage.getItem("videoInfo");
      if (storedData) {
        const localData = JSON.parse(storedData) as VideoInfo;
        console.log("استخدام بيانات الفيديو من التخزين المحلي بسبب الخطأ:", localData);
        return localData;
      }
    } catch (e) {
      console.warn("خطأ في قراءة بيانات الفيديو من التخزين المحلي:", e);
    }
    
    return DEFAULT_DATA.videoInfo;
  }
};

/**
 * حفظ بيانات الفيديو التعريفي
 */
export const saveVideoInfo = async (videoInfo: VideoInfo): Promise<boolean> => {
  try {
    console.log("جاري حفظ بيانات الفيديو التعريفي في Firestore...");
    console.log("البيانات المراد حفظها:", videoInfo);
    console.log("حالة التفعيل:", videoInfo.isActive);
    
    // توحيد تنسيق الرابط قبل الحفظ (نريد تخزينه بالتنسيق العادي)
    const normalizedUrl = normalizeYouTubeUrl(videoInfo.videoUrl);
    
    const updatedVideoInfo = {
      ...videoInfo,
      videoUrl: normalizedUrl,
      lastUpdate: new Date().toISOString()
    };
    
    console.log("البيانات بعد توحيد التنسيق:", updatedVideoInfo);
    
    const dataService = DataService;
    const success = await dataService.saveData<VideoInfo>(
      "siteData", 
      "videoInfo", 
      updatedVideoInfo,
      false
    );
    
    if (success) {
      console.log("تم حفظ بيانات الفيديو التعريفي بنجاح في Firestore");
      
      // أيضاً حفظ البيانات مباشرة في localStorage للاستخدام الفوري
      try {
        localStorage.setItem("videoInfo", JSON.stringify(updatedVideoInfo));
        console.log("تم حفظ بيانات الفيديو في التخزين المحلي أيضاً");
      } catch (storageError) {
        console.warn("تعذر حفظ البيانات في التخزين المحلي:", storageError);
      }
    } else {
      console.error("فشل حفظ بيانات الفيديو التعريفي في Firestore");
    }
    
    return success;
  } catch (error) {
    console.error("خطأ في حفظ بيانات الفيديو التعريفي:", error);
    
    // محاولة الحفظ في localStorage فقط في حالة الخطأ
    try {
      // توحيد تنسيق الرابط قبل الحفظ
      const normalizedUrl = normalizeYouTubeUrl(videoInfo.videoUrl);
      const updatedVideoInfo = {
        ...videoInfo,
        videoUrl: normalizedUrl,
        lastUpdate: new Date().toISOString()
      };
      
      localStorage.setItem("videoInfo", JSON.stringify(updatedVideoInfo));
      console.log("تم حفظ بيانات الفيديو في التخزين المحلي فقط");
      return true; // اعتبر العملية ناجحة إذا تم الحفظ محلياً
    } catch (storageError) {
      console.error("فشل الحفظ في Firestore والتخزين المحلي:", storageError);
      return false;
    }
  }
};

// الحصول على معلومات الاتصال
export const getContactVCard = async (): Promise<ContactVCard | null> => {
  try {
    // محاولة استرداد البيانات من المخزن المحلي أولاً
    if (typeof window !== 'undefined') {
      const cachedData = localStorage.getItem('contactVCard');
      if (cachedData) {
        console.log('تم استرداد معلومات الاتصال من المخزن المحلي');
        return JSON.parse(cachedData);
      }
    }
    
    // إذا لم تكن البيانات موجودة في المخزن المحلي، استردادها من Firestore
    const contactRef = collection(db, 'contactVCard');
    const q = query(contactRef, where('isActive', '==', true), limit(1));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const contactData = snapshot.docs[0].data() as ContactVCard;
      contactData.id = snapshot.docs[0].id;
      
      // تخزين البيانات في المخزن المحلي للاستخدام المستقبلي
      if (typeof window !== 'undefined') {
        localStorage.setItem('contactVCard', JSON.stringify(contactData));
      }
      
      console.log('تم استرداد معلومات الاتصال من Firestore');
      return contactData;
    }
    
    console.log('لم يتم العثور على معلومات الاتصال');
    return null;
  } catch (error) {
    console.error('خطأ في استرداد معلومات الاتصال:', error);
    return null;
  }
};

// حفظ أو تحديث معلومات الاتصال
export const saveContactVCard = async (contactData: ContactVCard): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    let docRef;
    
    if (contactData.id) {
      // تحديث مستند موجود
      docRef = doc(db, 'contactVCard', contactData.id);
      await updateDoc(docRef, {
        name: contactData.name || '',
        title: contactData.title || '',
        photo: contactData.photo || '',
        phones: contactData.phones || [],
        whatsapp: contactData.whatsapp || '',
        email: contactData.email || '',
        website: contactData.website || '',
        address: contactData.address || '',
        socialMedia: contactData.socialMedia || {},
        isActive: contactData.isActive !== undefined ? contactData.isActive : true,
        updatedAt: new Date().toISOString()
      });
      
      console.log('تم تحديث معلومات الاتصال بنجاح');
    } else {
      // إنشاء مستند جديد
      const contactCollection = collection(db, 'contactVCard');
      docRef = await addDoc(contactCollection, {
        name: contactData.name || '',
        title: contactData.title || '',
        photo: contactData.photo || '',
        phones: contactData.phones || [],
        whatsapp: contactData.whatsapp || '',
        email: contactData.email || '',
        website: contactData.website || '',
        address: contactData.address || '',
        socialMedia: contactData.socialMedia || {},
        isActive: contactData.isActive !== undefined ? contactData.isActive : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('تم إنشاء معلومات الاتصال بنجاح');
    }
    
    // مسح المخزن المحلي لإجبار التحديث في المرة القادمة
    if (typeof window !== 'undefined') {
      localStorage.removeItem('contactVCard');
    }
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('خطأ في حفظ معلومات الاتصال:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'حدث خطأ غير معروف'
    };
  }
};

// رفع صورة ملف الاتصال
export const uploadContactPhoto = async (file: File): Promise<{ url: string } | { error: string }> => {
  try {
    const timestamp = new Date().getTime();
    const storageRef = ref(storage, `contact-photos/${timestamp}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // التقدم في عملية الرفع (اختياري)
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('رفع الصورة: ' + progress.toFixed(0) + '%');
        },
        (error) => {
          console.error('خطأ في رفع الصورة:', error);
          reject({ error: 'فشل في رفع الصورة' });
        },
        async () => {
          // اكتمال الرفع بنجاح، الحصول على URL للتنزيل
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({ url: downloadURL });
        }
      );
    });
  } catch (error) {
    console.error('خطأ في رفع ملف الصورة:', error);
    return { error: 'فشل في معالجة ملف الصورة' };
  }
};
