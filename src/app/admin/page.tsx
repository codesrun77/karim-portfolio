"use client";
import { useState, useEffect, useRef } from "react";
import AuthCheck from "../components/AuthCheck";
import { FaCamera, FaTrash, FaSave, FaPlus, FaTimes, FaUser, FaBriefcase, FaPhone, FaHome, FaClipboard, FaEnvelope, FaWhatsapp, FaEdit } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { projects as defaultProjects } from "@/components/WorksSection";
import { signOut } from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// التأكد من أن المصفوفات غير فارغة وموجودة قبل استخدام map
const safeMap = <T, U>(array: T[] | undefined | null, callback: (item: T, index: number, array: T[]) => U): U[] => {
  return array && Array.isArray(array) ? array.map(callback) : [];
};

// تحسين معالجة الأخطاء عند استخدام join
const safeJoin = (array: any[] | undefined | null, separator: string = ', '): string => {
  if (!array || !Array.isArray(array)) {
    return '';
  }
  return array.join(separator);
};

// التأكد من السلامة عند عرض القسم الرئيسي
const safeSplitString = (str: string | undefined | null): string[] => {
  return str && typeof str === 'string' ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
};

// تعريف الواجهات
interface Project {
  id: string | number;
  title: string;
  category: string;
  imageUrl: string;
  desc: string;
  year: string | number;
  isActive?: boolean;
}

interface PersonalInfo {
  id: string;
  icon: string;
  title: string;
  info: string;
  extra: string | null;
}

interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
  icon: string;
}

interface ContactInfo {
  id: string;
  icon: string;
  title: string;
  value?: string;
  subtitle?: string;
  link: string;
  color?: string;
}

interface SocialLink {
  id: string;
  icon: string;
  url: string;
  label: string;
}

interface HeroInfo {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  socialLinks: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    youtube: string;
    soundcloud: string;
    email: string;
  };
}

const categories = [
  { id: "all", name: "كل الأعمال" },
  { id: "tv", name: "قنوات راديو وتلفزيون" },
  { id: "film", name: "أفلام ومسلسلات" },
  { id: "program", name: "برامج ووثائقيات" }
];

// الدوال المساعدة للتفاعل مع Firebase

// وظيفة جلب بيانات من Firebase
const getFirebaseData = async (collectionPath: string, docId: string) => {
  try {
    if (!db || !auth) {
      console.error("قاعدة البيانات أو المصادقة غير متاحة");
      return null;
    }
    
    const user = auth.currentUser;
    console.log("حالة المستخدم الحالي:", user ? `مسجل: ${user.email}` : "غير مسجل");
    
    console.log(`محاولة جلب بيانات من ${collectionPath}/${docId}`);
    
    const docRef = doc(db, collectionPath, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log(`البيانات موجودة في ${collectionPath}/${docId}:`);
      const data = docSnap.data();
      console.log(data);
      return data.items || data;
    } else {
      console.log(`لم يتم العثور على بيانات في ${collectionPath}/${docId}`);
      return null;
    }
  } catch (error) {
    console.error("خطأ في الحصول على البيانات من Firebase:", error);
    return null;
  }
};

// وظيفة حفظ البيانات في Firestore عامة
const saveDataToFirestore = async (collectionPath: string, docId: string, data: any) => {
  try {
    if (!db || !auth) {
      console.error("قاعدة البيانات أو المصادقة غير متاحة");
      return false;
    }
    
    const user = auth.currentUser;
    console.log("محاولة حفظ البيانات بواسطة:", user ? `${user.email}` : "مستخدم غير مسجل");
    
    console.log(`محاولة حفظ البيانات في ${collectionPath}/${docId}`);
    console.log("البيانات للحفظ:", data);
    console.log("حالة المصادقة:", auth.currentUser ? "مسجل الدخول" : "غير مسجل الدخول");
    
    try {
      // محاولة الحفظ في المسار الأصلي
      const docRef = doc(db, collectionPath, docId);
      await setDoc(docRef, { 
        items: Array.isArray(data) ? data : [data],
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'غير معروف'
      });
      console.log(`تم الحفظ بنجاح في ${collectionPath}/${docId}`);
      return true;
    } catch (error) {
      console.error(`فشل الحفظ في ${collectionPath}/${docId}:`, error);
      
      // محاولة الحفظ في مسار عام
      try {
        const publicRef = doc(db, "public_data", docId);
        await setDoc(publicRef, { 
          items: Array.isArray(data) ? data : [data],
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser?.email || 'غير معروف'
        });
        console.log(`تم الحفظ بنجاح في public_data/${docId}`);
        return true;
      } catch (publicError) {
        console.error(`فشل الحفظ في public_data/${docId}:`, publicError);
        
        // محاولة الإضافة كوثيقة جديدة
        try {
          const collRef = collection(db, "site_content");
          await addDoc(collRef, {
            type: docId,
            items: Array.isArray(data) ? data : [data],
            updatedAt: new Date().toISOString(),
            updatedBy: auth.currentUser?.email || 'غير معروف'
          });
          console.log("تم إضافة وثيقة جديدة في مجموعة site_content");
          return true;
        } catch (addError) {
          console.error("فشل إضافة وثيقة جديدة:", addError);
          return false;
        }
      }
    }
  } catch (error) {
    console.error("خطأ في عملية الحفظ:", error);
    return false;
  }
};

// الدوال المتخصصة لكل نوع بيانات
const getFirebaseContactInfo = async (): Promise<ContactInfo[] | null> => {
  const data = await getFirebaseData("siteData", "contactInfo");
  return data as ContactInfo[] | null;
};

const saveFirebaseContactInfo = async (contactInfo: ContactInfo[]): Promise<boolean> => {
  return await saveDataToFirestore("siteData", "contactInfo", contactInfo);
};

const getFirebasePersonalInfo = async (): Promise<PersonalInfo[] | null> => {
  const data = await getFirebaseData("siteData", "personalInfo");
  return data as PersonalInfo[] | null;
};

const saveFirebasePersonalInfo = async (personalInfo: PersonalInfo[]): Promise<boolean> => {
  return await saveDataToFirestore("siteData", "personalInfo", personalInfo);
};

const getFirebaseExperiences = async (): Promise<Experience[] | null> => {
  const data = await getFirebaseData("siteData", "experiences");
  return data as Experience[] | null;
};

const saveFirebaseExperiences = async (experiences: Experience[]): Promise<boolean> => {
  return await saveDataToFirestore("siteData", "experiences", experiences);
};

const getFirebaseProjects = async (): Promise<Project[] | null> => {
  const data = await getFirebaseData("siteData", "projects");
  return data as Project[] | null;
};

const saveFirebaseProjects = async (projects: Project[]): Promise<boolean> => {
  return await saveDataToFirestore("siteData", "projects", projects);
};

const getFirebaseHeroInfo = async (): Promise<HeroInfo | null> => {
  try {
    console.log("جاري جلب بيانات القسم الرئيسي من Firestore...");
    if (!db) {
      console.error("Firestore غير متاح");
      return null;
    }
    
    const docRef = doc(db, "siteData", "heroInfo");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("تم العثور على بيانات القسم الرئيسي في Firestore:", docSnap.data());
      return docSnap.data() as HeroInfo;
    } else {
      console.log("لا توجد بيانات للقسم الرئيسي في Firestore");
      return null;
    }
  } catch (error) {
    console.error("خطأ في جلب بيانات القسم الرئيسي من Firestore:", error);
    return null;
  }
};

const saveFirebaseHeroInfo = async (heroInfo: HeroInfo): Promise<boolean> => {
  console.log("جاري تنفيذ وظيفة saveFirebaseHeroInfo...");
  try {
    if (!db) {
      console.error("Firestore غير متاح");
      return false;
    }
    
    // طباعة البيانات قبل الحفظ للتأكد من صحتها
    console.log("بيانات القسم الرئيسي قبل الحفظ:", heroInfo);
    console.log("نوع skills:", Array.isArray(heroInfo.skills) ? "مصفوفة" : typeof heroInfo.skills);
    console.log("عدد skills:", heroInfo.skills?.length || 0);
    console.log("محتوى skills:", heroInfo.skills);
    
    // حفظ البيانات في Firestore
    await setDoc(doc(db, "siteData", "heroInfo"), heroInfo);
    console.log("تم حفظ بيانات القسم الرئيسي في Firestore بنجاح");
    
    // حفظ البيانات في التخزين المحلي أيضًا
    localStorage.setItem("heroInfo", JSON.stringify(heroInfo));
    console.log("تم حفظ بيانات القسم الرئيسي في التخزين المحلي أيضًا");
    
    return true;
  } catch (error) {
    console.error("خطأ في حفظ بيانات القسم الرئيسي في Firestore:", error);
    return false;
  }
};

const getFirebaseSocialLinks = async (): Promise<SocialLink[] | null> => {
  const data = await getFirebaseData("siteData", "socialLinks");
  return data as SocialLink[] | null;
};

const saveFirebaseSocialLinks = async (socialLinks: SocialLink[]): Promise<boolean> => {
  return await saveDataToFirestore("siteData", "socialLinks", socialLinks);
};

const saveFirebaseProject = async (project: Project): Promise<boolean> => {
  try {
    if (!db) {
      console.error("Firestore غير متاح");
      return false;
    }
    
    const projectRef = doc(db, "projects", project.id.toString());
    await setDoc(projectRef, project);
    console.log("تم حفظ المشروع في Firestore بنجاح");
    return true;
  } catch (error) {
    console.error("خطأ في حفظ المشروع في Firestore:", error);
    return false;
  }
};

// إضافة وظيفة حذف المشروع
const handleProjectDelete = async (projectId: string | number) => {
  if (!window.confirm("هل أنت متأكد من حذف هذا المشروع؟")) {
    return;
  }

  try {
    if (!db) {
      console.error("Firestore غير متاح");
      return;
    }

    const projectRef = doc(db, "projects", projectId.toString());
    await deleteDoc(projectRef);
    console.log("تم حذف المشروع بنجاح");

    // تحديث قائمة المشاريع
    const updatedProjects = await getFirebaseProjects();
    if (updatedProjects) {
      setProjects(updatedProjects);
    }
  } catch (error) {
    console.error("خطأ في حذف المشروع:", error);
    alert("حدث خطأ أثناء حذف المشروع");
  }
};

// إضافة دالة تحديث المشروع داخل مكون AdminPage
const handleProjectUpdate = async () => {
  try {
    if (!editingProject || !db) {
      console.error("لا يوجد مشروع للتحديث أو Firestore غير متاح");
      return;
    }

    // تحويل البيانات إلى النوع الصحيح
    const projectToUpdate = {
      ...editingProject,
      id: editingProject.id.toString(),
      year: parseInt(editingProject.year.toString())
    };

    // جلب المشاريع الحالية
    const projectsRef = doc(db, "siteData", "projects");
    const projectsSnap = await getDoc(projectsRef);
    
    if (!projectsSnap.exists()) {
      console.error("لم يتم العثور على مجموعة المشاريع");
      return;
    }

    const currentProjects = projectsSnap.data().items || [];
    console.log("المشاريع الحالية:", currentProjects);

    // تحديث المشروع في المصفوفة
    const updatedProjects = currentProjects.map((project: Project) => {
      if (project.id.toString() === projectToUpdate.id.toString()) {
        console.log("تم العثور على المشروع للتحديث:", project);
        return projectToUpdate;
      }
      return project;
    });

    console.log("المشاريع المحدثة:", updatedProjects);

    // حفظ المصفوفة المحدثة
    await setDoc(projectsRef, { items: updatedProjects }, { merge: true });

    alert("تم تحديث المشروع بنجاح!");
    setEditingProject(null);
    
    // تحديث قائمة المشاريع
    const updatedProjectsList = await getFirebaseProjects();
    if (updatedProjectsList) {
      setProjects(updatedProjectsList);
    }
  } catch (error) {
    console.error("خطأ في تحديث المشروع:", error);
    alert("فشل في تحديث المشروع: " + (error as Error).message);
  }
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("hero");
  const [heroInfo, setHeroInfo] = useState<HeroInfo>({
    name: "",
    title: "",
    bio: "",
    skills: [],
    socialLinks: {
      whatsapp: "",
      instagram: "",
      facebook: "",
      youtube: "",
      soundcloud: "",
      email: ""
    }
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState<Project>({
    id: Date.now(),
    title: "",
    category: "documentary",
    imageUrl: "",
    desc: "",
    year: new Date().getFullYear(),
    isActive: true
  });
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  // بيانات المعلومات الشخصية
  const defaultPersonalInfo = [
    {
      id: "info",
      icon: "FaInfoCircle",
      title: "نبذة عني",
      info: "مهندس صوت خبرة أكثر من 10 سنوات في مجال هندسة الصوت والتوزيع الموسيقي",
      extra: null
    },
    {
      id: "birth",
      icon: "FaCalendarAlt",
      title: "تاريخ الميلاد",
      info: "12-9-1989",
      extra: null
    },
    {
      id: "nationality",
      icon: "FaFlag",
      title: "الجنسية",
      info: "مصري",
      extra: null
    },
    {
      id: "residence",
      icon: "FaMapMarkerAlt",
      title: "بلد الاقامة",
      info: "الامارات",
      extra: null
    }
  ];
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo[]>([]);
  const [editingInfo, setEditingInfo] = useState<PersonalInfo | null>(null);

  // بيانات الخبرات
  const defaultExperiences = [
    {
      id: 1,
      title: "مهندس صوت رئيسي",
      company: "استوديوهات الصوت العربية",
      period: "2018 - الحالي",
      description: "إدارة جلسات التسجيل الصوتي للأفلام والمسلسلات، إنتاج المؤثرات الصوتية، معالجة الصوت النهائية للأعمال الفنية المختلفة.",
      icon: "FaMicrophone"
    },
    // ... existing code ...
  ];
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [newExperience, setNewExperience] = useState<Experience>({
    id: Date.now(),
    title: "",
    company: "",
    period: "",
    description: "",
    icon: "FaMicrophone"
  });
  const [isAddingExperience, setIsAddingExperience] = useState(false);
  
  // بيانات الاتصال
  const defaultContactInfo = [
    {
      id: "email",
      icon: "FaEnvelope",
      title: "البريد الإلكتروني",
      value: "info@karimsound.com",
      subtitle: "info@karimsound.com",
      link: "mailto:info@karimsound.com",
      color: "from-blue-600 to-blue-400"
    },
    {
      id: "whatsapp",
      icon: "FaWhatsapp",
      title: "واتساب",
      subtitle: "+971 50 123 4567",
      link: "https://wa.me/971501234567",
      color: "from-green-600 to-green-400"
    },
    {
      id: "phone",
      icon: "FaPhone",
      title: "الاتصال",
      value: "+971 50 123 4567",
      subtitle: "+971 50 123 4567",
      link: "tel:+971501234567",
      color: "from-purple-600 to-purple-400"
    }
  ];
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState<ContactInfo>({
    id: `contact-${Date.now()}`,
    icon: "FaEnvelope",
    title: "",
    value: "",
    link: ""
  });

  // تحميل البيانات من Firebase عند التحميل
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadProjects();
      loadPersonalInfo();
      loadExperiences();
      loadContactInfo();
      loadHeroInfo();
    }
  }, []);

  // دوال تحميل البيانات
  const loadProjects = async () => {
    try {
      const firebaseProjects = await getFirebaseProjects();
      if (firebaseProjects && firebaseProjects.length > 0) {
        setProjects(firebaseProjects);
      } else {
        setProjects(defaultProjects);
      }
    } catch (error) {
      console.error("خطأ في تحميل المشاريع:", error);
      setProjects(defaultProjects);
    }
  };

  const loadPersonalInfo = async () => {
    try {
      const data = await getFirebasePersonalInfo();
      if (data && data.length > 0) {
        setPersonalInfo(data);
      } else {
        setPersonalInfo(defaultPersonalInfo);
      }
    } catch (error) {
      console.error("خطأ في تحميل المعلومات الشخصية:", error);
      setPersonalInfo(defaultPersonalInfo);
    }
  };

  const loadExperiences = async () => {
    try {
      const data = await getFirebaseExperiences();
      if (data && data.length > 0) {
        setExperiences(data);
      } else {
        setExperiences(defaultExperiences);
      }
    } catch (error) {
      console.error("خطأ في تحميل الخبرات:", error);
      setExperiences(defaultExperiences);
    }
  };

  const loadContactInfo = async () => {
    try {
      const data = await getFirebaseContactInfo();
      if (data && data.length > 0) {
        setContactInfo(data);
      } else {
        setContactInfo(defaultContactInfo);
      }
    } catch (error) {
      console.error("خطأ في تحميل معلومات الاتصال:", error);
      setContactInfo(defaultContactInfo);
    }
  };

  const loadHeroInfo = async () => {
    console.log("----------- بدء تحميل معلومات القسم الرئيسي -----------");
    try {
      console.log("محاولة تحميل البيانات من Firestore...");
      const data = await getFirebaseHeroInfo();
      
      if (data) {
        console.log("✅ تم تحميل بيانات القسم الرئيسي من Firestore بنجاح:", data);
        setHeroInfo(data);
      } else {
        console.log("❌ لم يتم العثور على بيانات القسم الرئيسي في Firestore");
        console.log("⚠️ محاولة تحميل البيانات من localStorage...");
        
        const localData = localStorage.getItem("heroInfo");
        if (localData) {
          try {
            const parsedData = JSON.parse(localData);
            console.log("✅ تم تحميل بيانات القسم الرئيسي من localStorage:", parsedData);
            setHeroInfo(parsedData);
          } catch (parseError) {
            console.error("❌ خطأ في تحليل بيانات localStorage:", parseError);
            console.log("⚠️ استخدام البيانات الافتراضية");
            setHeroInfo({
              name: "",
              title: "",
              bio: "",
              skills: [],
              socialLinks: {
                whatsapp: "",
                instagram: "",
                facebook: "",
                youtube: "",
                soundcloud: "",
                email: ""
              }
            });
          }
        } else {
          console.log("⚠️ لا توجد بيانات في localStorage، استخدام البيانات الافتراضية");
          setHeroInfo({
            name: "",
            title: "",
            bio: "",
            skills: [],
            socialLinks: {
              whatsapp: "",
              instagram: "",
              facebook: "",
              youtube: "",
              soundcloud: "",
              email: ""
            }
          });
        }
      }
    } catch (error) {
      console.error("❌ خطأ في تحميل معلومات القسم الرئيسي:", error);
      console.log("⚠️ استخدام البيانات الافتراضية");
      setHeroInfo({
        name: "",
        title: "",
        bio: "",
        skills: [],
        socialLinks: {
          whatsapp: "",
          instagram: "",
          facebook: "",
          youtube: "",
          soundcloud: "",
          email: ""
        }
      });
    }
    console.log("----------- انتهاء عملية تحميل معلومات القسم الرئيسي -----------");
  };

  // دالة تسجيل الخروج
  const handleLogout = async () => {
    if (!auth) {
      console.error("المصادقة غير متاحة");
      return;
    }
    
    try {
      await signOut(auth);
      alert("تم تسجيل الخروج بنجاح");
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  // إضافة دالة حفظ معلومات الاتصال داخل المكون
  const saveContactInfoToFirestore = async () => {
    try {
      console.log("بدء عملية حفظ معلومات الاتصال...");
      // نتأكد من أن state متاح قبل الحفظ
      if (!contactInfo || !Array.isArray(contactInfo)) {
        console.error("معلومات الاتصال غير متوفرة أو بصيغة غير صحيحة");
        alert("خطأ: معلومات الاتصال غير متوفرة");
        return;
      }
      
      const result = await saveDataToFirestore("siteData", "contactInfo", contactInfo);
      
      if (result) {
        localStorage.setItem("contactInfo", JSON.stringify(contactInfo));
        alert("تم حفظ معلومات الاتصال بنجاح في Firestore وفي المتصفح!");
      } else {
        localStorage.setItem("contactInfo", JSON.stringify(contactInfo));
        alert("فشل في حفظ المعلومات في Firestore، تم الحفظ محلياً فقط");
      }
    } catch (error) {
      console.error("خطأ في حفظ معلومات الاتصال:", error);
      // نستخدم try/catch للتأكد من أن state متاح عند الحفظ المحلي
      try {
        if (contactInfo && Array.isArray(contactInfo)) {
          localStorage.setItem("contactInfo", JSON.stringify(contactInfo));
          alert("فشل في حفظ المعلومات في Firestore، تم الحفظ محلياً فقط");
        } else {
          alert("فشل الحفظ: معلومات الاتصال غير متوفرة");
        }
      } catch (localError) {
        console.error("فشل الحفظ المحلي:", localError);
        alert("فشل الحفظ تماماً");
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setNewProject(prev => ({...prev, imageUrl: reader.result as string}));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedImage) {
        alert("يرجى اختيار صورة للمشروع");
        return;
      }

      // إنشاء اسم فريد للملف
      const timestamp = Date.now();
      const fileName = `${timestamp}-${selectedImage.name}`;
      const filePath = `/actual-images/${fileName}`;

      // حفظ الصورة في مجلد public/actual-images
      const formData = new FormData();
      formData.append('file', selectedImage);
      formData.append('path', filePath);

      // رفع الملف باستخدام API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('فشل في رفع الصورة');
      }

      const projectToSave = {
        ...newProject,
        imageUrl: filePath,
        id: Date.now().toString(),
        year: parseInt(newProject.year.toString())
      };

      const success = await saveFirebaseProject(projectToSave);
      if (success) {
        alert("تم حفظ المشروع بنجاح!");
        setNewProject({
          id: Date.now(),
          title: "",
          category: "documentary",
          imageUrl: "",
          desc: "",
          year: new Date().getFullYear(),
          isActive: true
        });
        setSelectedImage(null);
        setImagePreview("");
        const updatedProjects = await getFirebaseProjects();
        if (updatedProjects) {
          setProjects(updatedProjects);
        }
      } else {
        alert("فشل في حفظ المشروع");
      }
    } catch (error) {
      console.error("خطأ في حفظ المشروع:", error);
      alert("حدث خطأ أثناء حفظ المشروع");
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-900 text-white py-12">
        <div className="container mx-auto max-w-6xl">
          {/* إضافة زر تسجيل الخروج */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
            >
              تسجيل الخروج
            </button>
          </div>
          
          {/* تبويبات لوحة التحكم */}
          <div className="mb-8 border-b border-gray-700">
            <div className="flex overflow-x-auto scrollbar-thin pb-2">
              <button 
                onClick={() => setActiveTab("projects")}
                className={`px-6 py-3 flex items-center gap-2 mr-2 ${activeTab === "projects" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} rounded-t-lg transition-colors`}
              >
                <FaClipboard /> الأعمال
              </button>
              <button 
                onClick={() => setActiveTab("hero")}
                className={`px-6 py-3 flex items-center gap-2 mr-2 ${activeTab === "hero" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} rounded-t-lg transition-colors`}
              >
                <FaHome /> القسم الرئيسي
              </button>
              <button 
                onClick={() => setActiveTab("personal")}
                className={`px-6 py-3 flex items-center gap-2 mr-2 ${activeTab === "personal" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} rounded-t-lg transition-colors`}
              >
                <FaUser /> المعلومات الشخصية
              </button>
              <button 
                onClick={() => setActiveTab("experience")}
                className={`px-6 py-3 flex items-center gap-2 mr-2 ${activeTab === "experience" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} rounded-t-lg transition-colors`}
              >
                <FaBriefcase /> الخبرات
              </button>
              <button 
                onClick={() => setActiveTab("contact")}
                className={`px-6 py-3 flex items-center gap-2 mr-2 ${activeTab === "contact" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'} rounded-t-lg transition-colors`}
              >
                <FaPhone /> معلومات الاتصال
              </button>
            </div>
          </div>
          
          {/* قسم الاتصال */}
          {activeTab === "contact" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">إدارة معلومات الاتصال</h2>
              
              {/* عرض وسائل الاتصال الحالية */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">وسائل الاتصال الحالية</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {safeMap(contactInfo, (contact) => (
                    <div key={contact.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold">{contact.title}</h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingContact(contact)}
                            className="p-1 text-blue-400 hover:text-blue-300"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-300">{contact.subtitle || contact.value}</p>
                      <div className="mt-2">
                        <a 
                          href={contact.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          {contact.link}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* نموذج تعديل وسيلة اتصال */}
              {editingContact && (
                <div className="mb-8 bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">تعديل وسيلة اتصال</h3>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div>
                      <label className="block text-gray-300 mb-2">العنوان</label>
                      <input 
                        type="text" 
                        value={editingContact.title}
                        onChange={(e) => setEditingContact({...editingContact, title: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">القيمة</label>
                      <input 
                        type="text" 
                        value={editingContact.value || ''}
                        onChange={(e) => setEditingContact({...editingContact, value: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">العنوان الفرعي</label>
                      <input 
                        type="text" 
                        value={editingContact.subtitle || ''}
                        onChange={(e) => setEditingContact({...editingContact, subtitle: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">الرابط</label>
                      <input 
                        type="text" 
                        value={editingContact.link}
                        onChange={(e) => setEditingContact({...editingContact, link: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">الأيقونة</label>
                      <select 
                        value={editingContact.icon}
                        onChange={(e) => setEditingContact({...editingContact, icon: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="FaEnvelope">بريد إلكتروني</option>
                        <option value="FaPhone">هاتف</option>
                        <option value="FaWhatsapp">واتساب</option>
                        <option value="FaMapMarkerAlt">موقع</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">اللون</label>
                      <input 
                        type="text" 
                        value={editingContact.color || 'from-blue-600 to-blue-400'}
                        onChange={(e) => setEditingContact({...editingContact, color: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => {
                        setContactInfo(contactInfo.map(c => c.id === editingContact.id ? editingContact : c));
                        setEditingContact(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      <FaSave className="inline mr-1" /> حفظ التغييرات
                    </button>
                    <button 
                      onClick={() => setEditingContact(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      <FaTimes className="inline mr-1" /> إلغاء
                    </button>
                  </div>
                </div>
              )}
              
              {/* زر حفظ التغييرات */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={saveContactInfoToFirestore}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <FaSave /> حفظ التغييرات
                </button>
              </div>
            </div>
          )}
          
          {/* قسم المعلومات الشخصية */}
          {activeTab === "personal" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">إدارة المعلومات الشخصية</h2>
              
              {/* عرض المعلومات الشخصية الحالية */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">المعلومات الشخصية الحالية</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {safeMap(personalInfo, (item) => (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold">{item.title}</h4>
                        <button 
                          onClick={() => setEditingInfo(item)}
                          className="p-1 text-blue-400 hover:text-blue-300"
                        >
                          <FaEdit />
                        </button>
                      </div>
                      <p className="text-gray-300">{item.info}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* نموذج تعديل معلومة شخصية */}
              {editingInfo && (
                <div className="mb-8 bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">تعديل معلومة شخصية</h3>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div>
                      <label className="block text-gray-300 mb-2">العنوان</label>
                      <input 
                        type="text" 
                        value={editingInfo.title}
                        onChange={(e) => setEditingInfo({...editingInfo, title: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">المعلومة</label>
                      <input 
                        type="text" 
                        value={editingInfo.info}
                        onChange={(e) => setEditingInfo({...editingInfo, info: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">الأيقونة</label>
                      <select 
                        value={editingInfo.icon}
                        onChange={(e) => setEditingInfo({...editingInfo, icon: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="FaInfoCircle">معلومات</option>
                        <option value="FaCalendarAlt">تاريخ</option>
                        <option value="FaFlag">علم</option>
                        <option value="FaMapMarkerAlt">موقع</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => {
                        setPersonalInfo(personalInfo.map(info => info.id === editingInfo.id ? editingInfo : info));
                        setEditingInfo(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      <FaSave className="inline mr-1" /> حفظ التغييرات
                    </button>
                    <button 
                      onClick={() => setEditingInfo(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      <FaTimes className="inline mr-1" /> إلغاء
                    </button>
                  </div>
                </div>
              )}
              
              {/* زر حفظ التغييرات لقسم المعلومات الشخصية */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={async () => {
                    try {
                      console.log("بدء عملية حفظ المعلومات الشخصية...");
                      console.log("البيانات المراد حفظها:", personalInfo);
                      
                      const success = await saveFirebasePersonalInfo(personalInfo);
                      if (success) {
                        localStorage.setItem("personalInfo", JSON.stringify(personalInfo));
                        alert("تم حفظ المعلومات الشخصية بنجاح!");
                        console.log("تم حفظ المعلومات الشخصية بنجاح");
                      } else {
                        localStorage.setItem("personalInfo", JSON.stringify(personalInfo));
                        alert("فشل في حفظ المعلومات في Firestore، تم الحفظ محلياً فقط");
                        console.error("فشل في حفظ المعلومات الشخصية في Firestore");
                      }
                    } catch (error) {
                      console.error("خطأ في حفظ المعلومات الشخصية:", error);
                      try {
                        localStorage.setItem("personalInfo", JSON.stringify(personalInfo));
                        alert("حدث خطأ أثناء الحفظ في Firestore، تم الحفظ محلياً فقط");
                      } catch (localError) {
                        console.error("فشل الحفظ المحلي أيضاً:", localError);
                        alert("فشل الحفظ تماماً، يرجى المحاولة مرة أخرى");
                      }
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <FaSave /> حفظ التغييرات
                </button>
              </div>
            </div>
          )}
          
          {/* قسم الخبرات */}
          {activeTab === "experience" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">إدارة الخبرات المهنية</h2>
              
              {/* نموذج إضافة خبرة جديدة */}
              <div className="mb-8 bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">إضافة خبرة جديدة</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block text-gray-300 mb-2">العنوان الوظيفي</label>
                    <input 
                      type="text" 
                      value={isAddingExperience ? newExperience.title : ""}
                      onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">الشركة / المؤسسة</label>
                    <input 
                      type="text" 
                      value={isAddingExperience ? newExperience.company : ""}
                      onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">الفترة الزمنية</label>
                    <input 
                      type="text" 
                      value={isAddingExperience ? newExperience.period : ""}
                      onChange={(e) => setNewExperience({...newExperience, period: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">الأيقونة</label>
                    <select 
                      value={isAddingExperience ? newExperience.icon : "FaMicrophone"}
                      onChange={(e) => setNewExperience({...newExperience, icon: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="FaMicrophone">ميكروفون</option>
                      <option value="FaMusic">موسيقى</option>
                      <option value="FaHeadphones">سماعات</option>
                      <option value="FaBriefcase">حقيبة عمل</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-2">الوصف</label>
                    <textarea 
                      value={isAddingExperience ? newExperience.description : ""}
                      onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={() => {
                      if (!newExperience.title || !newExperience.company || !newExperience.period || !newExperience.description) {
                        alert("برجاء ملء جميع الحقول المطلوبة");
                        return;
                      }
                      
                      const experienceToAdd = {
                        ...newExperience,
                        id: Date.now()
                      };
                      
                      setExperiences([...experiences, experienceToAdd]);
                      setNewExperience({
                        id: Date.now(),
                        title: "",
                        company: "",
                        period: "",
                        description: "",
                        icon: "FaMicrophone"
                      });
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    <FaPlus className="inline mr-1" /> إضافة خبرة
                  </button>
                </div>
              </div>
              
              {/* عرض الخبرات الموجودة */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">الخبرات الحالية</h3>
                <div className="space-y-4">
                  {safeMap(experiences, (exp) => (
                    <div key={exp.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-bold">{exp.title}</h4>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setEditingExperience(exp)}
                            className="p-1 text-blue-400 hover:text-blue-300"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm("هل أنت متأكد من حذف هذه الخبرة؟")) {
                                setExperiences(experiences.filter(e => e.id !== exp.id));
                              }
                            }}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-1">{exp.company} | {exp.period}</div>
                      <p className="text-gray-300">{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* نموذج تعديل خبرة */}
              {editingExperience && (
                <div className="mb-8 bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">تعديل الخبرة</h3>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div>
                      <label className="block text-gray-300 mb-2">العنوان الوظيفي</label>
                      <input 
                        type="text" 
                        value={editingExperience.title}
                        onChange={(e) => setEditingExperience({...editingExperience, title: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">الشركة / المؤسسة</label>
                      <input 
                        type="text" 
                        value={editingExperience.company}
                        onChange={(e) => setEditingExperience({...editingExperience, company: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">الفترة الزمنية</label>
                      <input 
                        type="text" 
                        value={editingExperience.period}
                        onChange={(e) => setEditingExperience({...editingExperience, period: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">الأيقونة</label>
                      <select 
                        value={editingExperience.icon}
                        onChange={(e) => setEditingExperience({...editingExperience, icon: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="FaMicrophone">ميكروفون</option>
                        <option value="FaMusic">موسيقى</option>
                        <option value="FaHeadphones">سماعات</option>
                        <option value="FaBriefcase">حقيبة عمل</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-gray-300 mb-2">الوصف</label>
                      <textarea 
                        value={editingExperience.description}
                        onChange={(e) => setEditingExperience({...editingExperience, description: e.target.value})}
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button 
                      onClick={() => {
                        setExperiences(experiences.map(exp => exp.id === editingExperience.id ? editingExperience : exp));
                        setEditingExperience(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                    >
                      <FaSave className="inline mr-1" /> حفظ التغييرات
                    </button>
                    <button 
                      onClick={() => setEditingExperience(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                      <FaTimes className="inline mr-1" /> إلغاء
                    </button>
                  </div>
                </div>
              )}
              
              {/* زر حفظ التغييرات لقسم الخبرات */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={async () => {
                    try {
                      console.log("بدء عملية حفظ الخبرات المهنية...");
                      console.log("البيانات المراد حفظها:", experiences);
                      
                      const success = await saveFirebaseExperiences(experiences);
                      if (success) {
                        localStorage.setItem("experiences", JSON.stringify(experiences));
                        alert("تم حفظ الخبرات المهنية بنجاح!");
                        console.log("تم حفظ الخبرات المهنية بنجاح");
                      } else {
                        localStorage.setItem("experiences", JSON.stringify(experiences));
                        alert("فشل في حفظ الخبرات في Firestore، تم الحفظ محلياً فقط");
                        console.error("فشل في حفظ الخبرات في Firestore");
                      }
                    } catch (error) {
                      console.error("خطأ في حفظ الخبرات:", error);
                      try {
                        localStorage.setItem("experiences", JSON.stringify(experiences));
                        alert("حدث خطأ أثناء الحفظ في Firestore، تم الحفظ محلياً فقط");
                      } catch (localError) {
                        console.error("فشل الحفظ المحلي أيضاً:", localError);
                        alert("فشل الحفظ تماماً، يرجى المحاولة مرة أخرى");
                      }
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <FaSave /> حفظ التغييرات
                </button>
              </div>
            </div>
          )}
          
          {/* قسم المشاريع */}
          {activeTab === "projects" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">إدارة المشاريع</h2>
              
              {/* نموذج إضافة مشروع جديد */}
              <div className="mb-8 bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">إضافة مشروع جديد</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block text-gray-300 mb-2">عنوان المشروع</label>
                    <input 
                      type="text" 
                      value={newProject.title}
                      onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">التصنيف</label>
                    <select 
                      value={newProject.category}
                      onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    >
                      {categories.slice(1).map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">السنة</label>
                    <input 
                      type="number" 
                      value={newProject.year}
                      onChange={(e) => setNewProject({...newProject, year: parseInt(e.target.value)})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">صورة المشروع</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="project-image-upload"
                      />
                      <label 
                        htmlFor="project-image-upload"
                        className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-700"
                      >
                        <FaCamera /> اختيار صورة
                      </label>
                    </div>
                    {imagePreview && (
                      <div className="mt-2 relative h-32 w-full">
                        <Image
                          src={imagePreview}
                          alt="معاينة الصورة"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview("");
                            setNewProject(prev => ({...prev, imageUrl: ""}));
                          }}
                          className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-2">الوصف</label>
                    <textarea 
                      value={newProject.desc}
                      onChange={(e) => setNewProject({...newProject, desc: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button 
                    onClick={handleProjectSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    <FaPlus className="inline mr-1" /> إضافة مشروع
                  </button>
                </div>
              </div>
              
              {/* عرض المشاريع الحالية */}
              <div>
                <h3 className="text-xl font-semibold mb-4">المشاريع الحالية</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <div key={project.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="relative h-48 mb-4">
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            onClick={() => setEditingProject(project)}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleProjectDelete(project.id)}
                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                      <p className="text-gray-300 mb-2">{project.desc}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">{project.year}</span>
                        <span className="text-gray-400">{categories.find(c => c.id === project.category)?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* نافذة تعديل المشروع */}
              {editingProject && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold">تعديل المشروع</h3>
                      <button
                        onClick={() => setEditingProject(null)}
                        className="text-gray-400 hover:text-white"
                      >
                        <FaTimes size={24} />
                      </button>
                    </div>
                    
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <div>
                        <label className="block text-gray-300 mb-2">عنوان المشروع</label>
                        <input 
                          type="text" 
                          value={editingProject.title}
                          onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">التصنيف</label>
                        <select 
                          value={editingProject.category}
                          onChange={(e) => setEditingProject({...editingProject, category: e.target.value})}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        >
                          {categories.slice(1).map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">السنة</label>
                        <input 
                          type="number" 
                          value={editingProject.year}
                          onChange={(e) => setEditingProject({...editingProject, year: parseInt(e.target.value)})}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-2">صورة المشروع</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  // إنشاء اسم فريد للملف
                                  const timestamp = Date.now();
                                  const fileName = `${timestamp}-${file.name}`;
                                  const filePath = `/actual-images/${fileName}`;

                                  // حفظ الصورة في مجلد public/actual-images
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  formData.append('path', filePath);

                                  // رفع الملف باستخدام API route
                                  const response = await fetch('/api/upload', {
                                    method: 'POST',
                                    body: formData
                                  });

                                  if (!response.ok) {
                                    throw new Error('فشل في رفع الصورة');
                                  }

                                  // تحديث حالة المشروع برابط الصورة الجديد
                                  setEditingProject(prev => ({...prev!, imageUrl: filePath}));
                                } catch (error) {
                                  console.error("خطأ في رفع الصورة:", error);
                                  alert("حدث خطأ أثناء رفع الصورة");
                                }
                              }
                            }}
                            className="hidden"
                            id="edit-project-image-upload"
                          />
                          <label 
                            htmlFor="edit-project-image-upload"
                            className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none cursor-pointer flex items-center justify-center gap-2 hover:bg-gray-600"
                          >
                            <FaCamera /> تغيير الصورة
                          </label>
                        </div>
                        {editingProject.imageUrl && (
                          <div className="mt-2 relative h-32 w-full">
                            <Image
                              src={editingProject.imageUrl}
                              alt="معاينة الصورة"
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-gray-300 mb-2">الوصف</label>
                        <textarea 
                          value={editingProject.desc}
                          onChange={(e) => setEditingProject({...editingProject, desc: e.target.value})}
                          className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                          rows={3}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-4">
                      <button
                        onClick={() => setEditingProject(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleProjectUpdate}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                      >
                        حفظ التغييرات
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* زر حفظ التغييرات لقسم المشاريع */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={async () => {
                    try {
                      console.log("بدء عملية حفظ المشاريع...");
                      console.log("البيانات المراد حفظها:", projects);
                      
                      const success = await saveFirebaseProjects(projects);
                      if (success) {
                        localStorage.setItem("projects", JSON.stringify(projects));
                        alert("تم حفظ المشاريع بنجاح!");
                        console.log("تم حفظ المشاريع بنجاح");
                      } else {
                        localStorage.setItem("projects", JSON.stringify(projects));
                        alert("فشل في حفظ المشاريع في Firestore، تم الحفظ محلياً فقط");
                        console.error("فشل في حفظ المشاريع في Firestore");
                      }
                    } catch (error) {
                      console.error("خطأ في حفظ المشاريع:", error);
                      try {
                        localStorage.setItem("projects", JSON.stringify(projects));
                        alert("حدث خطأ أثناء الحفظ في Firestore، تم الحفظ محلياً فقط");
                      } catch (localError) {
                        console.error("فشل الحفظ المحلي أيضاً:", localError);
                        alert("فشل الحفظ تماماً، يرجى المحاولة مرة أخرى");
                      }
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <FaSave /> حفظ جميع المشاريع
                </button>
              </div>
            </div>
          )}
          
          {/* قسم معلومات الصفحة الرئيسية */}
          {activeTab === "hero" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">إدارة القسم الرئيسي</h2>
              
              <div className="mb-8 bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">معلومات القسم الرئيسي</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div>
                    <label className="block text-gray-300 mb-2">الاسم</label>
                    <input 
                      type="text" 
                      value={heroInfo.name}
                      onChange={(e) => setHeroInfo({...heroInfo, name: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">العنوان الوظيفي</label>
                    <input 
                      type="text" 
                      value={heroInfo.title}
                      onChange={(e) => setHeroInfo({...heroInfo, title: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-2">نبذة تعريفية</label>
                    <textarea 
                      value={heroInfo.bio}
                      onChange={(e) => setHeroInfo({...heroInfo, bio: e.target.value})}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-2">المهارات (افصل بينها بفاصلة أو اضغط Enter)</label>
                    <input 
                      type="text" 
                      value={safeJoin(heroInfo.skills)}
                      onChange={(e) => {
                        console.log("النص المدخل:", e.target.value);
                        // تقسيم النص باستخدام الفاصلة أو Enter
                        const skillsArray = e.target.value
                          .split(/[,\n]/)
                          .map(skill => skill.trim())
                          .filter(skill => skill.length > 0);
                        console.log("المصفوفة بعد التقسيم:", skillsArray);
                        setHeroInfo({...heroInfo, skills: skillsArray});
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const currentValue = e.currentTarget.value.trim();
                          if (currentValue) {
                            const newSkills = [...(heroInfo.skills || []), currentValue];
                            setHeroInfo({...heroInfo, skills: newSkills});
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                      className="w-full bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                    />
                    <div className="mt-2 text-sm text-gray-400">
                      مهارات المدخلة حالياً: {heroInfo.skills?.length || 0} مهارة
                      {heroInfo.skills && heroInfo.skills.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {heroInfo.skills.map((skill, i) => (
                            <span key={i} className="bg-blue-800/50 text-blue-200 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                              {skill}
                              <button 
                                onClick={() => {
                                  const newSkills = heroInfo.skills.filter((_, index) => index !== i);
                                  setHeroInfo({...heroInfo, skills: newSkills});
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <FaTimes className="text-xs" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* معاينة */}
              <div className="mb-8 bg-gray-700 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">معاينة</h3>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h1 className="text-3xl font-bold text-white mb-2">{heroInfo?.name || ''}</h1>
                  <h2 className="text-xl text-blue-400 mb-4">{heroInfo?.title || ''}</h2>
                  <p className="text-gray-300 mb-6">{heroInfo?.bio || ''}</p>
                  <div className="flex flex-wrap gap-2">
                    {safeMap(heroInfo?.skills, (skill, index) => (
                      <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* زر حفظ التغييرات لقسم القسم الرئيسي (Hero) */}
              <div className="mt-6 flex justify-center">
                <button 
                  onClick={async () => {
                    try {
                      console.log("بدء عملية حفظ معلومات القسم الرئيسي...");
                      
                      // التحقق من صحة البيانات قبل الحفظ
                      if (!heroInfo.name || !heroInfo.title || !heroInfo.bio || !heroInfo.skills) {
                        console.error("بيانات القسم الرئيسي غير مكتملة!");
                        alert("يرجى ملء جميع الحقول المطلوبة");
                        return;
                      }
                      
                      // التأكد من أن skills هي مصفوفة
                      if (!Array.isArray(heroInfo.skills)) {
                        console.error("حقل المهارات ليس مصفوفة!");
                        // محاولة تحويله إلى مصفوفة إذا كان نصًا
                        if (typeof heroInfo.skills === 'string') {
                          const skillsText = heroInfo.skills as string;
                          const skillsArray = skillsText.split(',').map(s => s.trim()).filter(Boolean);
                          console.log("تم تحويل النص إلى مصفوفة:", skillsArray);
                          const updatedHeroInfo = {...heroInfo, skills: skillsArray};
                          setHeroInfo(updatedHeroInfo);
                        } else {
                          alert("حدث خطأ في معالجة المهارات");
                          return;
                        }
                      }
                      
                      console.log("البيانات المراد حفظها:", heroInfo);
                      console.log("المهارات:", heroInfo.skills);
                      
                      // حفظ البيانات
                      const success = await saveFirebaseHeroInfo(heroInfo);
                      if (success) {
                        alert("تم حفظ معلومات القسم الرئيسي بنجاح!");
                        console.log("تم حفظ معلومات القسم الرئيسي بنجاح");
                        
                        // محاولة قراءة البيانات مباشرة بعد الحفظ للتأكد من نجاح العملية
                        setTimeout(async () => {
                          try {
                            const savedData = await getFirebaseHeroInfo();
                            console.log("البيانات المحفوظة في قاعدة البيانات:", savedData);
                          } catch (verifyError) {
                            console.error("خطأ في التحقق من البيانات المحفوظة:", verifyError);
                          }
                        }, 1000);
                      } else {
                        localStorage.setItem("heroInfo", JSON.stringify(heroInfo));
                        alert("فشل في حفظ المعلومات في Firestore، تم الحفظ محلياً فقط");
                        console.error("فشل في حفظ معلومات القسم الرئيسي في Firestore");
                      }
                    } catch (error) {
                      console.error("خطأ في حفظ معلومات القسم الرئيسي:", error);
                      try {
                        localStorage.setItem("heroInfo", JSON.stringify(heroInfo));
                        alert("حدث خطأ أثناء الحفظ في Firestore، تم الحفظ محلياً فقط");
                      } catch (localError) {
                        console.error("فشل الحفظ المحلي أيضاً:", localError);
                        alert("فشل الحفظ تماماً، يرجى المحاولة مرة أخرى");
                      }
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <FaSave /> حفظ التغييرات
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
};

export default AdminPage; 