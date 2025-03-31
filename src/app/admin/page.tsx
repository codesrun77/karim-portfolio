"use client";
import { useState, useEffect, useRef } from "react";
import AuthCheck from "./AuthCheck";
import { FaCamera, FaTrash, FaSave, FaPlus, FaTimes, FaUser, FaBriefcase, FaPhone, FaHome, FaClipboard, FaEnvelope, FaWhatsapp, FaEdit, FaMapMarkerAlt, FaProjectDiagram, FaFileAlt, FaPause, FaPlay, FaLink, FaGlobe, FaFacebook, FaInstagram, FaTwitter, FaTv, FaFilm, FaYoutube, FaAward, FaCertificate, FaHistory, FaMicrophone, FaHeadphones, FaChevronUp, FaChevronDown, FaList, FaInfoCircle, FaPalette, FaCheck, FaLinkedin, FaEye, FaEyeSlash, FaImage, FaVideo, FaLock, FaMinus, FaBars, FaUndo, FaArrowUp, FaArrowDown, FaBan, FaIdCard, FaDownload } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  DataService,
  getHeroInfo, saveHeroInfo,
  getPersonalInfo, savePersonalInfo,
  getExperiences, saveExperiences,
  getProjects, saveProjects,
  getContactInfo, saveContactInfo,
  getSocialLinks, saveSocialLinks,
  getCVFiles, saveCVFiles,
  getTimelineItems, saveTimelineItems,
  saveVideoInfo,
  getVideoInfo,
  getHeaderLinks,
  saveHeaderLinks,
  getCategories,
  saveCategories
} from "@/lib/firebase/data-service";
import { FiLogOut } from "react-icons/fi";
import { HeroInfo, PersonalInfo, Experience, Project, ContactInfo, SocialLink, CVInfo, TimelineItem, VideoInfo } from "@/types";
import { collection, getDocs, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { motion, AnimatePresence } from "framer-motion";

// استيراد دالة حفظ روابط الهيدر بإسم مختلف لتجنب التضارب
import { saveHeaderLinks as saveHeaderLinksToFirestore } from "@/lib/firebase/data-service";

// التأكد من أن المصفوفات غير فارغة وموجودة قبل استخدام map
const safeMap = <T, U>(array: T[] | undefined | null, callback: (item: T, index: number, array: T[]) => U): U[] => {
  return array && Array.isArray(array) ? array.map(callback) : [];
};

// تحسين معالجة الأخطاء عند استخدام join
const safeJoin = (array: any[] | undefined | null, separator: string = ", "): string => {
  if (!array || !Array.isArray(array)) {
    return "";
  }
  return array.join(separator);
};

// التأكد من السلامة عند عرض القسم الرئيسي
const safeSplitString = (str: string | undefined | null): string[] => {
  return str && typeof str === "string" ? str.split(",").map(s => s.trim()).filter(Boolean) : [];
};

// تعديل واجهات التمديد لتتناسب مع متطلبات لوحة التحكم
interface ProjectExt extends Project {
  id: string;
  // استخدام أسماء المواصفات كما هو متوقع: description و image بدلاً من desc و imageUrl
  description: string;
  image: string;
  category: string;
  year: number;
  isActive: boolean;
  link: string;
}

interface PersonalInfoExt extends PersonalInfo {
  content: string;
  // إضافة خاصية icon للعرض في لوحة التحكم
  icon: string;
  extra: string | null;
}

interface ExperienceExt extends Experience {
  // تحويل id إلى string
  id: string;
}

interface ContactInfoExt extends ContactInfo {
  value: string;
  content: string;
  // إضافة الخصائص المطلوبة
  icon: string;
  subtitle: string;
  color: string;
}

interface HeroInfoExt extends HeroInfo {
  id?: string;
  socialLinks: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    youtube: string;
    soundcloud: string;
    email: string;
  };
}

// تعديل تعريف التصنيفات لتكون أكثر تفصيلاً وتتناسب مع المشاريع
const categories = [
  { id: "all", name: "كل الأعمال" },
  { id: "قنوات تلفزيونية", name: "قنوات تلفزيونية" },
  { id: "أفلام", name: "أفلام" },
  { id: "مسلسلات", name: "مسلسلات" },
  { id: "برامج", name: "برامج" }
];

// قبل تعريف الصفحة، يمكن تعريف نوع البيانات للمشروع
interface ProjectType {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  link: string;
}

// مصفوفة بالألوان المتاحة للاختيار
const colorOptions = [
  { name: "أزرق", value: "bg-gradient-to-r from-blue-600 to-blue-400" },
  { name: "أخضر", value: "bg-gradient-to-r from-green-600 to-green-400" },
  { name: "أحمر", value: "bg-gradient-to-r from-red-600 to-red-400" },
  { name: "أرجواني", value: "bg-gradient-to-r from-purple-600 to-purple-400" },
  { name: "أصفر", value: "bg-gradient-to-r from-yellow-600 to-yellow-400" },
  { name: "وردي", value: "bg-gradient-to-r from-pink-600 to-pink-400" },
  { name: "برتقالي", value: "bg-gradient-to-r from-orange-600 to-orange-400" },
  { name: "تركواز", value: "bg-gradient-to-r from-teal-600 to-teal-400" },
  { name: "بنفسجي", value: "bg-gradient-to-r from-indigo-600 to-indigo-400" },
  { name: "رمادي", value: "bg-gradient-to-r from-gray-700 to-gray-500" },
  { name: "أزرق سماوي", value: "bg-gradient-to-r from-sky-600 to-sky-400" },
  { name: "أزرق غامق", value: "bg-gradient-to-r from-blue-800 to-blue-600" },
  { name: "أخضر غامق", value: "bg-gradient-to-r from-green-800 to-green-600" },
  { name: "أرجواني غامق", value: "bg-gradient-to-r from-purple-800 to-purple-600" },
  { name: "أزرق فاتح", value: "bg-blue-500" },
  { name: "أخضر فاتح", value: "bg-green-500" },
  { name: "أحمر فاتح", value: "bg-red-500" },
  { name: "أرجواني فاتح", value: "bg-purple-500" },
  { name: "برتقالي فاتح", value: "bg-orange-500" },
  { name: "أصفر فاتح", value: "bg-yellow-500" }
];

// في بداية الملف بعد الاستيرادات أضف دالة تحويل الرابط
// وظيفة تحويل روابط YouTube العادية إلى روابط embed
const convertYouTubeUrl = (url: string): string => {
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

// أضيف قبل تعريف الدالة AdminPage بعد الاستيرادات

// تعريف نوع HeaderLink
interface HeaderLink {
  name: string;
  url: string;
  isActive: boolean;
}

// إضافة مصفوفة المشاريع الافتراضية لاستخدامها في حالة فشل تحميل البيانات من Firebase
const defaultProjects = [
  {
    id: "project-1",
    title: "مشروع تلفزيوني",
    description: "مشروع تلفزيوني افتراضي للعرض في حالة عدم وجود بيانات",
    category: "قنوات تلفزيونية",
    image: "/images/default.jpg",
    year: 2023,
    link: ""
  },
  {
    id: "project-2",
    title: "فيلم وثائقي",
    description: "فيلم وثائقي افتراضي للعرض في حالة عدم وجود بيانات",
    category: "أفلام",
    image: "/images/default.jpg",
    year: 2023,
    link: ""
  }
];

const AdminPage = () => {
  // الحالة المتعلقة بمعلومات القسم الرئيسي
  const defaultHeroInfo: HeroInfoExt = {
    name: "",
    title: "",
    bio: "",
    skills: [],
    profileImage: "",
    showProfileImage: true,
    socialLinks: {
      whatsapp: "",
      instagram: "",
      facebook: "",
      youtube: "",
      soundcloud: "",
      email: ""
    }
  };
  const [heroInfo, setHeroInfo] = useState<HeroInfoExt>(defaultHeroInfo);
  // استخدام ProjectExt مع المفاتيح الصحيحة
  const [projects, setProjects] = useState<ProjectExt[]>([]);
  const [newProject, setNewProject] = useState<ProjectExt>({
    id: Date.now().toString(),
    title: "",
    category: "documentary",
    image: "/images/default.jpg",
    description: "",
    year: new Date().getFullYear(),
    isActive: true,
    link: ""
  });
  const [editingProject, setEditingProject] = useState<ProjectExt | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // أضيف هنا متغيرات حالة اللوجو
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [currentLogo, setCurrentLogo] = useState<string>("/favicon.webp");

  // تحديث defaultPersonalInfo لإزالة خاصية "info" واستبدالها بـ "content"
  const defaultPersonalInfo: PersonalInfoExt[] = [
    {
      id: "info",
      icon: "FaInfoCircle",
      title: "نبذة عني",
      content: "مهندس صوت خبرة أكثر من 10 سنوات في مجال هندسة الصوت والتوزيع الموسيقي",
      extra: null
    },
    {
      id: "birth",
      icon: "FaCalendarAlt",
      title: "تاريخ الميلاد",
      content: "12-9-1989",
      extra: null
    },
    {
      id: "nationality",
      icon: "FaFlag",
      title: "الجنسية",
      content: "مصري",
      extra: null
    },
    {
      id: "residence",
      icon: "FaMapMarkerAlt",
      title: "بلد الاقامة",
      content: "الامارات",
      extra: null
    }
  ];
  const [personalInfo, setPersonalInfo] = useState<PersonalInfoExt[]>([]);
  const [editingInfo, setEditingInfo] = useState<PersonalInfoExt | null>(null);

  const defaultExperiences: ExperienceExt[] = [
    {
      id: "1",
      title: "مهندس صوت رئيسي",
      company: "استوديوهات الصوت العربية",
      period: "2018 - الحالي",
      description: "إدارة جلسات التسجيل الصوتي للأفلام والمسلسلات، إنتاج المؤثرات الصوتية، معالجة الصوت النهائية للأعمال الفنية المختلفة.",
      icon: "FaMicrophone"
    }
    // ... يمكن إضافة المزيد
  ];
  const [experiences, setExperiences] = useState<ExperienceExt[]>([]);
  const [editingExperience, setEditingExperience] = useState<ExperienceExt | null>(null);
  const [newExperience, setNewExperience] = useState<ExperienceExt>({
    id: `experience-${Date.now()}`,
    title: "وظيفة جديدة",
    company: "اسم الشركة",
    period: "الفترة الزمنية",
    description: "وصف الوظيفة والمهام",
    icon: "FaBriefcase"
  });
  const [isAddingExperience, setIsAddingExperience] = useState(false);

  const defaultContactInfo: ContactInfoExt[] = [
    {
      id: `contact-${Date.now()}-1`,
      icon: "FaPhone",
      title: "الهاتف",
      value: "+20 123 456 789",
      content: "+20 123 456 789",
      subtitle: "متاح من 9 صباحًا حتى 5 مساءً",
      link: "tel:+20123456789",
      color: "bg-gradient-to-r from-blue-600 to-blue-400"
    }
  ];
  const [contactInfo, setContactInfo] = useState<ContactInfoExt[]>([]);
  const [editingContact, setEditingContact] = useState<ContactInfoExt | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContact, setNewContact] = useState<ContactInfoExt>({
    id: `contact-${Date.now()}`,
    icon: "FaEnvelope",
    title: "",
    value: "",
    link: "",
    color: "from-blue-600 to-blue-400",
    subtitle: "",
    content: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // إضافة متغير حالة لتتبع علامة التبويب النشطة  
  const [activeTab, setActiveTab] = useState("projects");
  const [projectsSubTab, setProjectsSubTab] = useState("projects");
  const [heroSubTab, setHeroSubTab] = useState("basic");
  const [timelineFilter, setTimelineFilter] = useState("all");

  // متغيرات حالة السيرة الذاتية
  const [cvFiles, setCVFiles] = useState<CVInfo[]>([]);
  const [isEditingCV, setIsEditingCV] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CVInfo | null>(null);
  const [cvFile, setCVFile] = useState<File | null>(null);
  const [cvFilePreview, setCVFilePreview] = useState<string>("");

  // متغيرات حالة روابط التواصل
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // متغيرات حالة التايم لاين
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isEditingTimelineItem, setIsEditingTimelineItem] = useState(false);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItem | null>(null);
  const [timelineCategory, setTimelineCategory] = useState<"all" | "tv" | "film" | "program">("all");

  // إضافة متغير حالة للعناصر المفتوحة في الأكورديون
  const [openAccordionItems, setOpenAccordionItems] = useState<{[key: string]: boolean}>({});

  // Toggle لعنصر الأكورديون
  const toggleAccordionItem = (itemId: string) => {
    setOpenAccordionItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // متغيرات حالة الفيديو التعريفي
  const [videoInfo, setVideoInfo] = useState<VideoInfo>({
    id: "video-1",
    title: "الفيديو التعريفي",
    description: "نبذة عن خبراتي ومهاراتي في مجال هندسة الصوت",
    videoUrl: "https://www.youtube.com/embed/yfZox-wm-Kg",
    thumbnailUrl: "/images/video-thumbnail.jpg",
    isActive: true,
    lastUpdate: new Date().toISOString()
  });

  // متغيرات حالة بطاقة التواصل
  const [vCardInfo, setVCardInfo] = useState({
    firstName: "Karim",
    lastName: "Al Sayed",
    title: "Professional Sound Engineer",
    phone: "+971 50 123 4567",
    email: "info@karimsound.com",
    address: "Dubai, United Arab Emirates",
    website: "https://karimsound.com"
  });

  // في جزء تعريف الحالات (states) أضف الحالات الخاصة بالهيدر
  const [headerLinks, setHeaderLinks] = useState<HeaderLink[]>([]);
  const [newHeaderLink, setNewHeaderLink] = useState({ name: "", url: "" });
  const [showHeaderEditor, setShowHeaderEditor] = useState(false);

  // أضف دالة لتحميل بيانات الهيدر (سنستخدم البيانات المحلية في هذه المرحلة)
  const loadHeaderLinks = () => {
    // سنستخدم القيم الافتراضية التي تم تعريفها مسبقًا
    console.log("تم تحميل بيانات الهيدر محليًا");
  };

  // دالة حفظ بيانات الهيدر (سنستخدم الحفظ المحلي في هذه المرحلة)
  const saveHeaderLinksToLocal = async () => {
    try {
      console.log("جاري محاولة حفظ روابط الهيدر...", headerLinks);
      const result = await saveHeaderLinks(headerLinks);
      
      if (result) {
        toast.success("تم حفظ بيانات الهيدر بنجاح");
        console.log("تم حفظ بيانات الهيدر بنجاح");
        alert("تم حفظ روابط القائمة بنجاح!");
      } else {
        toast.error("حدث خطأ أثناء حفظ بيانات الهيدر");
        console.error("فشل حفظ الهيدر: الدالة رجعت قيمة خاطئة");
        alert("فشل حفظ روابط القائمة!");
      }
      
      return result;
    } catch (error: unknown) {
      console.error("خطأ في حفظ بيانات الهيدر:", error);
      toast.error("حدث خطأ أثناء حفظ بيانات الهيدر");
      alert("فشل حفظ بيانات الهيدر: " + (error instanceof Error ? error.message : "خطأ غير معروف"));
      return false;
    }
  };

  // دالة إضافة رابط جديد للهيدر
  const handleAddHeaderLink = () => {
    if (newHeaderLink.name && newHeaderLink.url) {
      setHeaderLinks([...headerLinks, { ...newHeaderLink, isActive: true }]);
      setNewHeaderLink({ name: "", url: "" });
      toast.success("تمت إضافة الرابط بنجاح");
    } else {
      toast.error("يرجى إدخال اسم ورابط صحيحين");
    }
  };

  // دالة تغيير ترتيب الروابط في الهيدر
  const moveHeaderLink = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index > 0) {
      const newLinks = [...headerLinks];
      const temp = newLinks[index];
      newLinks[index] = newLinks[index - 1];
      newLinks[index - 1] = temp;
      setHeaderLinks(newLinks);
    } else if (direction === "down" && index < headerLinks.length - 1) {
      const newLinks = [...headerLinks];
      const temp = newLinks[index];
      newLinks[index] = newLinks[index + 1];
      newLinks[index + 1] = temp;
      setHeaderLinks(newLinks);
    }
  };

  // دالة حذف رابط من الهيدر
  const removeHeaderLink = (index: number) => {
    const newLinks = headerLinks.filter((_, i) => i !== index);
    setHeaderLinks(newLinks);
    toast.success("تم حذف الرابط بنجاح");
  };

  // دالة تغيير حالة التفعيل للرابط
  const toggleHeaderLinkActive = (index: number) => {
    const newLinks = [...headerLinks];
    newLinks[index].isActive = !newLinks[index].isActive;
    setHeaderLinks(newLinks);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadProjects();
      loadPersonalInfo();
      loadExperiences();
      loadContactInfo();
      loadHeroInfo();
      loadSocialLinks();
      loadCVFiles();
      loadTimelineItems();
      loadVideoInfo(); // إضافة تحميل بيانات الفيديو التعريفي
      loadHeaderLinksFromFirebase(); // إضافة تحميل روابط الهيدر
    }
  }, []);

  // دوال تحميل البيانات
  const loadProjects = async () => {
    try {
      console.log("جاري تحميل المشاريع...");
      try {
        const dbProjects = await getProjects();
        console.log("تم استلام المشاريع من Firebase:", dbProjects?.length || 0);
        
        if (dbProjects && dbProjects.length > 0) {
          const formattedProjects: ProjectExt[] = dbProjects.map((p: any) => ({
            id: p.id.toString(),
            title: p.title,
            description: p.description || "",
            image: p.image || "/images/default.jpg",
            category: p.category || "أخرى",
            year: typeof p.year === 'number' ? p.year : (p.year ? parseInt(p.year.toString()) : 2022),
            isActive: p.isActive !== false,
            link: p.link || ""
          }));
          console.log("استخدام البيانات من Firebase:", formattedProjects.length, "مشروع");
          setProjects(formattedProjects);
        } else {
          const defaultFormattedProjects = defaultProjects.map(p => ({
            id: p.id.toString(),
            title: p.title,
            category: p.category,
            description: p.description || "",
            image: "/images/default.jpg",
            year: typeof p.year === 'number' ? p.year : 2022,
            isActive: true,
            link: p.link || ""
          }));
          setProjects(defaultFormattedProjects);
        }
      } catch (error) {
        console.error("خطأ أثناء جلب المشاريع من Firebase:", error);
        setProjects([]);
      }
        } catch (error) {
          console.error("خطأ في تحميل المشاريع:", error);
      setProjects([]);
    }
  };

  const loadPersonalInfo = async () => {
    try {
      const data = await getPersonalInfo();
      if (data && data.length > 0) {
        const formattedPersonalInfo: PersonalInfoExt[] = data.map((item: any) => ({
          id: item.id,
          // استخدم خاصية icon مع توفير قيمة افتراضية
          icon: item.icon || "FaInfoCircle",
          title: item.title,
          // استخدام content بدلاً من info
          content: item.content || item.info || "",
          extra: item.extra || null
        }));
        setPersonalInfo(formattedPersonalInfo);
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
      const data = await getExperiences();
      if (data && data.length > 0) {
        const formattedExperiences: ExperienceExt[] = data.map(item => ({
          id: String(item.id),
          title: item.title,
          company: item.company,
          period: item.period,
          description: item.description,
          icon: item.icon || "FaMicrophone"
        }));
        setExperiences(formattedExperiences);
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
      const data = await getContactInfo();
      if (data && data.length > 0) {
        setContactInfo(data as ContactInfoExt[]);
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
      console.log("محاولة تحميل البيانات من خدمة البيانات الموحدة...");
      const data = await getHeroInfo();
      if (data) {
        console.log("✅ تم تحميل بيانات القسم الرئيسي بنجاح:", data);
        setHeroInfo(data as HeroInfoExt);
      } else {
        console.log("❌ لم يتم العثور على بيانات القسم الرئيسي");
        setHeroInfo({
          name: "",
          title: "",
          bio: "",
          skills: [],
          profileImage: "",
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
    } catch (error) {
      console.error("❌ خطأ في تحميل معلومات القسم الرئيسي:", error);
      setHeroInfo({
        name: "",
        title: "",
        bio: "",
        skills: [],
        profileImage: "",
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

  const loadSocialLinks = async () => {
    try {
      const data = await getSocialLinks();
      setSocialLinks(data);
    } catch (error) {
      console.error("خطأ في تحميل بيانات روابط التواصل:", error);
    }
  };

  const loadCVFiles = async () => {
    try {
      const data = await getCVFiles();
      setCVFiles(data);
    } catch (error) {
      console.error("خطأ في تحميل بيانات السيرة الذاتية:", error);
    }
  };

  const loadTimelineItems = async () => {
    try {
      console.log("⏳ بدء تحميل بيانات التايم لاين...");
      const items = await getTimelineItems();
      console.log("✅ تم تحميل بيانات التايم لاين:", items?.length || 0, "عنصر");
      console.log("نموذج من البيانات:", items?.slice(0, 2));
      
      // حل المشكلة: التأكد من تعيين التايم لاين حتى مع المصفوفة الفارغة
      setTimelineItems(items || []);
      
      // طباعة حالة التايم لاين بعد التعيين
      setTimeout(() => {
        console.log("📊 حالة التايم لاين بعد التعيين:", timelineItems?.length || 0, "عنصر");
      }, 100);
    } catch (error) {
      console.error("❌ خطأ في تحميل بيانات التايم لاين:", error);
      // حتى في حالة حدوث خطأ، نضع قائمة فارغة كحد أدنى
      setTimelineItems([]);
    }
  };

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

  const saveContactInfoToFirestore = async () => {
    try {
      console.log("بدء عملية حفظ معلومات الاتصال...");
      const success = await saveContactInfo(contactInfo);
      if (success) {
        alert("تم حفظ معلومات الاتصال بنجاح!");
        } else {
        alert("حدث خطأ أثناء حفظ معلومات الاتصال.");
      }
    } catch (error) {
      console.error("خطأ في حفظ معلومات الاتصال:", error);
      alert("حدث خطأ أثناء حفظ معلومات الاتصال.");
    }
  };

  // تحسين وظيفة تحميل الصور
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      console.log("------ بدء تحميل صورة جديدة ------");
      const file = e.target.files?.[0];
      if (!file) {
        console.log("لم يتم اختيار أي ملف");
        return;
      }
      
      // فحص نوع الملف للتأكد من أنه صورة
      if (!file.type.startsWith("image/")) {
        alert("يرجى اختيار ملف صورة صحيح (jpg, png, webp, etc)");
        console.error("نوع الملف غير مدعوم:", file.type);
        return;
      }
      
      // فحص حجم الملف (الحد: 5 ميجابايت)
      const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5MB
      if (file.size > FILE_SIZE_LIMIT) {
        alert("حجم الصورة كبير جدًا. الحد الأقصى هو 5 ميجابايت");
        console.error("حجم الملف كبير جدًا:", (file.size / (1024 * 1024)).toFixed(2) + "MB");
        return;
      }
      
      console.log("تم اختيار ملف صورة صحيح:", file.name, "بحجم", (file.size / 1024).toFixed(2) + "KB");
      setSelectedImage(file);
      
      // قراءة الملف كـ Data URL (base64)
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        console.log("بدء قراءة الصورة...");
      };
      
      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            throw new Error("فشل في قراءة الصورة");
          }
          
          const base64String = event.target.result as string;
          console.log("تم تحويل الصورة إلى base64 بنجاح، حجم البيانات:", (base64String.length / 1024).toFixed(2) + "KB");
          
          // حفظ الصورة في الحالة
          setImagePreview(base64String);
          console.log("تم تحديث معاينة الصورة بنجاح");
        } catch (readError) {
          console.error("خطأ أثناء معالجة الصورة:", readError);
          alert("حدث خطأ أثناء معالجة الصورة. حاول مرة أخرى.");
        }
      };
      
      reader.onerror = () => {
        console.error("خطأ أثناء قراءة ملف الصورة");
        alert("فشل في قراءة ملف الصورة. يرجى المحاولة مرة أخرى.");
      };
      
      reader.onloadend = () => {
        console.log("انتهت عملية قراءة الصورة");
      };
      
      console.log("بدء عملية قراءة الملف...");
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("خطأ غير متوقع أثناء تحميل الصورة:", error);
      alert("حدث خطأ غير متوقع أثناء تحميل الصورة. يرجى المحاولة مرة أخرى.");
    }
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) {
      toast.error("يرجى إدخال عنوان للمشروع");
      return;
    }

    try {
      setLoading(true);
      // إظهار مؤشر تحميل مباشرة
      toast.loading("جاري حفظ المشروع...", { id: 'projectSaving' });
      
      // إنشاء كائن المشروع الجديد
      const projectToSave: ProjectExt = {
      ...newProject,
        image: imagePreview || newProject.image || "/images/default.jpg",
        id: `project-${Date.now()}`,
        description: newProject.description || ""
      };
      
      // إضافة المشروع الجديد إلى المشاريع الحالية
      const updatedProjects = [...projects, projectToSave];
      
      // تحديث الحالة أولاً
      setProjects(updatedProjects);
      
      // حفظ المشاريع في قاعدة البيانات مع الانتظار للحصول على النتيجة
      const saveResult = await saveProjects(updatedProjects);
      
      if (saveResult) {
        toast.success("تم حفظ المشروع بنجاح!", { id: 'projectSaving' });
      } else {
        toast.error("حدث خطأ أثناء حفظ المشروع", { id: 'projectSaving' });
      }
      
      // إعادة تعيين حقول المشروع الجديد
    setNewProject({
        id: Date.now().toString(),
      title: "",
        category: "documentary",
        image: "/images/default.jpg",
        description: "",
        year: new Date().getFullYear(),
        isActive: true,
        link: ""
      });
      
      // إعادة تعيين حالة الصورة المختارة
      setSelectedImage(null);
      setImagePreview("");
      
    } catch (error) {
      console.error("خطأ في حفظ المشروع:", error);
      toast.error("حدث خطأ غير متوقع أثناء الحفظ", { id: 'projectSaving' });
    } finally {
      setLoading(false);
    }
  };

  const handleProjectUpdate = async () => {
    if (!editingProject) {
      console.error("لا يوجد مشروع للتحديث");
      return;
    }

    try {
      setLoading(true);
      // إظهار مؤشر تحميل مباشرة
      toast.loading("جاري تحديث المشروع...", { id: 'projectUpdating' });
      
      // استخدام الصورة المختارة مباشرة أو الصورة الحالية
      const projectToUpdate = {
        ...editingProject,
        image: imagePreview || editingProject.image || "/images/default.jpg"
      };
      
      // تحديث المشاريع في قائمة المشاريع
      const updatedProjects = projects.map(project => {
        if (project.id === projectToUpdate.id) {
          return projectToUpdate;
        }
        return project;
      });
      
      // تحديث الحالة أولاً
      setProjects(updatedProjects);
      
      // حفظ المشاريع في قاعدة البيانات مع الانتظار للحصول على النتيجة
      const saveResult = await saveProjects(updatedProjects);
      
      if (saveResult) {
        toast.success("تم تحديث المشروع بنجاح!", { id: 'projectUpdating' });
      } else {
        toast.error("حدث خطأ أثناء تحديث المشروع", { id: 'projectUpdating' });
      }
      
      // إغلاق واجهة التحرير فوراً
      setEditingProject(null);
      setSelectedImage(null);
      setImagePreview("");
      
    } catch (error) {
      console.error("خطأ في تحديث المشروع:", error);
      toast.error("حدث خطأ غير متوقع أثناء التحديث", { id: 'projectUpdating' });
    } finally {
      setLoading(false);
    }
  };

  // تحديث دالة حفظ المشاريع مع تسجيل أفضل
  const saveProjects = async (projectsData: ProjectExt[]): Promise<boolean> => {
    console.log("------------- بدء عملية حفظ المشاريع -------------");
    console.log("عدد المشاريع:", projectsData.length);
    console.log("المشاريع:", JSON.stringify(projectsData.map(p => ({ id: p.id, title: p.title }))));
    
    try {
      // التحقق من الاتصال بالإنترنت
      if (!navigator.onLine) {
        console.warn("أنت غير متصل بالإنترنت، لا يمكن حفظ البيانات");
        alert("أنت غير متصل بالإنترنت، لا يمكن حفظ البيانات");
        return false;
      }
      
      // محاولة الحفظ في Firebase
      let successFlag = false;
      
      // التأكد من وجود قاعدة البيانات
      if (!db) {
        console.error("قاعدة البيانات غير متاحة");
        alert("قاعدة البيانات غير متاحة");
        return false;
      }
      
      console.log("جاري الحفظ في المسار الرئيسي: siteData/projects...");
      
      try {
        // تحويل المشاريع للتأكد من عدم وجود بيانات غير صالحة
        const cleanProjects = projectsData.map(project => ({
          id: project.id,
          title: project.title || "",
          description: project.description || "",
          image: project.image || "/placeholder.jpg",
          category: project.category || "أخرى",
          year: project.year || new Date().getFullYear(),
          isActive: typeof project.isActive === 'boolean' ? project.isActive : true,
          link: project.link || ""
        }));
        
        console.log("المشاريع المنظفة:", JSON.stringify(cleanProjects.map(p => ({ id: p.id, title: p.title }))));
        
        // المسار الرئيسي: siteData/projects
        const docRef = doc(db, "siteData", "projects");
        console.log("جاري الحفظ إلى:", docRef.path);
        
        await setDoc(docRef, { items: cleanProjects });
        console.log("✅ تم حفظ المشاريع في المسار الرئيسي: siteData/projects");
        successFlag = true;
        
        // محاولة الحفظ في مسارات إضافية للتأكد
        try {
          // حفظ في المسار public_data/projects
          const docRef2 = doc(db, "public_data", "projects");
          await setDoc(docRef2, { items: cleanProjects });
          console.log("✅ تم الحفظ أيضاً في مسار إضافي: public_data/projects");
        } catch (backupError) {
          console.warn("⚠️ لم يتم الحفظ في المسار الإضافي:", backupError);
        }
        
        return true;
      } catch (error) {
        console.error("❌ خطأ في حفظ المشاريع في المسار الرئيسي:", error);
        
        if (error.code === "permission-denied") {
          alert("خطأ في الصلاحيات: ليس لديك صلاحية الكتابة في هذا المسار");
          console.error("خطأ في الصلاحيات Firebase. يجب التأكد من قواعد الأمان في لوحة تحكم Firebase.");
        }
        
        // تجربة المسار البديل الأول
        try {
          console.log("محاولة الحفظ في المسار البديل الأول...");
          const docRef = doc(db, "public_data", "projects");
          await setDoc(docRef, { items: projectsData });
          console.log("✅ تم حفظ المشاريع في المسار البديل: public_data/projects");
          successFlag = true;
          return true;
        } catch (error2) {
          console.error("❌ خطأ في حفظ المشاريع في المسار البديل الأول:", error2);
          
          // تجربة المسار البديل الثاني
          try {
            console.log("محاولة الحفظ في المسار البديل الثاني...");
            const docRef = doc(db, "projects", "all");
            await setDoc(docRef, { items: projectsData });
            console.log("✅ تم حفظ المشاريع في المسار البديل الثاني: projects/all");
            successFlag = true;
            return true;
          } catch (error3) {
            console.error("❌ خطأ في حفظ المشاريع في جميع المسارات:", error3);
            alert(`فشل في حفظ المشاريع في جميع المسارات: ${error3.message}`);
            return false;
          }
        }
      }
    } catch (error) {
      console.error("❌ خطأ عام في عملية حفظ المشاريع:", error);
      alert(`خطأ عام في عملية حفظ المشاريع: ${error.message}`);
      return false;
    } finally {
      console.log("------------- انتهت عملية حفظ المشاريع -------------");
    }
  };

  // في جزء ProjectExt، نضيف طريقة للحصول على الصورة مع التعامل مع الأخطاء
  const handleImageError = (project: ProjectExt) => {
    console.log(`استخدام صورة بديلة للمشروع: ${project.title}`);
    
    // تعديل مسار الصورة مباشرة في العنصر وتحديث الحالة (state)
    setProjects(prevProjects => prevProjects.map(p => {
      if (p.id === project.id) {
        return { ...p, image: "/images/default.jpg" };
      }
      return p;
    }));
    
    // هذا يعيد مسار الصورة البديلة للاستخدام أيضاً في الواجهة
    return "/images/default.jpg";
  };

  const handleCVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCVFile(file);
      
      // التحقق من نوع الملف (PDF فقط)
      if (file.type !== 'application/pdf') {
        alert("يرجى اختيار ملف PDF فقط");
        setCVFile(null);
        return;
      }
      
      // إنشاء معاينة للملف (للعرض فقط)
      setCVFilePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCV = () => {
    setSelectedCV({
      id: `cv-${Date.now()}`,
      title: "",
      fileUrl: "",
      description: "",
      version: "1.0",
      downloadCount: 0,
      lastUpdate: new Date().toISOString(),
      isActive: true
    });
    setCVFile(null);
    setCVFilePreview("");
    setIsEditingCV(true);
  };

  const handleEditCV = (cv: CVInfo) => {
    setSelectedCV(cv);
    setCVFile(null);
    setCVFilePreview("");
    setIsEditingCV(true);
  };

  const handleSaveCV = async () => {
    if (!selectedCV) return;
    
    try {
      let fileUrl = selectedCV.fileUrl;
      
      // إذا تم اختيار ملف جديد
      if (cvFile) {
        // تحميل الملف إلى المجلد العام
        const fileName = `CV_${selectedCV.id}_${Date.now()}.pdf`;
        const filePath = `/cv/${fileName}`;
        
        // تحميل الملف باستخدام API route
        const formData = new FormData();
        formData.append('file', cvFile);
        formData.append('path', filePath);
        
        console.log("جاري تحميل ملف السيرة الذاتية...", fileName);
        
        try {
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error(`فشل في رفع ملف السيرة الذاتية: ${await response.text()}`);
          }
          
          console.log("تم رفع ملف السيرة الذاتية بنجاح");
          // تحديث مسار الملف
          fileUrl = filePath;
        } catch (uploadError) {
          console.error("خطأ في تحميل ملف السيرة الذاتية:", uploadError);
          alert("حدث خطأ أثناء تحميل ملف السيرة الذاتية، سيتم الاحتفاظ بالمسار القديم");
          // الاحتفاظ بالمسار السابق في حالة فشل التحميل
        }
        
        // تعيين التاريخ الجديد للتحديث في جميع الحالات
        selectedCV.lastUpdate = new Date().toISOString();
      }
      
      // تحديث البيانات
      const updatedCV = {
        ...selectedCV,
        fileUrl
      };
      
      // تحديث المصفوفة
      let updatedCVFiles;
      const index = cvFiles.findIndex(cv => cv.id === selectedCV.id);
      
      if (index === -1) {
        // إضافة عنصر جديد
        updatedCVFiles = [...cvFiles, updatedCV];
      } else {
        // تحديث عنصر موجود
        updatedCVFiles = [...cvFiles];
        updatedCVFiles[index] = updatedCV;
      }
      
      // حفظ في قاعدة البيانات
      const success = await saveCVFiles(updatedCVFiles);
      
      if (success) {
        setCVFiles(updatedCVFiles);
        setIsEditingCV(false);
        setSelectedCV(null);
        alert("تم حفظ بيانات السيرة الذاتية بنجاح");
      } else {
        alert("حدث خطأ أثناء حفظ بيانات السيرة الذاتية");
      }
    } catch (error) {
      console.error("خطأ في حفظ بيانات السيرة الذاتية:", error);
      alert("حدث خطأ أثناء حفظ بيانات السيرة الذاتية");
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه السيرة الذاتية؟")) return;
    
    try {
      const updatedCVFiles = cvFiles.filter(cv => cv.id !== cvId);
      const success = await saveCVFiles(updatedCVFiles);
      
      if (success) {
        setCVFiles(updatedCVFiles);
        alert("تم حذف السيرة الذاتية بنجاح");
      } else {
        alert("حدث خطأ أثناء حذف السيرة الذاتية");
      }
    } catch (error) {
      console.error("خطأ في حذف السيرة الذاتية:", error);
      alert("حدث خطأ أثناء حذف السيرة الذاتية");
    }
  };

  const handleToggleCV = async (cvId: string) => {
    try {
      const index = cvFiles.findIndex(cv => cv.id === cvId);
      if (index === -1) return;
      
      const updatedCV = {
        ...cvFiles[index],
        isActive: !cvFiles[index].isActive
      };
      
      const updatedCVFiles = [...cvFiles];
      updatedCVFiles[index] = updatedCV;
      
      const success = await saveCVFiles(updatedCVFiles);
      
      if (success) {
        setCVFiles(updatedCVFiles);
      } else {
        alert("حدث خطأ أثناء تحديث حالة السيرة الذاتية");
      }
    } catch (error) {
      console.error("خطأ في تحديث حالة السيرة الذاتية:", error);
      alert("حدث خطأ أثناء تحديث حالة السيرة الذاتية");
    }
  };

  // إضافة أو تعديل بيانات الارتباط الاجتماعي
  const handleAddOrEditSocialLink = () => {
    const newSocialLink: SocialLink = {
      id: `social-${Date.now()}`,
      icon: "FaLink",
      url: "",
      label: "رابط تواصل جديد"
    };
    setSocialLinks([...socialLinks, newSocialLink]);
  };

  // إضافة عنصر تايم لاين جديد
  const handleAddTimelineItem = () => {
    // إذا كانت القيمة "all"، نستخدم "tv" كقيمة افتراضية
    const actualCategory = timelineCategory === "all" ? "tv" : timelineCategory;
    
    setSelectedTimelineItem({
      id: `timeline-${Date.now()}`,
      year: new Date().getFullYear().toString(),
      title: "",
      company: "",
      description: "",
      category: actualCategory,
      icon: "FaBriefcase",
      isActive: true
    });
    setIsEditingTimelineItem(true);
  };

  // تعديل عنصر تايم لاين موجود
  const handleEditTimelineItem = (item: TimelineItem) => {
    setSelectedTimelineItem(item);
    setTimelineCategory(item.category);
    setIsEditingTimelineItem(true);
  };

  // حفظ بيانات عنصر التايم لاين
  const handleSaveTimelineItem = async () => {
    if (!selectedTimelineItem) return;
    
    try {
      console.log("👉 بدء حفظ عنصر التايم لاين...", selectedTimelineItem);
      
      // التحقق من البيانات المطلوبة
      if (!selectedTimelineItem.title.trim()) {
        alert("يرجى إدخال العنوان الوظيفي");
        return;
      }
      
      if (!selectedTimelineItem.company.trim()) {
        alert("يرجى إدخال اسم الجهة");
        return;
      }
      
      // تحديث المصفوفة
      let updatedTimelineItems;
      const index = timelineItems.findIndex(item => item.id === selectedTimelineItem.id);
      
      if (index === -1) {
        // إضافة عنصر جديد
        console.log("🆕 إضافة عنصر جديد");
        updatedTimelineItems = [...timelineItems, selectedTimelineItem];
      } else {
        // تحديث عنصر موجود
        console.log("✏️ تحديث عنصر موجود");
        updatedTimelineItems = [...timelineItems];
        updatedTimelineItems[index] = selectedTimelineItem;
      }
      
      // تحديث الحالة أولاً
      console.log("📊 تحديث حالة المكون مع البيانات الجديدة - عدد العناصر:", updatedTimelineItems.length);
      setTimelineItems(updatedTimelineItems);
      
      // حفظ في قاعدة البيانات
      console.log("💾 محاولة حفظ البيانات في قاعدة البيانات...");
      const success = await saveTimelineItems(updatedTimelineItems);
      
      if (success) {
        console.log("✅ تم حفظ البيانات بنجاح في قاعدة البيانات");
        // تحميل البيانات مرة أخرى للتأكد من تحديثها
        // loadTimelineItems(); // تم التعليق لمنع إعادة تحميل البيانات وفقدان التغييرات المحلية
        
        setIsEditingTimelineItem(false);
        setSelectedTimelineItem(null);
        alert("تم حفظ بيانات التايم لاين بنجاح");
      } else {
        console.error("❌ فشل في حفظ البيانات في قاعدة البيانات");
        alert("حدث خطأ أثناء حفظ بيانات التايم لاين");
      }
    } catch (error) {
      console.error("❌ خطأ في حفظ بيانات التايم لاين:", error);
      alert("حدث خطأ أثناء حفظ بيانات التايم لاين");
    }
  };

  // حذف عنصر تايم لاين
  const handleDeleteTimelineItem = async (itemId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العنصر؟")) return;
    
    try {
      const updatedTimelineItems = timelineItems.filter(item => item.id !== itemId);
      const success = await saveTimelineItems(updatedTimelineItems);
      
      if (success) {
        setTimelineItems(updatedTimelineItems);
        alert("تم حذف العنصر بنجاح");
      } else {
        alert("حدث خطأ أثناء حذف العنصر");
      }
    } catch (error) {
      console.error("خطأ في حذف عنصر التايم لاين:", error);
      alert("حدث خطأ أثناء حذف العنصر");
    }
  };

  // تفعيل/تعطيل عنصر تايم لاين
  const handleToggleTimelineItem = async (itemId: string) => {
    try {
      const index = timelineItems.findIndex(item => item.id === itemId);
      if (index === -1) return;
      
      const updatedItem = {
        ...timelineItems[index],
        isActive: !timelineItems[index].isActive
      };
      
      const updatedTimelineItems = [...timelineItems];
      updatedTimelineItems[index] = updatedItem;
      
      const success = await saveTimelineItems(updatedTimelineItems);
      
      if (success) {
        setTimelineItems(updatedTimelineItems);
      } else {
        alert("حدث خطأ أثناء تحديث حالة العنصر");
      }
    } catch (error) {
      console.error("خطأ في تحديث حالة عنصر التايم لاين:", error);
      alert("حدث خطأ أثناء تحديث حالة العنصر");
    }
  };

  // الحصول على عنوان التصنيف
  const getTimelineCategoryLabel = (category: 'all' | 'tv' | 'film' | 'program') => {
    switch (category) {
      case 'all': return 'كل الأعمال';
      case 'tv': return 'قنوات وإذاعات';
      case 'film': return 'أفلام ومسلسلات';
      case 'program': return 'برامج ووثائقيات';
      default: return 'أخرى';
    }
  };

  // الحصول على لون التصنيف
  const getTimelineCategoryColor = (category: 'all' | 'tv' | 'film' | 'program') => {
    switch (category) {
      case 'all': return 'bg-purple-800';
      case 'tv': return 'bg-blue-500';
      case 'film': return 'bg-purple-500';
      case 'program': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // الحصول على أيقونة التايم لاين
  const getTimelineIcon = (iconName: string) => {
    switch (iconName) {
      case 'FaBriefcase': return <FaBriefcase />;
      case 'FaMicrophone': return <FaMicrophone />;
      case 'FaHeadphones': return <FaHeadphones />;
      case 'FaTv': return <FaTv />;
      case 'FaFilm': return <FaFilm />;
      case 'FaYoutube': return <FaYoutube />;
      case 'FaAward': return <FaAward />;
      case 'FaCertificate': return <FaCertificate />;
      default: return <FaBriefcase />;
    }
  };

  // تحديث الرابط تلقائيًا بناءً على نوع الأيقونة وقيمة الاتصال
  const generateLinkFromIcon = (icon: string, value: string): string => {
    // تنظيف القيمة من المسافات والأحرف الخاصة
    const cleanValue = value.trim().replace(/\s+/g, "");
    
    switch (icon) {
      case "FaPhone":
        return `tel:${cleanValue}`;
      case "FaEnvelope":
        return `mailto:${cleanValue}`;
      case "FaWhatsapp":
        // إزالة علامة + من بداية الرقم إذا وجدت
        const whatsappNumber = cleanValue.startsWith("+") ? cleanValue.substring(1) : cleanValue;
        return `https://wa.me/${whatsappNumber}`;
      case "FaMapMarkerAlt":
        return `https://maps.google.com/?q=${encodeURIComponent(value)}`;
      default:
        return value;
    }
  };

  // تعريف أنواع الاتصال المتاحة
  const contactTypes = [
    { 
      id: "phone", 
      name: "هاتف", 
      icon: "FaPhone",
      valueLabel: "رقم الهاتف", 
      valuePlaceholder: "+20 1234567890", 
      buttonText: "اتصل الآن",
      isPhoneInput: true
    },
    { 
      id: "whatsapp", 
      name: "واتساب", 
      icon: "FaWhatsapp", 
      valueLabel: "رقم الواتساب", 
      valuePlaceholder: "+20 1234567890",
      buttonText: "تواصل عبر واتساب",
      isPhoneInput: true
    },
    { 
      id: "email", 
      name: "بريد إلكتروني", 
      icon: "FaEnvelope", 
      valueLabel: "البريد الإلكتروني", 
      valuePlaceholder: "example@domain.com",
      buttonText: "راسلنا" 
    },
    { 
      id: "address", 
      name: "عنوان", 
      icon: "FaMapMarkerAlt", 
      valueLabel: "العنوان", 
      valuePlaceholder: "القاهرة، مصر",
      buttonText: "الاتجاهات" 
    },
    { 
      id: "facebook", 
      name: "فيسبوك", 
      icon: "FaFacebook", 
      valueLabel: "اسم المستخدم أو الرابط", 
      valuePlaceholder: "username أو https://facebook.com/...",
      buttonText: "فيسبوك" 
    },
    { 
      id: "instagram", 
      name: "انستجرام", 
      icon: "FaInstagram", 
      valueLabel: "اسم المستخدم أو الرابط", 
      valuePlaceholder: "username أو https://instagram.com/...",
      buttonText: "انستجرام" 
    },
    { 
      id: "twitter", 
      name: "تويتر (X)", 
      icon: "FaTwitter", 
      valueLabel: "اسم المستخدم أو الرابط", 
      valuePlaceholder: "username أو https://twitter.com/...",
      buttonText: "تويتر" 
    },
    { 
      id: "youtube", 
      name: "يوتيوب", 
      icon: "FaYoutube", 
      valueLabel: "معرّف القناة أو الرابط", 
      valuePlaceholder: "@channelname أو https://youtube.com/...",
      buttonText: "يوتيوب" 
    },
    { 
      id: "linkedin", 
      name: "لينكد إن", 
      icon: "FaLinkedin", 
      valueLabel: "اسم المستخدم أو الرابط", 
      valuePlaceholder: "username أو https://linkedin.com/in/...",
      buttonText: "لينكد إن" 
    },
    { 
      id: "website", 
      name: "موقع إلكتروني", 
      icon: "FaGlobe", 
      valueLabel: "الرابط", 
      valuePlaceholder: "https://example.com",
      buttonText: "زيارة الموقع" 
    }
  ];

  // الحصول على نوع الاتصال من المعرف
  const getContactTypeById = (id: string) => {
    return contactTypes.find(type => type.id === id) || contactTypes[0];
  };

  // تحديث النص في حقل الرابط بناءً على القيمة ونوع الاتصال المختار
  const getExpectedLink = (contactTypeId: string, value: string): string => {
    if (!value || value.trim() === "") return "";
    
    // تنظيف القيمة من المسافات
    const cleanValue = value.trim();
    
    switch (contactTypeId) {
      case "phone":
        // إزالة المسافات من رقم الهاتف
        return `tel:${cleanValue.replace(/\s+/g, "")}`;
      
      case "whatsapp":
        // إزالة المسافات والعلامة + من بداية الرقم
        const whatsappNumber = cleanValue.replace(/\s+/g, "");
        return `https://wa.me/${whatsappNumber.startsWith("+") ? whatsappNumber.substring(1) : whatsappNumber}`;
      
      case "email":
        return `mailto:${cleanValue}`;
      
      case "address":
        return `https://maps.google.com/?q=${encodeURIComponent(cleanValue)}`;
      
      case "facebook":
        // التحقق مما إذا كان الإدخال رابطًا كاملاً
        if (cleanValue.startsWith("http")) {
          return cleanValue;
        }
        // إذا كان اسم المستخدم فقط
        return `https://facebook.com/${cleanValue}`;
      
      case "instagram":
        if (cleanValue.startsWith("http")) {
          return cleanValue;
        }
        return `https://instagram.com/${cleanValue}`;
      
      case "twitter":
        if (cleanValue.startsWith("http")) {
          return cleanValue;
        }
        return `https://twitter.com/${cleanValue}`;
      
      case "youtube":
        if (cleanValue.startsWith("http")) {
          return cleanValue;
        }
        return `https://youtube.com/${cleanValue}`;
      
      case "linkedin":
        if (cleanValue.startsWith("http")) {
          return cleanValue;
        }
        return `https://linkedin.com/in/${cleanValue}`;
      
      case "website":
        // إضافة https:// إذا لم يكن موجودًا
        if (!cleanValue.startsWith("http")) {
          return `https://${cleanValue}`;
        }
        return cleanValue;
      
      default:
        if (contactTypeId.startsWith("Fa")) {
          // للتوافق مع النمط القديم حيث كان contactTypeId هو اسم الأيقونة
          switch (contactTypeId) {
            case "FaPhone":
              return `tel:${cleanValue.replace(/\s+/g, "")}`;
            case "FaEnvelope":
              return `mailto:${cleanValue}`;
            case "FaWhatsapp":
              const oldWhatsappNumber = cleanValue.replace(/\s+/g, "");
              return `https://wa.me/${oldWhatsappNumber.startsWith("+") ? oldWhatsappNumber.substring(1) : oldWhatsappNumber}`;
            case "FaMapMarkerAlt":
              return `https://maps.google.com/?q=${encodeURIComponent(cleanValue)}`;
            default:
              return cleanValue;
          }
        }
        return cleanValue;
    }
  };

  // إضافة دالة تحميل بيانات الفيديو التعريفي
  const loadVideoInfo = async () => {
    try {
      console.log("جاري تحميل بيانات الفيديو التعريفي...");
      try {
        // استخدام getVideoInfo من lib/firebase/data-service بدلاً من DataService.getVideoInfo 
        const data = await getVideoInfo();
        if (data) {
          setVideoInfo(data);
          console.log("تم تحميل بيانات الفيديو التعريفي");
        }
      } catch (err) {
        console.error("حدث خطأ أثناء تحميل بيانات الفيديو التعريفي:", err);
      }
    } catch (err) {
      console.error("خطأ خارجي في تحميل بيانات الفيديو التعريفي:", err);
    }
  };

  // إضافة دالة حفظ بيانات الفيديو التعريفي
  const handleSaveVideoInfo = async () => {
    try {
      setLoading(true);
      
      console.log("بيانات الفيديو المراد حفظها:", videoInfo);
      console.log("حالة تفعيل الفيديو:", videoInfo.isActive);
      
      // تأكد من تحديث تاريخ التعديل قبل الحفظ
      const updatedVideoInfo = {
        ...videoInfo,
        lastUpdate: new Date().toISOString()
      };
      
      // استخدام saveVideoInfo من lib/firebase/data-service
      const success = await saveVideoInfo(updatedVideoInfo);
      
      if (success) {
        console.log("تم حفظ بيانات الفيديو بنجاح!");
        alert("تم حفظ بيانات الفيديو بنجاح");
      } else {
        console.error("فشل حفظ بيانات الفيديو");
        alert("حدث خطأ أثناء حفظ بيانات الفيديو");
      }
    } catch (err) {
      console.error("حدث خطأ أثناء حفظ بيانات الفيديو التعريفي:", err);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  // دالة لتحميل الصور إلى التخزين المحلي
  const uploadProfileImage = async (file: File, position = { x: 0, y: 0, scale: 1 }): Promise<string> => {
    try {
      console.log("بدء تحميل الصورة...", file.name, file.type, file.size);
      
      // التحقق من أن الملف هو صورة
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast.error('يرجى اختيار ملف صورة فقط (PNG، JPG، GIF، WEBP)');
        return '';
      }

      // تحقق من حجم الملف (أقل من 2 ميجابايت)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 2 ميجابايت');
        return '';
      }

      setLoading(true);
      
      try {
        // إنشاء اسم فريد للملف
        const fileName = `profile_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        console.log("اسم الملف بعد التنظيف:", fileName);
        
        // تحميل الملف إلى تخزين فايربيس
        const storage = getStorage();
        const storageRef = ref(storage, `profile_images/${fileName}`);
        
        console.log("جاري تحميل الملف إلى Firebase Storage...");
        // تحميل الملف
        const snapshot = await uploadBytes(storageRef, file);
        console.log("تم تحميل الملف بنجاح:", snapshot);
        
        // الحصول على رابط التحميل
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log("تم الحصول على رابط التحميل:", downloadURL);
        
        // تخزين معلومات موضع الصورة وتكبيرها
        const imagePosition = {
          url: downloadURL,
          position
        };
        
        // تخزين معلومات الصورة في Local Storage للاستخدام المستقبلي
        localStorage.setItem('profileImagePosition', JSON.stringify(imagePosition));
        
        toast.success('تم رفع الصورة بنجاح');
        return downloadURL;
      } catch (uploadError: any) {
        console.error('خطأ في تحميل الصورة إلى Firebase Storage:', uploadError);
        toast.error(`خطأ في تحميل الصورة: ${uploadError.message || 'خطأ غير معروف'}`);
        return '';
      }
    } catch (error: any) {
      console.error('خطأ في معالجة الصورة:', error);
      toast.error(`خطأ في معالجة الصورة: ${error.message || 'خطأ غير معروف'}`);
      return '';
    } finally {
      setLoading(false);
    }
  };

  // في التطبيق الرئيسي بعد useEffect للتحميل، أضف هذا الاستدعاء
  useEffect(() => {
    // تحميل بيانات الهيدر
    const loadHeaderData = async () => {
      try {
        const data = await getHeaderLinks();
        if (data && data.length > 0) {
          setHeaderLinks(data);
          console.log("تم تحميل بيانات الهيدر بنجاح:", data.length);
        } else {
          console.log("لم يتم العثور على بيانات للهيدر، استخدام البيانات الافتراضية");
        }
      } catch (error) {
        console.error("خطأ في تحميل بيانات الهيدر:", error);
      }
    };
    
    loadHeaderData();
    
    // ... existing loading calls ...
  }, []);

  // تحديث دالة حفظ بيانات الهيدر لاستخدام Firebase
  const saveHeaderLinksToFirebase = async (): Promise<boolean> => {
    try {
      console.log("جاري محاولة حفظ روابط الهيدر...", headerLinks);
      
      // استدعاء دالة saveHeaderLinks المستوردة من data-service
      const result = await saveHeaderLinks(headerLinks);
      
      if (result) {
        toast.success("تم حفظ بيانات الهيدر بنجاح");
        console.log("تم حفظ بيانات الهيدر بنجاح");
        
        // عرض رسالة نجاح كإشعار نظام
        alert("تم حفظ روابط القائمة بنجاح!");
      } else {
        toast.error("حدث خطأ أثناء حفظ بيانات الهيدر");
        console.error("فشل حفظ الهيدر: الدالة رجعت قيمة خاطئة");
        
        // عرض رسالة الخطأ كإشعار نظام
        alert("فشل حفظ روابط القائمة!");
      }
      
      return result;
    } catch (error: unknown) {
      console.error("خطأ في حفظ بيانات الهيدر:", error);
      toast.error("حدث خطأ أثناء حفظ بيانات الهيدر");
      
      // عرض رسالة الخطأ المفصلة كإشعار نظام
      alert("فشل حفظ بيانات الهيدر: " + (error instanceof Error ? error.message : "خطأ غير معروف"));
      return false;
    }
  };

  // تحميل مسار اللوجو من التخزين المحلي
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLogo = localStorage.getItem('siteLogo');
      if (savedLogo) {
        setCurrentLogo(savedLogo);
        setLogoPreview(savedLogo);
      }
    }
  }, []);

  // معالجة تغيير ملف اللوجو
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      
      // التحقق من نوع الملف (يجب أن يكون صورة)
      if (!file.type.match('image.*')) {
        alert("يرجى اختيار ملف صورة فقط");
        setLogoFile(null);
        return;
      }
      
      // إنشاء معاينة للصورة
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  // حفظ اللوجو في التخزين المحلي
  const handleSaveLogo = async () => {
    try {
      if (logoFile) {
        // هنا يمكننا رفع الصورة للخادم إذا أردنا (اختياري)
        // ولكن سنكتفي بحفظها في التخزين المحلي حالياً
        
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          
          // حفظ الصورة في التخزين المحلي
          localStorage.setItem('siteLogo', base64String);
          setCurrentLogo(base64String);
          
          alert("تم حفظ اللوجو بنجاح في التخزين المحلي");
        };
        
        reader.readAsDataURL(logoFile);
      } else if (logoPreview) {
        // إذا كان هناك معاينة ولكن ليس ملف جديد، فهذا يعني أننا نريد استخدام اللوجو الحالي
        localStorage.setItem('siteLogo', logoPreview);
        setCurrentLogo(logoPreview);
        alert("تم حفظ اللوجو بنجاح في التخزين المحلي");
      }
    } catch (error) {
      console.error("خطأ في حفظ اللوجو:", error);
      alert("حدث خطأ أثناء حفظ اللوجو");
    }
  };

  // إعادة تعيين اللوجو إلى القيمة الافتراضية
  const handleResetLogo = () => {
    const defaultLogo = "/favicon.webp";
    localStorage.setItem('siteLogo', defaultLogo);
    setCurrentLogo(defaultLogo);
    setLogoPreview(defaultLogo);
    setLogoFile(null);
    alert("تم إعادة تعيين اللوجو إلى القيمة الافتراضية");
  };

  // تحديث دالة loadHeaderLinks لتحميل البيانات من Firebase
  const loadHeaderLinksFromFirebase = async () => {
    try {
      console.log("جاري تحميل روابط الهيدر من Firebase...");
      const links = await getHeaderLinks();
      console.log("تم تحميل روابط الهيدر بنجاح:", links);
      setHeaderLinks(links);
    } catch (error) {
      console.error("خطأ في تحميل روابط الهيدر:", error);
      // استخدام القيم الافتراضية في حالة الخطأ
      setHeaderLinks([
        { name: "الرئيسية", url: "/", isActive: true },
        { name: "الفيديو", url: "/#video", isActive: true },
        { name: "نبذة عني", url: "/#info", isActive: true },
        { name: "الخبرات", url: "/#experience", isActive: true },
        { name: "المسار الزمني", url: "/#timeline", isActive: true },
        { name: "أعمالي", url: "/#works", isActive: true },
        { name: "تواصل معي", url: "/#contact", isActive: true },
        { name: "لوحة التحكم", url: "/admin", isActive: true }
      ]);
    }
  };

  // متغيرات حالة الفوتر
  const [footerData, setFooterData] = useState({
    bio: "خريج المعهد العالي للسينما - قسم هندسة صوت، أعمل في مجال الصوت والإعلام منذ عام 2012.",
    quickLinks: [
      { name: "الرئيسية", url: "/" },
      { name: "نبذة عني", url: "/#info" },
      { name: "أعمالي", url: "/#works" },
      { name: "تواصل معي", url: "/#contact" }
    ],
    contactInfo: {
      whatsapp: "+971 521007811",
      email: "info@karimelsayed.ae",
      location: "دبي، الإمارات العربية المتحدة"
    },
    socialLinks: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      youtube: "https://youtube.com"
    },
    copyright: "كريم السيد. جميع الحقوق محفوظة.",
    developer: "Codesrun"
  });

  // إضافة متغيرات الحالة للتبويبات الفرعية
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "كل الأعمال", isActive: true, order: 0 },
    { id: "قنوات-تلفزيونية", name: "قنوات تلفزيونية", isActive: true, order: 1 },
    { id: "أفلام", name: "أفلام", isActive: true, order: 2 },
    { id: "مسلسلات", name: "مسلسلات", isActive: true, order: 3 },
    { id: "برامج", name: "برامج", isActive: true, order: 4 }
  ]);
  const [newCategory, setNewCategory] = useState<Category>({ id: '', name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Add this loadCategories function
  const loadCategories = async () => {
    try {
      console.log("جاري تحميل التصنيفات...");
      const data = await getCategories();
      if (data && data.length > 0) {
        console.log(`تم تحميل ${data.length} تصنيف`);
        setCategories(data);
      } else {
        console.log("لم يتم العثور على تصنيفات، استخدام البيانات الافتراضية");
        setCategories([
          { id: "all", name: "كل الأعمال", isActive: true, order: 0 },
          { id: "قنوات-تلفزيونية", name: "قنوات تلفزيونية", isActive: true, order: 1 },
          { id: "أفلام", name: "أفلام", isActive: true, order: 2 },
          { id: "مسلسلات", name: "مسلسلات", isActive: true, order: 3 },
          { id: "برامج", name: "برامج", isActive: true, order: 4 }
        ]);
      }
    } catch (error) {
      console.error("خطأ في تحميل التصنيفات:", error);
      setCategories([
        { id: "all", name: "كل الأعمال", isActive: true, order: 0 },
        { id: "قنوات-تلفزيونية", name: "قنوات تلفزيونية", isActive: true, order: 1 },
        { id: "أفلام", name: "أفلام", isActive: true, order: 2 },
        { id: "مسلسلات", name: "مسلسلات", isActive: true, order: 3 },
        { id: "برامج", name: "برامج", isActive: true, order: 4 }
      ]);
    }
  };

  // تأكد من استدعاء دالة تحميل التصنيفات
  useEffect(() => {
    if (typeof window !== "undefined") {
      loadProjects();
      loadPersonalInfo();
      loadExperiences();
      loadContactInfo();
      loadHeroInfo();
      loadSocialLinks();
      loadCVFiles();
      loadTimelineItems();
      loadVideoInfo();
      loadHeaderLinksFromFirebase();
      loadCategories(); // أضفنا هذه الدالة
    }
  }, []);

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-900 text-white py-12">
        <div className="container mx-auto max-w-6xl">
          {message && (
            <div className={`mb-4 p-4 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}
        <div className="mb-8">
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        </div>

          {/* أزرار التنقل بين الأقسام */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
          <button 
                onClick={() => setActiveTab("hero")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "hero" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
                <FaHome className="inline ml-2" /> القسم الرئيسي
          </button>
              <button 
                onClick={() => setActiveTab("video")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "video" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaTv className="inline ml-2" /> الفيديو التعريفي
              </button>
              <button 
                onClick={() => setActiveTab("projects")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "projects" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaBriefcase className="inline ml-2" /> المشاريع
              </button>
              <button 
                onClick={() => setActiveTab("personal")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "personal" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaUser className="inline ml-2" /> المعلومات الشخصية
              </button>
              <button 
                onClick={() => setActiveTab("experience")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "experience" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaClipboard className="inline ml-2" /> الخبرات
              </button>
              <button 
                onClick={() => setActiveTab("contact")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "contact" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaPhone className="inline ml-2" /> معلومات الاتصال
              </button>
              <button 
                onClick={() => setActiveTab("cv")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "cv" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaFileAlt className="inline ml-2" /> السيرة الذاتية
              </button>
              <button 
                onClick={() => setActiveTab("timeline")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "timeline" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaHistory className="inline ml-2" /> التايم لاين
              </button>
              <button 
                onClick={() => setActiveTab("header")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "header" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaList className="inline ml-2" /> الهيدر
              </button>
              <button 
                onClick={() => setActiveTab("logo")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "logo" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaImage className="inline ml-2" /> اللوجو
              </button>
              <button 
                onClick={() => setActiveTab("footer")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "footer" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaList className="inline ml-2" /> الفوتر
              </button>
              <button 
                onClick={() => setActiveTab("vcard")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "vcard" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaIdCard className="inline ml-2" /> بطاقة التواصل
              </button>
            </div>
            </div>

          {/* قسم القسم الرئيسي */}
          {activeTab === "hero" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">معلومات القسم الرئيسي</h2>
              
              <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
              <div>
                      <label className="block text-sm font-medium text-gray-300">الاسم</label>
                  <input 
                    type="text" 
                        value={heroInfo.name} 
                        onChange={(e) => setHeroInfo({...heroInfo, name: e.target.value})}
                        className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">العنوان</label>
                  <input 
                    type="text" 
                        value={heroInfo.title} 
                        onChange={(e) => setHeroInfo({...heroInfo, title: e.target.value})}
                        className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
              </div>

              <div>
                    <label className="block text-sm font-medium text-gray-300">الوصف</label>
                  <textarea 
                      value={heroInfo.bio} 
                      onChange={(e) => setHeroInfo({...heroInfo, bio: e.target.value})}
                      rows={4}
                      className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">المهارات</label>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {heroInfo.skills.map((skill, index) => (
                        <div key={index} className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-md">
                          <span>{skill}</span>
              <button 
                onClick={() => {
                              const updatedSkills = [...heroInfo.skills];
                              updatedSkills.splice(index, 1);
                              setHeroInfo({...heroInfo, skills: updatedSkills});
                            }}
                            className="ml-2 text-white hover:text-red-200"
                          >
                            &times;
              </button>
                        </div>
                      ))}
            </div>

                    <div className="flex">
                  <input 
                    type="text" 
                        id="skillInput"
                        placeholder="أضف مهارة جديدة" 
                        className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-r-none rounded-l-md text-white"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            const skillValue = input.value.trim();
                            if (skillValue && !heroInfo.skills.includes(skillValue)) {
                              setHeroInfo({
                                ...heroInfo, 
                                skills: [...heroInfo.skills, skillValue]
                              });
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById('skillInput') as HTMLInputElement;
                          const skillValue = input.value.trim();
                          if (skillValue && !heroInfo.skills.includes(skillValue)) {
                            setHeroInfo({
                              ...heroInfo, 
                              skills: [...heroInfo.skills, skillValue]
                            });
                            input.value = '';
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-l-none rounded-r-md"
                      >
                        إضافة
                      </button>
                    </div>
                  </div>
                </div>

                {/* قسم رفع الصورة الشخصية */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-300">الصورة الشخصية</label>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-400 ml-2">
                        {heroInfo.showProfileImage ? 'إظهار الصورة' : 'إخفاء الصورة'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={heroInfo.showProfileImage}
                          onChange={(e) => setHeroInfo({...heroInfo, showProfileImage: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                  
                  {heroInfo.showProfileImage && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <div className="flex text-sm text-gray-400">
                              <label htmlFor="profile-image-upload" className="relative cursor-pointer bg-gray-700 rounded-md font-medium text-blue-400 hover:text-blue-300 px-3 py-2">
                                <span>اختر صورة</span>
                                <input 
                                  id="profile-image-upload" 
                                  name="profile-image" 
                                  type="file" 
                                  accept="image/jpeg,image/png,image/gif,image/webp"
                                  className="sr-only"
                                  onChange={async (e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      // معاينة الصورة قبل التحميل
                                      const file = e.target.files[0];
                                      const reader = new FileReader();
                                      
                                      reader.onload = async (event) => {
                                        try {
                                          // عرض معاينة الصورة أولاً
                                          if (event.target?.result) {
                                            // تعيين الصورة مؤقتاً للمعاينة
                                            setHeroInfo({...heroInfo, profileImage: event.target.result as string});
                                            toast.loading('جاري تحميل الصورة إلى السيرفر...');
                                            
                                            // نقوم بتحميل الصورة مع الوضع الافتراضي أولًا
                                            const imageUrl = await uploadProfileImage(file);
                                            if (imageUrl) {
                                              // تحديث الرابط بعد التحميل
                                              setHeroInfo({...heroInfo, profileImage: imageUrl});
                                              toast.success('تم تحميل الصورة بنجاح');
                                            } else {
                                              // إذا فشل التحميل، أزل المعاينة
                                              setHeroInfo({...heroInfo, profileImage: ''});
                                            }
                                          }
                                        } catch (error) {
                                          console.error('خطأ في معالجة الصورة:', error);
                                          toast.error('حدث خطأ أثناء معالجة الصورة');
                                          setHeroInfo({...heroInfo, profileImage: ''});
                                        }
                                      };
                                      
                                      reader.onerror = () => {
                                        toast.error('حدث خطأ أثناء قراءة الصورة');
                                      };
                                      
                                      // قراءة الصورة كـ Data URL
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </label>
                              <p className="pr-1 pt-2">أو اسحب وأفلت</p>
                            </div>
                            <p className="text-xs text-gray-400">
                              PNG، JPG، GIF، WEBP حتى 2 ميجابايت
                            </p>
                          </div>
                        </div>
                        
                        {heroInfo.profileImage && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between">
                              <label className="block text-sm font-medium text-gray-300">رابط الصورة الحالية:</label>
                              <button
                                onClick={() => setHeroInfo({...heroInfo, profileImage: ''})}
                                className="px-2 py-1 bg-red-500 text-xs text-white rounded hover:bg-red-600"
                                type="button"
                              >
                                حذف الصورة
                              </button>
                            </div>
                  <input 
                    type="text" 
                              value={heroInfo.profileImage || ''} 
                              readOnly
                              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
                            />
                          </div>
                        )}
                </div>

                      {heroInfo.profileImage && (
                        <div className="flex flex-col items-center">
                          <p className="text-sm text-gray-300 mb-2">ضبط الصورة:</p>
                          <ImageCropper
                            imageUrl={heroInfo.profileImage}
                            onCropChange={(position) => {
                              // تحديث معلومات موضع الصورة في Local Storage
                              const imagePosition = {
                                url: heroInfo.profileImage,
                                position
                              };
                              localStorage.setItem('profileImagePosition', JSON.stringify(imagePosition));
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!heroInfo.showProfileImage && (
                    <div className="bg-gray-700 p-4 rounded-md border border-gray-600">
                      <div className="flex items-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>تم تعطيل عرض الصورة الشخصية. قم بتفعيل الخيار أعلاه لإظهار خيارات تحميل الصورة.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-center mt-6">
                  <button 
                    onClick={async () => {
                      try {
                        // حفظ معلومات القسم الرئيسي
                        const success = await saveHeroInfo(heroInfo);
                        
                        if (success) {
                          // حفظ موضع الصورة في التخزين المحلي بشكل دائم
                          try {
                            const savedData = localStorage.getItem('profileImagePosition');
                            if (savedData) {
                              const savedPosition = JSON.parse(savedData);
                              if (savedPosition.url === heroInfo.profileImage) {
                                // حفظ الوضع بشكل دائم في مخزن محلي آخر
                                localStorage.setItem('savedProfileImagePosition', JSON.stringify({
                                  url: heroInfo.profileImage,
                                  position: savedPosition.position,
                                  timestamp: new Date().toISOString()
                                }));
                                console.log("تم حفظ موضع الصورة بشكل دائم.");
                              }
                            }
                          } catch (positionError) {
                            console.error("خطأ في حفظ موضع الصورة:", positionError);
                          }
                          
                          alert("تم حفظ معلومات القسم الرئيسي بنجاح!");
                        } else {
                          alert("حدث خطأ أثناء حفظ المعلومات.");
                        }
                      } catch (error) {
                        console.error("خطأ في حفظ معلومات القسم الرئيسي:", error);
                        alert("حدث خطأ أثناء حفظ المعلومات.");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                  >
                    <FaSave /> حفظ التغييرات
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* قسم المشاريع */}
          {activeTab === "projects" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">إدارة المشاريع</h2>
              
              {/* إضافة تبويبات فرعية للمشاريع والتصنيفات */}
              <div className="mb-6">
                <div className="flex border-b border-gray-700">
                  <button
                    onClick={() => setProjectsSubTab("projects")}
                    className={`px-4 py-2 ${projectsSubTab === "projects" 
                      ? "border-b-2 border-blue-500 text-blue-500" 
                      : "text-gray-400 hover:text-white"}`}
                  >
                    المشاريع
                  </button>
                  <button
                    onClick={() => setProjectsSubTab("categories")}
                    className={`px-4 py-2 ${projectsSubTab === "categories" 
                      ? "border-b-2 border-blue-500 text-blue-500" 
                      : "text-gray-400 hover:text-white"}`}
                  >
                    التصنيفات
                  </button>
                </div>
              </div>

              {projectsSubTab === "projects" && (
                <>
                  {/* قسم المشاريع الحالي */}
              {/* إضافة أدوات البحث والتصفية */}
              <div className="mb-6 bg-gray-700 p-4 rounded-lg">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">البحث في المشاريع</label>
                    <input 
                      type="text" 
                      placeholder="اكتب اسم المشروع أو وصفه..."
                      onChange={(e) => {
                        // إضافة وظيفة البحث في المشاريع
                        const searchTerm = e.target.value.toLowerCase();
                        if (!searchTerm) {
                          loadProjects(); // إعادة تحميل جميع المشاريع إذا كان البحث فارغاً
                          return;
                        }
                        
                        const filteredProjects = projects.filter(project => 
                          project.title.toLowerCase().includes(searchTerm) || 
                          project.description.toLowerCase().includes(searchTerm)
                        );
                        setProjects(filteredProjects);
                      }}
                      className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">تصفية حسب الفئة</label>
                  <select 
                      onChange={(e) => {
                        // إضافة وظيفة التصفية حسب الفئة
                        const category = e.target.value;
                        if (category === "all") {
                          loadProjects(); // إعادة تحميل جميع المشاريع إذا كانت التصفية "الكل"
                          return;
                        }
                        
                        const filteredProjects = projects.filter(project => 
                          project.category.toLowerCase() === category.toLowerCase()
                        );
                        setProjects(filteredProjects);
                      }}
                      className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                    >
                      <option value="all">جميع الفئات</option>
                      {Array.from(new Set(projects.map(p => p.category))).map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  </div>
                </div>

                {/* زر إضافة مشروع جديد */}
                <button 
                  onClick={() => {
                    // إنشاء مشروع جديد فارغ وفتح نافذة التعديل
                    const newProject: ProjectExt = {
                      id: `new-${Date.now()}`,
                      title: "مشروع جديد",
                      description: "وصف المشروع",
                      image: "/images/default.jpg",
                      category: "عام",
                      year: new Date().getFullYear(),
                      isActive: true,
                      link: ""
                    };
                    setEditingProject(newProject);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaPlus /> إضافة مشروع جديد
                </button>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-medium mb-4">المشاريع الحالية ({projects.length})</h3>
                
                {projects.length === 0 ? (
                  <div className="bg-gray-700 p-6 rounded-lg text-center">
                    <p className="text-gray-300 mb-4">لا توجد مشاريع مضافة حاليًا</p>
                    <button 
                      onClick={() => {
                        const defaultProject: ProjectExt = {
                          id: `new-${Date.now()}`,
                          title: "مشروع جديد",
                          description: "وصف المشروع",
                          image: "/images/default.jpg",
                          category: "عام",
                          year: new Date().getFullYear(),
                          isActive: true,
                          link: ""
                        };
                        setEditingProject(defaultProject);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      <FaPlus className="inline ml-2" /> إضافة مشروع جديد
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                      <div key={project.id} className={`bg-gray-700 rounded-lg overflow-hidden ${!project.isActive ? 'opacity-60' : ''}`}>
                        <div className="h-40 bg-gray-600 overflow-hidden relative">
                          <div className="w-full h-full">
                            {project.image && (
                              <img
                                alt={project.title}
                      className="object-cover w-full h-full"
                                src={project.image}
                                onError={(e) => {
                                  // في حالة الخطأ، نستخدم صورة بديلة
                                  console.log(`خطأ في تحميل صورة المشروع: ${project.title}`);
                                  e.currentTarget.src = "/images/default.jpg";
                                }}
                              />
                            )}
                            {!project.image && (
                              <div className="h-40 bg-gray-600 flex items-center justify-center text-white">
                                لا توجد صورة
                  </div>
                )}
              </div>
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button 
                              onClick={() => {
                                const updatedProject = {...project, isActive: !project.isActive};
                                const updatedProjects = projects.map(p => 
                                  p.id === project.id ? updatedProject : p
                                );
                                setProjects(updatedProjects);
                                saveProjects(updatedProjects);
                              }}
                              className={`p-2 rounded-full ${project.isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                              title={project.isActive ? 'إلغاء تفعيل المشروع' : 'تفعيل المشروع'}
                            >
                              {project.isActive ? '✓' : '×'}
                            </button>
            </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-lg font-semibold mb-2">{project.title}</h4>
                          <p className="text-gray-300 text-sm line-clamp-2 mb-2">{project.description}</p>
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>{project.category}</span>
                            <span>{project.year}</span>
                          </div>
                          <div className="mt-4 flex justify-between">
              <button 
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف المشروع "${project.title}"؟`)) {
                                  const updatedProjects = projects.filter(p => p.id !== project.id);
                                  setProjects(updatedProjects);
                                  saveProjects(updatedProjects).then(success => {
                                    if (success) {
                                      alert("تم حذف المشروع بنجاح");
                                    } else {
                                      alert("فشل في حذف المشروع. تأكد من اتصالك بالإنترنت");
                                    }
                                  });
                                }
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg flex items-center gap-1"
                              title="حذف المشروع"
                            >
                              <FaTrash />
                            </button>
                            <button 
                              onClick={() => setEditingProject(project)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg flex items-center gap-1"
                              title="تعديل المشروع"
                            >
                              <FaEdit /> تعديل
              </button>
            </div>
                        </div>
                      </div>
                    ))}
          </div>
        )}
                  </div>

        {editingProject && (
                  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                          {editingProject.id.startsWith('new-') ? 'إضافة مشروع جديد' : 'تعديل المشروع'}
                        </h3>
                        <button onClick={() => {
                  setEditingProject(null);
                          setSelectedImage(null);
                          setImagePreview("");
                        }} className="text-gray-400 hover:text-white">
                          <FaTimes />
              </button>
            </div>

                      <div className="space-y-4">
              <div>
                          <label className="block text-sm font-medium text-gray-300">العنوان</label>
                  <input 
                    type="text" 
                    value={editingProject.title}
                            onChange={(e) => setEditingProject({...editingProject, title: e.target.value})}
                            className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
              </div>

              <div>
                          <label className="block text-sm font-medium text-gray-300">الوصف</label>
                  <textarea 
                            value={editingProject.description} 
                            onChange={(e) => setEditingProject({...editingProject, description: e.target.value})}
                            rows={4}
                            className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>

                        {/* حقل رفع الصورة مع معاينة محسنة */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">صورة المشروع</label>
                          
                          <div className="flex flex-col md:flex-row gap-4">
                            {/* معاينة الصورة الحالية مع إظهار التغييرات بشكل أفضل */}
                            <div className="w-full md:w-1/2 bg-gray-700 rounded-lg overflow-hidden">
                              <div className="relative h-48">
                                {/* عرض الصورة المختارة الجديدة أو الصورة الحالية */}
                                {imagePreview ? (
                                  <>
                                    <img 
                                      src={imagePreview}
                                      alt="معاينة الصورة الجديدة" 
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        console.error("فشل في تحميل الصورة المختارة");
                                        e.currentTarget.src = "/images/default.jpg";
                                      }}
                                    />
                                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                                      صورة جديدة
                                    </div>
                                  </>
                                ) : editingProject.image ? (
                                  <img 
                                    src={editingProject.image} 
                                    alt="الصورة الحالية" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      console.error("فشل في تحميل الصورة الحالية");
                                      e.currentTarget.src = "/images/default.jpg";
                                    }}
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-gray-600 text-gray-300">
                                    لا توجد صورة
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* زر اختيار الصورة */}
                            <div className="w-full md:w-1/2 flex flex-col gap-3">
                              <label 
                                htmlFor="imageUpload" 
                                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center flex items-center justify-center gap-2"
                              >
                                <FaCamera /> اختيار صورة جديدة
                              </label>
                      <input 
                                id="imageUpload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                                onChange={handleImageChange}
                              />
                              
                              {imagePreview && (
                                <button 
                                  onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview("");
                                  }} 
                                  className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-center flex items-center justify-center gap-2"
                                >
                                  <FaTrash /> إلغاء الصورة
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300">الفئة</label>
                  <select 
                    value={editingProject.category}
                              onChange={(e) => setEditingProject({...editingProject, category: e.target.value})}
                              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                            >
                                {categories.filter(cat => cat.id !== 'all' && cat.isActive !== false).map(category => (
                                  <option key={category.id} value={category.name}>
                                    {category.name}
                                  </option>
                    ))}
                  </select>
                </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300">السنة</label>
                  <input 
                              type="number" 
                    value={editingProject.year}
                              onChange={(e) => setEditingProject({...editingProject, year: Number(e.target.value)})}
                              className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>
              </div>

              <div>
                          <label className="block text-sm font-medium text-gray-300">الرابط</label>
                          <input 
                            type="text" 
                            value={editingProject.link || ''} 
                            onChange={(e) => setEditingProject({...editingProject, link: e.target.value})}
                            placeholder="https://example.com"
                            className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  />
                </div>

                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-300">حالة المشروع</label>
                          <div className="mt-2">
                            <label className="inline-flex items-center">
                      <input 
                                type="radio" 
                                checked={editingProject.isActive === true} 
                                onChange={() => setEditingProject({...editingProject, isActive: true})}
                                className="form-radio h-5 w-5 text-blue-600"
                              />
                              <span className="mr-2 text-white">نشط</span>
                    </label>
                            <label className="inline-flex items-center mr-6">
                              <input 
                                type="radio" 
                                checked={editingProject.isActive === false} 
                                onChange={() => setEditingProject({...editingProject, isActive: false})}
                                className="form-radio h-5 w-5 text-red-600"
                              />
                              <span className="mr-2 text-white">غير نشط</span>
                            </label>
                          </div>
                        </div>
                        
                          <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => {
                            console.log("بدء حفظ المشروع بالصورة الجديدة...");
                            
                            // الاحتفاظ بقيمة imagePreview في متغير محلي حتى لا تضيع
                            const finalImageSrc = imagePreview || editingProject.image;
                            
                            // تحديث المشروع مباشرةً
                            const updatedProject = {
                              ...editingProject,
                              image: finalImageSrc
                            };
                            
                            console.log("قيمة الصورة النهائية:", finalImageSrc ? "تم تعيين الصورة" : "لا توجد صورة");
                            
                            // تحديث في قائمة المشاريع المحلية
                            let updatedProjects;
                            
                            if (editingProject.id.startsWith('new-')) {
                              const newProjectId = `project-${Date.now()}`;
                              updatedProject.id = newProjectId;
                              updatedProjects = [...projects, updatedProject];
                              console.log("تم إنشاء مشروع جديد:", newProjectId);
                            } else {
                              // استبدال المشروع القديم بالمشروع المحدث
                              updatedProjects = projects.map(p => 
                                p.id === updatedProject.id ? updatedProject : p
                              );
                              console.log("تم تحديث مشروع موجود:", updatedProject.id);
                            }
                            
                            // تحديث الحالة (state) أولاً
                            setProjects(updatedProjects);
                            
                            // حفظ المشاريع في قاعدة البيانات
                            // طباعة تفاصيل المشروع قبل الحفظ للتأكد من حفظ الصورة
                            console.log("المشروع قبل الحفظ:", {
                              id: updatedProject.id,
                              title: updatedProject.title,
                              imageLength: updatedProject.image ? updatedProject.image.substring(0, 30) + "..." : "لا توجد صورة"
                            });
                            
                            saveProjects(updatedProjects)
                              .then(() => {
                                console.log("✅ تم حفظ المشاريع بنجاح");
                                // التحقق من نجاح الحفظ
                                const savedProject = updatedProjects.find(p => p.id === updatedProject.id);
                                console.log("التحقق من الصورة بعد الحفظ:", 
                                  savedProject?.image ? "الصورة موجودة (" + savedProject.image.substring(0, 20) + "...)" : "الصورة غير موجودة!"
                                );
                              })
                              .catch(error => {
                                console.error("❌ خطأ في حفظ المشاريع:", error);
                                alert("حدث خطأ أثناء حفظ المشروع. يرجى المحاولة مرة أخرى.");
                              });
                            
                            // إغلاق نافذة التحرير بعد الحفظ
                            setEditingProject(null);
                            setSelectedImage(null);
                            setImagePreview("");
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                        >
                          <FaSave /> حفظ التغييرات
                        </button>
                          </div>
                      </div>
                    </div>
                  </div>
                  )}
                </>
              )}

              {projectsSubTab === "categories" && (
                <div className="categories-management">
                  <div className="mb-6 bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">إدارة التصنيفات</h3>
                    <p className="text-gray-300 mb-6">
                      يمكنك إضافة وتعديل وحذف التصنيفات التي تستخدم لتنظيم المشاريع.
                    </p>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      if (editingCategory) {
                        // تحديث تصنيف موجود
                        if (!editingCategory.name.trim()) {
                          toast.error('يرجى إدخال اسم التصنيف');
                          return;
                        }

                        const updatedCategories = categories.map(cat => 
                          cat.id === editingCategory.id ? editingCategory : cat
                        );

                        saveCategories(updatedCategories).then(success => {
                          if (success) {
                            setCategories(updatedCategories);
                            setEditingCategory(null);
                            toast.success('تم تحديث التصنيف بنجاح');
                          } else {
                            toast.error('حدث خطأ أثناء تحديث التصنيف');
                          }
                        });
                      } else {
                        // إضافة تصنيف جديد
                        if (!newCategory.name.trim()) {
                          toast.error('يرجى إدخال اسم التصنيف');
                          return;
                        }

                        // إنشاء معرف فريد (slug) من الاسم
                        const slug = newCategory.name.trim()
                          .replace(/\s+/g, '-')
                          .replace(/[^\u0600-\u06FF\u0750-\u077F\w-]/g, '')
                          .toLowerCase();

                        const id = slug || `category-${Date.now()}`;

                        // التحقق من عدم وجود تصنيف بنفس المعرف
                        if (categories.some(cat => cat.id === id)) {
                          toast.error('يوجد تصنيف بنفس الاسم بالفعل');
                          return;
                        }

                        const categoryToAdd = {
                          ...newCategory,
                          id,
                          order: categories.length,
                          isActive: true
                        };

                        const updatedCategories = [...categories, categoryToAdd];
                        saveCategories(updatedCategories).then(success => {
                          if (success) {
                            setCategories(updatedCategories);
                            setNewCategory({ id: '', name: '', description: '' });
                            toast.success('تم إضافة التصنيف بنجاح');
                          } else {
                            toast.error('حدث خطأ أثناء إضافة التصنيف');
                          }
                        });
                      }
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                        </label>
                        <div className="flex flex-col md:flex-row gap-4">
                          <input
                            type="text"
                            placeholder="اسم التصنيف"
                            value={editingCategory ? editingCategory.name : newCategory.name}
                            onChange={(e) => {
                              if (editingCategory) {
                                setEditingCategory({...editingCategory, name: e.target.value});
                              } else {
                                setNewCategory({...newCategory, name: e.target.value});
                              }
                            }}
                            className="flex-1 p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                          />
                          <input
                            type="text"
                            placeholder="وصف التصنيف (اختياري)"
                            value={editingCategory ? editingCategory.description || '' : newCategory.description || ''}
                            onChange={(e) => {
                              if (editingCategory) {
                                setEditingCategory({...editingCategory, description: e.target.value});
                              } else {
                                setNewCategory({...newCategory, description: e.target.value});
                              }
                            }}
                            className="flex-2 p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        {editingCategory && (
                  <button 
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                          >
                            إلغاء
                          </button>
                        )}
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {editingCategory ? 'تحديث' : 'إضافة'}
                        </button>
                      </div>
                    </form>
                  </div>

                  <div className="bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-xl font-medium mb-4">التصنيفات الحالية ({categories.length})</h3>
                    
                    {categories.length === 0 ? (
                      <div className="text-center p-8 bg-gray-600 rounded-lg">
                        <p className="text-gray-300">لا توجد تصنيفات مضافة حالياً.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-right">
                          <thead className="bg-gray-600">
                            <tr>
                              <th className="p-3">المعرف</th>
                              <th className="p-3">الاسم</th>
                              <th className="p-3">الوصف</th>
                              <th className="p-3">الحالة</th>
                              <th className="p-3">الإجراءات</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categories.map((category, index) => (
                              <tr key={category.id} className={`border-t border-gray-600 ${index % 2 === 0 ? 'bg-gray-650' : ''}`}>
                                <td className="p-3 text-gray-300">{category.id}</td>
                                <td className="p-3">{category.name}</td>
                                <td className="p-3 text-gray-300">{category.description || '-'}</td>
                                <td className="p-3">
                                  <span 
                                    className={`inline-block px-2 py-1 rounded text-xs
                                      ${category.isActive ? 'bg-green-600 text-white' : 'bg-gray-500 text-gray-200'}`}
                                  >
                                    {category.isActive ? 'مفعل' : 'معطل'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => {
                                        const updatedCategories = categories.map(cat => 
                                          cat.id === category.id ? {...cat, isActive: !cat.isActive} : cat
                                        );
                                        saveCategories(updatedCategories).then(success => {
                        if (success) {
                                            setCategories(updatedCategories);
                                            toast.success(
                                              category.isActive 
                                                ? 'تم تعطيل التصنيف بنجاح' 
                                                : 'تم تفعيل التصنيف بنجاح'
                                            );
                        } else {
                                            toast.error('حدث خطأ أثناء تغيير حالة التصنيف');
                                          }
                                        });
                                      }}
                                      className={`p-2 rounded ${
                                        category.isActive 
                                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                                          : 'bg-green-600 hover:bg-green-700'
                                      } text-white`}
                                      title={category.isActive ? 'تعطيل' : 'تفعيل'}
                                    >
                                      {category.isActive ? <FaBan size={14} /> : <FaCheck size={14} />}
                                    </button>
                                    <button
                                      onClick={() => setEditingCategory(category)}
                                      className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                                      title="تعديل"
                                    >
                                      <FaEdit size={14} />
                                    </button>
                                    {/* عدم السماح بحذف تصنيف "كل الأعمال" */}
                                    {category.id !== 'all' && (
                                      <button
                                        onClick={() => {
                                          if (window.confirm(`هل أنت متأكد من حذف التصنيف "${category.name}"؟`)) {
                                            // التحقق من عدم استخدام التصنيف في أي مشاريع
                                            const projectsUsingCategory = projects.filter(
                                              p => p.category === category.name
                                            );
                                            
                                            if (projectsUsingCategory.length > 0) {
                                              toast.error(
                                                `لا يمكن حذف هذا التصنيف. يوجد ${projectsUsingCategory.length} مشروع يستخدمه.`
                                              );
                                              return;
                                            }
                                            
                                            const updatedCategories = categories.filter(
                                              cat => cat.id !== category.id
                                            );
                                            
                                            saveCategories(updatedCategories).then(success => {
                                              if (success) {
                                                setCategories(updatedCategories);
                                                toast.success('تم حذف التصنيف بنجاح');
                                              } else {
                                                toast.error('حدث خطأ أثناء حذف التصنيف');
                                              }
                                            });
                                          }
                                        }}
                                        className="p-2 rounded bg-red-600 hover:bg-red-700 text-white"
                                        title="حذف"
                                      >
                                        <FaTrash size={14} />
                  </button>
                                    )}
                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* قسم المعلومات الشخصية */}
          {activeTab === "personal" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">المعلومات الشخصية</h2>
              
              <div className="space-y-6">
                {personalInfo.map((item, index) => (
                  <div key={item.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300">العنوان</label>
                        <input 
                          type="text" 
                          value={item.title} 
                          onChange={(e) => {
                            const newPersonalInfo = [...personalInfo];
                            newPersonalInfo[index] = {...newPersonalInfo[index], title: e.target.value};
                            setPersonalInfo(newPersonalInfo);
                          }}
                          className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                    />
                  </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300">المحتوى</label>
                        <input 
                          type="text" 
                          value={item.content} 
                          onChange={(e) => {
                            const newPersonalInfo = [...personalInfo];
                            newPersonalInfo[index] = {...newPersonalInfo[index], content: e.target.value};
                            setPersonalInfo(newPersonalInfo);
                          }}
                          className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        />
              </div>
            </div>
                  </div>
                ))}

                <div className="flex justify-center mt-6">
              <button 
                    onClick={async () => {
                      try {
                        const success = await savePersonalInfo(personalInfo);
                        if (success) {
                          alert("تم حفظ المعلومات الشخصية بنجاح!");
                        } else {
                          alert("حدث خطأ أثناء حفظ المعلومات الشخصية.");
                        }
                      } catch (error) {
                        console.error("خطأ في حفظ المعلومات الشخصية:", error);
                        alert("حدث خطأ أثناء حفظ المعلومات الشخصية.");
                      }
                    }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                    <FaSave /> حفظ المعلومات الشخصية
              </button>
                </div>
            </div>
                  </div>
                )}

          {/* قسم الخبرات */}
          {activeTab === "experience" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">الخبرات المهنية</h2>
              
              {/* أزرار العمليات */}
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-medium">الخبرات المهنية ({experiences.length})</h3>
                <button 
                  onClick={() => {
                    setNewExperience({
                      id: `experience-${Date.now()}`,
                      title: "وظيفة جديدة",
                      company: "اسم الشركة",
                      period: "الفترة الزمنية",
                      description: "وصف الوظيفة والمهام",
                      icon: "FaBriefcase"
                    });
                    setIsAddingExperience(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaPlus /> إضافة خبرة جديدة
                </button>
              </div>

              {/* نموذج إضافة خبرة جديدة */}
              {isAddingExperience && (
                <div className="bg-gray-700 p-4 rounded-lg mb-6 border-2 border-green-500">
                  <h4 className="text-xl font-medium mb-4 flex items-center">
                    <FaPlus className="ml-2" /> إضافة خبرة جديدة
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">العنوان الوظيفي</label>
                      <input 
                        type="text" 
                        value={newExperience.title} 
                        onChange={(e) => setNewExperience({...newExperience, title: e.target.value})}
                        className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="أدخل العنوان الوظيفي"
                      />
            </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">الشركة</label>
                      <input 
                        type="text" 
                        value={newExperience.company} 
                        onChange={(e) => setNewExperience({...newExperience, company: e.target.value})}
                        className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="أدخل اسم الشركة"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300">الفترة</label>
                    <input 
                      type="text" 
                      value={newExperience.period} 
                      onChange={(e) => setNewExperience({...newExperience, period: e.target.value})}
                      className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                      placeholder="مثال: ٢٠١٩ - ٢٠٢٢"
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-300">الوصف</label>
                    <textarea 
                      value={newExperience.description} 
                      onChange={(e) => setNewExperience({...newExperience, description: e.target.value})}
                      rows={3}
                      className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                      placeholder="اكتب وصفاً للوظيفة والمهام الرئيسية"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2 mt-4 rtl:space-x-reverse">
              <button 
                      onClick={() => setIsAddingExperience(false)}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={() => {
                        // إضافة الخبرة الجديدة إلى القائمة
                        setExperiences([...experiences, newExperience]);
                        setIsAddingExperience(false);
                        
                        // تعيين معرف جديد للخبرة التالية
                        setNewExperience({
                          id: `experience-${Date.now()}`,
                          title: "وظيفة جديدة",
                          company: "اسم الشركة",
                          period: "الفترة الزمنية",
                          description: "وصف الوظيفة والمهام",
                          icon: "FaBriefcase"
                        });
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                    >
                      <FaSave /> حفظ الخبرة
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {experiences.length === 0 ? (
                  <div className="bg-gray-700 p-6 rounded-lg text-center">
                    <p className="text-gray-300 mb-4">لا توجد خبرات مهنية مضافة حالياً</p>
                    <button 
                      onClick={() => {
                        setNewExperience({
                          id: `experience-${Date.now()}`,
                          title: "وظيفة جديدة",
                          company: "اسم الشركة",
                          period: "الفترة الزمنية",
                          description: "وصف الوظيفة والمهام",
                          icon: "FaBriefcase"
                        });
                        setIsAddingExperience(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FaPlus /> إضافة خبرة جديدة
                    </button>
                  </div>
                ) : (
                  experiences.map((exp, index) => (
                    <div key={exp.id} className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium flex items-center">
                          <FaBriefcase className="ml-2" />
                          <span className="mr-2">{exp.title} - {exp.company}</span>
                        </h4>
                        <button 
                          onClick={() => {
                            // حذف الخبرة
                            if (window.confirm(`هل أنت متأكد من حذف "${exp.title} - ${exp.company}"؟`)) {
                              const newExperiences = experiences.filter((_, i) => i !== index);
                              setExperiences(newExperiences);
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300">العنوان الوظيفي</label>
                          <input 
                            type="text" 
                            value={exp.title} 
                            onChange={(e) => {
                              const newExperiences = [...experiences];
                              newExperiences[index] = {...newExperiences[index], title: e.target.value};
                              setExperiences(newExperiences);
                            }}
                            className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300">الشركة</label>
                          <input 
                            type="text" 
                            value={exp.company} 
                            onChange={(e) => {
                              const newExperiences = [...experiences];
                              newExperiences[index] = {...newExperiences[index], company: e.target.value};
                              setExperiences(newExperiences);
                            }}
                            className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300">الفترة</label>
                        <input 
                          type="text" 
                          value={exp.period} 
                          onChange={(e) => {
                            const newExperiences = [...experiences];
                            newExperiences[index] = {...newExperiences[index], period: e.target.value};
                            setExperiences(newExperiences);
                          }}
                          className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        />
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300">الوصف</label>
                        <textarea 
                          value={exp.description} 
                          onChange={(e) => {
                            const newExperiences = [...experiences];
                            newExperiences[index] = {...newExperiences[index], description: e.target.value};
                            setExperiences(newExperiences);
                          }}
                          rows={3}
                          className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        />
                      </div>
                    </div>
                  ))
                )}
                
                <div className="flex justify-center mt-6">
                  <button 
                    onClick={async () => {
                      try {
                        const success = await saveExperiences(experiences);
                        if (success) {
                          alert("تم حفظ الخبرات المهنية بنجاح!");
                        } else {
                          alert("حدث خطأ أثناء حفظ الخبرات المهنية.");
                        }
                      } catch (error) {
                        console.error("خطأ في حفظ الخبرات المهنية:", error);
                        alert("حدث خطأ أثناء حفظ الخبرات المهنية.");
                      }
                    }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
              >
                    <FaSave /> حفظ الخبرات المهنية
              </button>
                </div>
            </div>
          </div>
        )}

          {/* قسم معلومات الاتصال */}
          {activeTab === "contact" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">معلومات الاتصال</h2>
              
              {/* شرح توضيحي */}
              <div className="mb-6 p-4 bg-blue-900/30 border border-blue-700/50 rounded-lg">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <FaInfoCircle className="ml-2 text-blue-400" /> ملاحظة مهمة
                </h3>
                <p className="text-gray-300 mb-2">
                  عند تحديد الأيقونات والألوان هنا، سوف تظهر في صفحة "تواصل معي" في الموقع الرئيسي.
                </p>
                <p className="text-gray-300">
                  الأيقونات المتاحة: FaPhone (هاتف)، FaEnvelope (بريد إلكتروني)، FaWhatsapp (واتساب)، FaMapMarkerAlt (عنوان)
                </p>
                <p className="text-gray-300 mt-2">
                  <strong>ملاحظة:</strong> الروابط تُنشأ تلقائيًا بناءً على نوع الأيقونة المحددة.
                </p>
              </div>
              
              {/* أزرار العمليات */}
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-medium">وسائل الاتصال المتاحة ({contactInfo.length})</h3>
                      <button 
                  onClick={() => {
                    // إضافة معلومات اتصال جديدة
                    const defaultContactType = "phone";
                    const contactType = getContactTypeById(defaultContactType);

                    const newContact: ContactInfoExt = {
                      id: `contact-${Date.now()}`,
                      icon: contactType.icon,
                      title: contactType.name, // استخدام اسم نوع الاتصال كعنوان
                      value: "",
                      content: "",
                      subtitle: "",
                      link: "",
                      color: "bg-gradient-to-r from-blue-600 to-blue-400",
                      contactType: defaultContactType,
                      buttonText: contactType.buttonText
                    };
                    setContactInfo([...contactInfo, newContact]);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaPlus /> إضافة وسيلة اتصال جديدة
                      </button>
                    </div>
              
              <div className="space-y-6">
                {contactInfo.length === 0 ? (
                  <div className="bg-gray-700 p-6 rounded-lg text-center">
                    <p className="text-gray-300 mb-4">لا توجد معلومات اتصال مضافة حالياً</p>
                  </div>
                ) : (
                  contactInfo.map((contact, index) => (
                    <div key={contact.id} className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium flex items-center">
                          {getContactIcon(contact.icon)}
                          <span className="mr-2">{contact.title}</span>
                        </h4>
              <button 
                onClick={() => {
                            // حذف معلومات الاتصال
                            if (window.confirm(`هل أنت متأكد من حذف "${contact.title}"؟`)) {
                              const newContactInfo = contactInfo.filter((_, i) => i !== index);
                              setContactInfo(newContactInfo);
                            }
                          }}
                          className="text-red-500 hover:text-red-700"
                          title="حذف"
                        >
                          <FaTrash />
              </button>
            </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                          <label className="block text-sm font-medium text-gray-300">العنوان</label>
                  <input 
                    type="text" 
                            value={contact.title} 
                            onChange={(e) => {
                              const newContactInfo = [...contactInfo];
                              newContactInfo[index] = {...newContactInfo[index], title: e.target.value};
                              setContactInfo(newContactInfo);
                            }}
                            className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                  />
                </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300">نوع الاتصال</label>
                  <select 
                            value={contact.contactType || "phone"} 
                            onChange={(e) => {
                              const selectedType = e.target.value;
                              const contactType = getContactTypeById(selectedType);
                              
                              const newContactInfo = [...contactInfo];
                              newContactInfo[index] = {
                                ...newContactInfo[index],
                                contactType: selectedType,
                                icon: contactType.icon,
                                // تحديث العنوان ليكون نفس اسم نوع الاتصال المختار
                                title: contactType.name,
                              };
                              setContactInfo(newContactInfo);
                            }}
                            className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                          >
                            {contactTypes.map(type => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                      </option>
                    ))}
                  </select>
                        </div>
                </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300">
                          {getContactTypeById(contact.contactType || "phone").valueLabel}
                        </label>
                        
                        {getContactTypeById(contact.contactType || "phone").isPhoneInput ? (
                          <PhoneInput
                            country={'ae'}
                            value={contact.value}
                            onChange={(value) => {
                              const contactTypeId = contact.contactType || "phone";
                              
                              const newContactInfo = [...contactInfo];
                              // تحديث القيمة والمحتوى والعنوان الفرعي
                              newContactInfo[index] = {
                                ...newContactInfo[index],
                                value: value,
                                content: value,
                                subtitle: value,
                                // تحديث الرابط تلقائيًا
                                link: getExpectedLink(contactTypeId, value)
                              };
                              setContactInfo(newContactInfo);
                            }}
                            inputProps={{
                              required: true,
                              className: "mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                            }}
                            containerClass="!bg-gray-600 !text-white"
                            buttonClass="!bg-gray-500"
                            dropdownClass="!bg-gray-700 !text-white"
                            searchClass="!bg-gray-600 !text-white"
                            enableSearch={true}
                            searchPlaceholder="ابحث عن الدولة..."
                            preferredCountries={['ae', 'sa', 'eg', 'qa', 'kw', 'bh']}
                          />
                        ) : (
                          <input 
                            type="text" 
                            value={contact.value} 
                            onChange={(e) => {
                              const newValue = e.target.value;
                              const contactTypeId = contact.contactType || "phone";
                              
                              const newContactInfo = [...contactInfo];
                              // تحديث القيمة والمحتوى والعنوان الفرعي
                              newContactInfo[index] = {
                                ...newContactInfo[index], 
                                value: newValue,
                                content: newValue,
                                subtitle: newValue,
                                // تحديث الرابط تلقائيًا
                                link: getExpectedLink(contactTypeId, newValue)
                              };
                              setContactInfo(newContactInfo);
                            }}
                            className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                            placeholder={getContactTypeById(contact.contactType || "phone").valuePlaceholder}
                          />
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300">الرابط (يُحدّث تلقائيًا)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={contact.link || ""}
                            readOnly
                            className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-gray-400 pr-10"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                            يُنشأ تلقائيًا من القيمة المدخلة
                          </div>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <FaLink className="text-gray-500" />
                          </div>
                </div>
              </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300">الأيقونة</label>
                        <div className="grid grid-cols-5 gap-2 mt-2">
                          {contactTypes.map(type => (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => {
                                const newContactInfo = [...contactInfo];
                                newContactInfo[index] = {
                                  ...newContactInfo[index], 
                                  icon: type.icon,
                                  contactType: type.id
                                };
                                setContactInfo(newContactInfo);
                              }}
                              className={`p-3 rounded-lg flex items-center justify-center ${contact.icon === type.icon ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                              title={type.name}
                            >
                              {getContactIcon(type.icon)}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">اللون</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {colorOptions.map((color, colorIndex) => (
                            <button
                              key={colorIndex}
                              type="button"
                              className={`w-12 h-12 rounded-lg relative ${color.value} transition-all duration-200 border-2 ${contact.color === color.value ? 'border-white scale-110' : 'border-transparent'}`}
                              title={color.name}
                              onClick={() => {
                                const newContactInfo = [...contactInfo];
                                newContactInfo[index] = {...newContactInfo[index], color: color.value};
                                setContactInfo(newContactInfo);
                              }}
                            >
                              {contact.color === color.value && (
                                <span className="absolute inset-0 flex items-center justify-center text-white">
                                  <FaCheck size={16} />
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={contact.color} 
                            onChange={(e) => {
                              const newContactInfo = [...contactInfo];
                              newContactInfo[index] = {...newContactInfo[index], color: e.target.value};
                              setContactInfo(newContactInfo);
                            }}
                            className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white pr-12"
                            placeholder="مثال: bg-gradient-to-r from-blue-500 to-blue-400"
                          />
                          <div className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-md ${contact.color}`}></div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300">نص الزر (اختياري)</label>
                        <input 
                          type="text" 
                          value={contact.buttonText || ""} 
                          onChange={(e) => {
                            const newContactInfo = [...contactInfo];
                            newContactInfo[index] = {...newContactInfo[index], buttonText: e.target.value};
                            setContactInfo(newContactInfo);
                          }}
                          className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                          placeholder={getContactTypeById(contact.contactType || "phone").buttonText}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          اترك هذا الحقل فارغًا لاستخدام النص الافتراضي: "{getContactTypeById(contact.contactType || "phone").buttonText}"
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-300">العنوان الفرعي (اختياري)</label>
                        <input 
                          type="text" 
                          value={contact.subtitle || ""} 
                          onChange={(e) => {
                            const newContactInfo = [...contactInfo];
                            newContactInfo[index] = {...newContactInfo[index], subtitle: e.target.value};
                            setContactInfo(newContactInfo);
                          }}
                          className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                          placeholder="مثال: متاح من 9 صباحًا حتى 5 مساءً"
                        />
                      </div>
                    </div>
                  ))
                )}
                
                <div className="flex justify-center mt-6">
                  <button 
                    onClick={async () => {
                      try {
                        const success = await saveContactInfo(contactInfo);
                        if (success) {
                          alert("تم حفظ معلومات الاتصال بنجاح!");
                        } else {
                          alert("حدث خطأ أثناء حفظ معلومات الاتصال.");
                        }
                      } catch (error) {
                        console.error("خطأ في حفظ معلومات الاتصال:", error);
                        alert("حدث خطأ أثناء الحفظ. تم محاولة الحفظ محلياً.");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                  >
                    <FaSave /> حفظ معلومات الاتصال
                  </button>
        </div>
      </div>
    </div>
          )}
          
          {/* قسم السيرة الذاتية */}
          {activeTab === "cv" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">إدارة السيرة الذاتية</h2>
              
              {isEditingCV ? (
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {selectedCV?.id.includes('new') ? 'إضافة سيرة ذاتية جديدة' : 'تعديل السيرة الذاتية'}
                  </h3>
                  
                  <div className="space-y-4">
              <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">العنوان</label>
                  <input 
                    type="text" 
                        value={selectedCV?.title || ''}
                        onChange={(e) => setSelectedCV(prev => prev ? {...prev, title: e.target.value} : null)}
                        className="w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="مثال: السيرة الذاتية الرئيسية"
                      />
              </div>

              <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">الوصف</label>
                  <textarea 
                        value={selectedCV?.description || ''}
                        onChange={(e) => setSelectedCV(prev => prev ? {...prev, description: e.target.value} : null)}
                        rows={3}
                        className="w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="وصف مختصر للسيرة الذاتية"
                  />
                </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">الإصدار</label>
                      <input 
                        type="text" 
                        value={selectedCV?.version || ''}
                        onChange={(e) => setSelectedCV(prev => prev ? {...prev, version: e.target.value} : null)}
                        className="w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="مثال: 1.0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">ملف السيرة الذاتية (PDF فقط)</label>
                      <input 
                        type="file" 
                        accept="application/pdf"
                        onChange={handleCVFileChange}
                        className="w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                      />
                      {selectedCV?.fileUrl && !cvFilePreview && (
                        <div className="mt-2 text-blue-400">
                          <a href={selectedCV.fileUrl} target="_blank" rel="noopener noreferrer">
                            عرض الملف الحالي
                          </a>
                        </div>
                      )}
                      {cvFilePreview && (
                        <div className="mt-2 text-green-400">
                          تم اختيار ملف جديد
                  </div>
                      )}
                </div>

                    <div className="flex items-center mt-4">
                      <label className="block text-sm font-medium text-gray-300 ml-2">تفعيل</label>
                      <input 
                        type="checkbox" 
                        checked={selectedCV?.isActive || false}
                        onChange={(e) => setSelectedCV(prev => prev ? {...prev, isActive: e.target.checked} : null)}
                        className="w-5 h-5 rounded"
                    />
                  </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={() => {
                        setIsEditingCV(false);
                        setSelectedCV(null);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={handleSaveCV}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleAddCV}
                  className="mb-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaPlus /> إضافة سيرة ذاتية جديدة
                </button>
              )}
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">السير الذاتية المتاحة</h3>
                
                {cvFiles.length === 0 ? (
                  <div className="bg-gray-700 p-4 rounded-lg text-gray-300">
                    لا توجد ملفات سيرة ذاتية. قم بإضافة السيرة الذاتية أولاً.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {cvFiles.map(cv => (
                      <div key={cv.id} className={`bg-gray-700 p-4 rounded-lg border-l-4 ${cv.isActive ? 'border-green-500' : 'border-red-500'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-semibold text-white">{cv.title}</h4>
                            <p className="text-gray-300 text-sm mt-1">{cv.description}</p>
                            <div className="flex gap-4 mt-2 text-sm">
                              <span className="text-blue-400">الإصدار: {cv.version}</span>
                              <span className="text-gray-400">التنزيلات: {cv.downloadCount || 0}</span>
                              <span className="text-gray-400">آخر تحديث: {new Date(cv.lastUpdate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEditCV(cv)}
                              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                              title="تعديل"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleToggleCV(cv.id)}
                              className={`p-2 ${cv.isActive ? 'bg-yellow-600' : 'bg-green-600'} text-white rounded hover:${cv.isActive ? 'bg-yellow-500' : 'bg-green-500'}`}
                              title={cv.isActive ? 'إيقاف' : 'تفعيل'}
                            >
                              {cv.isActive ? <FaPause /> : <FaPlay />}
                            </button>
                            <button 
                              onClick={() => handleDeleteCV(cv.id)}
                              className="p-2 bg-red-600 text-white rounded hover:bg-red-500"
                              title="حذف"
                            >
                              <FaTrash />
                            </button>
              </div>
            </div>

                        {cv.fileUrl && (
                          <div className="mt-3">
                            <a 
                              href={cv.fileUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
                            >
                              <FaFileAlt /> عرض الملف
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
      

          {/* قسم التايم لاين */}
          {activeTab === "timeline" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">إدارة الخط الزمني (التايم لاين)</h2>
              
              {isEditingTimelineItem ? (
                <div className="bg-gray-700 p-6 rounded-lg mb-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {selectedTimelineItem?.id.includes('new') ? 'إضافة عنصر جديد' : 'تعديل العنصر'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">السنة</label>
                      <input 
                        type="text" 
                        value={selectedTimelineItem?.year || ''}
                        onChange={(e) => setSelectedTimelineItem(prev => prev ? {...prev, year: e.target.value} : null)}
                        className="w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="مثال: 2023"
                      />
            </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">العنوان الوظيفي</label>
                      <input 
                        type="text" 
                        value={selectedTimelineItem?.title || ''}
                        onChange={(e) => setSelectedTimelineItem(prev => prev ? {...prev, title: e.target.value} : null)}
                        className="w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="مثال: مهندس صوت"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">الجهة</label>
                      <input 
                        type="text" 
                        value={selectedTimelineItem?.company || ''}
                        onChange={(e) => setSelectedTimelineItem(prev => prev ? {...prev, company: e.target.value} : null)}
                        className="w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="مثال: قناة الشرق"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">الوصف (اختياري)</label>
                      <textarea 
                        value={selectedTimelineItem?.description || ''}
                        onChange={(e) => setSelectedTimelineItem(prev => prev ? {...prev, description: e.target.value} : null)}
                        rows={3}
                        className="w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="وصف مختصر للعمل"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">التصنيف</label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        <button
                          onClick={() => {
                            setTimelineCategory('tv');
                            setSelectedTimelineItem(prev => prev ? {...prev, category: 'tv'} : null);
                          }}
                          className={`p-3 rounded-lg flex flex-col items-center ${timelineCategory === 'tv' ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-gray-600 hover:bg-gray-500'}`}
                        >
                          <FaTv className="mb-2 text-2xl" />
                          <span>قنوات وإذاعات</span>
                        </button>
                        <button
                          onClick={() => {
                            setTimelineCategory('film');
                            setSelectedTimelineItem(prev => prev ? {...prev, category: 'film'} : null);
                          }}
                          className={`p-3 rounded-lg flex flex-col items-center ${timelineCategory === 'film' ? 'bg-purple-600 ring-2 ring-purple-300' : 'bg-gray-600 hover:bg-gray-500'}`}
                        >
                          <FaFilm className="mb-2 text-2xl" />
                          <span>أفلام ومسلسلات</span>
                        </button>
                        <button
                          onClick={() => {
                            setTimelineCategory('program');
                            setSelectedTimelineItem(prev => prev ? {...prev, category: 'program'} : null);
                          }}
                          className={`p-3 rounded-lg flex flex-col items-center ${timelineCategory === 'program' ? 'bg-green-600 ring-2 ring-green-300' : 'bg-gray-600 hover:bg-gray-500'}`}
                        >
                          <FaYoutube className="mb-2 text-2xl" />
                          <span>برامج ووثائقيات</span>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">الأيقونة</label>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mt-2">
                        {['FaBriefcase', 'FaMicrophone', 'FaHeadphones', 'FaTv', 'FaFilm', 'FaYoutube', 'FaAward', 'FaCertificate'].map(iconName => (
                          <button
                            key={iconName}
                            onClick={() => setSelectedTimelineItem(prev => prev ? {...prev, icon: iconName} : null)}
                            className={`p-3 rounded-lg ${selectedTimelineItem?.icon === iconName ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                            title={iconName.replace('Fa', '')}
                          >
                            {getTimelineIcon(iconName)}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-4">
                      <label className="block text-sm font-medium text-gray-300 ml-2">تفعيل</label>
                      <input 
                        type="checkbox" 
                        checked={selectedTimelineItem?.isActive || false}
                        onChange={(e) => setSelectedTimelineItem(prev => prev ? {...prev, isActive: e.target.checked} : null)}
                        className="w-5 h-5 rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button 
                      onClick={() => {
                        setIsEditingTimelineItem(false);
                        setSelectedTimelineItem(null);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={handleSaveTimelineItem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h3 className="text-xl font-medium">فلترة حسب التصنيف</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button 
                          onClick={() => setTimelineCategory('all')}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timelineCategory === 'all' ? 'bg-purple-800 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                          <FaList /> الكل
                        </button>
                        <button 
                          onClick={() => setTimelineCategory('tv')}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timelineCategory === 'tv' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                          <FaTv /> قنوات وإذاعات
                        </button>
                        <button 
                          onClick={() => setTimelineCategory('film')}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timelineCategory === 'film' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                          <FaFilm /> أفلام ومسلسلات
                        </button>
                        <button 
                          onClick={() => setTimelineCategory('program')}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${timelineCategory === 'program' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                          <FaYoutube /> برامج ووثائقيات
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={handleAddTimelineItem}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <FaPlus /> إضافة عنصر جديد
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">عناصر الخط الزمني ({timelineCategory === 'all' 
                      ? timelineItems.length 
                      : timelineItems.filter(item => item.category === timelineCategory).length})</h3>
                    
                    {/* إضافة معلومات تشخيصية */}
                    <div className="bg-gray-800 p-3 rounded-lg text-sm">
                      <p className="mb-1">حالة البيانات: 
                        <span className={timelineItems.length > 0 ? "text-green-400 mr-1" : "text-red-400 mr-1"}>
                          {timelineItems.length > 0 ? "تم تحميل البيانات" : "لا توجد بيانات"}
                        </span>
                      </p>
                      <p>عدد العناصر الكلي: {timelineItems.length}</p>
                      <p>التصفية الحالية: {getTimelineCategoryLabel(timelineCategory)}</p>
                      {timelineCategory !== 'all' && (
                        <p>عدد العناصر بعد التصفية: {timelineItems.filter(item => item.category === timelineCategory).length}</p>
                      )}
                    </div>
                    
                    {timelineCategory === 'all' 
                      ? (timelineItems.length === 0 ? (
                          <div className="bg-gray-700 p-4 rounded-lg text-gray-300">
                            لا توجد عناصر. قم بإضافة عناصر جديدة.
                          </div>
                        ) : null)
                      : (timelineItems.filter(item => item.category === timelineCategory).length === 0 ? (
                          <div className="bg-gray-700 p-4 rounded-lg text-gray-300">
                            لا توجد عناصر في هذا التصنيف. قم بإضافة عناصر جديدة.
                          </div>
                        ) : null)
                    }
                    
                    {(timelineCategory === 'all' || timelineItems.filter(item => item.category === timelineCategory).length > 0) && (
                      <div className="accordion space-y-4">
                        {(timelineCategory === 'all' 
                          ? timelineItems 
                          : timelineItems.filter(item => item.category === timelineCategory)
                        )
                          .sort((a, b) => parseInt(b.year) - parseInt(a.year))
                          .map(item => (
                            <div key={item.id} className={`bg-gray-700 rounded-lg border-l-4 overflow-hidden ${item.isActive ? 'border-green-500' : 'border-red-500'}`}>
                              {/* رأس الأكورديون */}
                              <div 
                                className="p-4 flex justify-between items-start cursor-pointer hover:bg-gray-600/50 transition-colors duration-200"
                                onClick={() => toggleAccordionItem(item.id)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`${getTimelineCategoryColor(item.category)} p-3 rounded-lg flex items-center justify-center`}>
                                    {getTimelineIcon(item.icon || 'FaBriefcase')}
                                  </div>
                                  <div>
                                    <div className="flex items-center">
                                      <span className="font-bold text-lg text-white">{item.year}</span>
                                      <span className="mx-2 text-gray-400">•</span>
                                      <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                                    </div>
                                    <p className="text-gray-300 mt-1">{item.company}</p>
                                    <div className="mt-2 text-xs font-medium bg-gray-800 text-gray-300 px-2 py-1 rounded-full inline-block">
                                      {getTimelineCategoryLabel(item.category)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-400 transform transition-transform duration-300 mr-2">
                                    {openAccordionItems[item.id] ? <FaChevronUp /> : <FaChevronDown />}
                                  </span>
                                  <div className="flex gap-2">
                      <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditTimelineItem(item);
                                      }}
                                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                                      title="تعديل"
                                    >
                                      <FaEdit />
                      </button>
                      <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleTimelineItem(item.id);
                                      }}
                                      className={`p-2 ${item.isActive ? 'bg-yellow-600' : 'bg-green-600'} text-white rounded hover:${item.isActive ? 'bg-yellow-500' : 'bg-green-500'}`}
                                      title={item.isActive ? 'إيقاف' : 'تفعيل'}
                                    >
                                      {item.isActive ? <FaPause /> : <FaPlay />}
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTimelineItem(item.id);
                                      }}
                                      className="p-2 bg-red-600 text-white rounded hover:bg-red-500"
                                      title="حذف"
                                    >
                                      <FaTrash />
                      </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* محتوى الأكورديون */}
                              <div 
                                className={`px-4 pb-4 pt-2 border-t border-gray-600 bg-gray-700/50 transition-all duration-300 ${openAccordionItems[item.id] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 hidden'}`}
                              >
                                {item.description && (
                                  <div className="mb-4">
                                    <h5 className="text-sm font-medium text-gray-400 mb-1">الوصف:</h5>
                                    <p className="text-white">{item.description}</p>
                                </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-400 mb-1">السنة:</h5>
                                    <div className="bg-gray-800 p-2 rounded">{item.year}</div>
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-400 mb-1">المسمى الوظيفي:</h5>
                                    <div className="bg-gray-800 p-2 rounded">{item.title}</div>
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-400 mb-1">الجهة:</h5>
                                    <div className="bg-gray-800 p-2 rounded">{item.company}</div>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <h5 className="text-sm font-medium text-gray-400 mb-1">الحالة:</h5>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                                    {item.isActive ? 'نشط' : 'غير نشط'}
                                  </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
                  
                  <div className="flex justify-center mt-8">
                    <button 
                      onClick={async () => {
                        try {
                          console.log("بدء حفظ جميع معلومات التايم لاين...");
                          const success = await saveTimelineItems(timelineItems);
                          if (success) {
                            console.log("تم حفظ جميع المعلومات بنجاح");
                            alert("تم حفظ معلومات التايم لاين بنجاح!");
                            // إعادة تحميل البيانات للتأكد من أنها مُحدثة
                            loadTimelineItems();
                          } else {
                            console.error("فشل حفظ المعلومات");
                            alert("تم حفظ معلومات التايم لاين محلياً فقط. قد تكون هناك مشكلة في الاتصال بالخادم.");
                          }
                        } catch (error) {
                          console.error("خطأ في حفظ معلومات التايم لاين:", error);
                          alert("حدث خطأ أثناء الحفظ. تم محاولة الحفظ محلياً.");
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                    >
                      <FaSave /> حفظ جميع العناصر
                    </button>
      </div>
                </>
              )}
    </div>
          )}
          
          {/* قسم الفيديو التعريفي */}
          {activeTab === "video" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">بيانات الفيديو التعريفي</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">تفعيل الفيديو</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={videoInfo.isActive}
                    onChange={(e) => setVideoInfo({...videoInfo, isActive: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="mr-2 text-sm text-gray-300">
                    {videoInfo.isActive ? "الفيديو مفعل ويظهر في الموقع" : "الفيديو غير مفعل ومخفي من الموقع"}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">عنوان القسم</label>
                <input
                  type="text"
                  value={videoInfo.title}
                  onChange={(e) => setVideoInfo({...videoInfo, title: e.target.value})}
                  className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">وصف القسم</label>
                <textarea
                  value={videoInfo.description}
                  onChange={(e) => setVideoInfo({...videoInfo, description: e.target.value})}
                  className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  rows={4}
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">رابط الفيديو</label>
                <input
                  type="text"
                  value={videoInfo.videoUrl}
                  onChange={(e) => setVideoInfo({...videoInfo, videoUrl: e.target.value})}
                  className="mt-1 block w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                  placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                />
                <p className="text-xs text-gray-400 mt-1">
                  يمكنك استخدام الروابط العادية ليوتيوب، مثال: 
                  <span className="inline-block mt-1 text-blue-400 font-mono text-[10px] bg-gray-800 px-2 py-1 rounded">
                    https://www.youtube.com/watch?v=yfZox-wm-Kg
                  </span>
                  <br />
                  أو الروابط المختصرة مثل: 
                  <span className="inline-block mt-1 text-blue-400 font-mono text-[10px] bg-gray-800 px-2 py-1 rounded">
                    https://youtu.be/yfZox-wm-Kg
                  </span>
                </p>
              </div>
              
              {videoInfo.videoUrl && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">معاينة الفيديو</label>
                  <div className="aspect-video rounded-lg overflow-hidden border border-gray-600">
                    <iframe
                      src={convertYouTubeUrl(videoInfo.videoUrl)}
                      className="w-full h-full"
                      title="معاينة الفيديو"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center mt-6">
                <button
                  onClick={handleSaveVideoInfo}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <FaSave /> حفظ بيانات الفيديو
                </button>
              </div>
            </div>
          )}
          
          {/* قسم الهيدر */}
          {activeTab === "header" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">إدارة قائمة التنقل</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">الروابط الحالية</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-4 py-2">الاسم</th>
                          <th className="px-4 py-2">الرابط</th>
                          <th className="px-4 py-2">الحالة</th>
                          <th className="px-4 py-2">الترتيب</th>
                          <th className="px-4 py-2">الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {headerLinks.map((link, index) => (
                          <tr key={index} className="border-b border-gray-600 last:border-0">
                            <td className="px-4 py-3">{link.name}</td>
                            <td className="px-4 py-3 text-gray-300">{link.url}</td>
                            <td className="px-4 py-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={link.isActive} 
                                  onChange={() => toggleHeaderLinkActive(index)}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                              </label>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-1 rtl:space-x-reverse">
                                <button 
                                  onClick={() => moveHeaderLink(index, "up")}
                                  disabled={index === 0}
                                  className="p-1 text-white bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="تحريك لأعلى"
                                >
                                  <FaArrowUp />
                                </button>
                                <button 
                                  onClick={() => moveHeaderLink(index, "down")}
                                  disabled={index === headerLinks.length - 1}
                                  className="p-1 text-white bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="تحريك لأسفل"
                                >
                                  <FaArrowDown />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button 
                                onClick={() => removeHeaderLink(index)}
                                className="p-1 text-white bg-red-600 rounded hover:bg-red-500"
                                title="حذف"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">إضافة رابط جديد</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300">الاسم</label>
                      <input 
                        type="text" 
                        value={newHeaderLink.name} 
                        onChange={(e) => setNewHeaderLink({...newHeaderLink, name: e.target.value})}
                        className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="مثال: تواصل معي"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300">الرابط</label>
                      <input 
                        type="text" 
                        value={newHeaderLink.url} 
                        onChange={(e) => setNewHeaderLink({...newHeaderLink, url: e.target.value})}
                        className="mt-1 block w-full p-3 bg-gray-600 border border-gray-600 rounded-md text-white"
                        placeholder="مثال: /#contact"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <button 
                      onClick={handleAddHeaderLink}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                    >
                      <FaPlus /> إضافة
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={saveHeaderLinksToLocal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                  >
                    <FaSave /> حفظ تغييرات القائمة
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* قسم اللوجو */}
          {activeTab === "logo" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-gray-800 p-6 rounded-lg"
            >
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">إعدادات اللوجو</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">اللوجو الحالي</label>
                      <div className="w-32 h-32 bg-gray-700 border border-gray-600 rounded-lg overflow-hidden flex items-center justify-center">
                        {currentLogo && (
                          <Image 
                            src={currentLogo} 
                            alt="لوجو الموقع الحالي" 
                            width={128} 
                            height={128}
                            className="object-contain w-full h-full"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">اختيار لوجو جديد</label>
                      <input
                        type="file"
                        onChange={handleLogoChange}
                        accept="image/*"
                        className="block w-full text-sm text-gray-300
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-lg file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-600 file:text-white
                          hover:file:bg-blue-700
                          file:cursor-pointer file:transition-colors"
                      />
                      <p className="mt-1 text-xs text-gray-400">يُنصح باستخدام صورة مربعة بأبعاد 128×128 بكسل</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">معاينة اللوجو الجديد</label>
                      <div className="w-32 h-32 bg-gray-700 border border-gray-600 rounded-lg overflow-hidden flex items-center justify-center">
                        {logoPreview ? (
                          <Image 
                            src={logoPreview} 
                            alt="معاينة اللوجو الجديد" 
                            width={128} 
                            height={128} 
                            className="object-contain w-full h-full"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">لا توجد معاينة</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 rtl:space-x-reverse pt-4">
                      <button
                        onClick={handleSaveLogo}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                      >
                        <FaSave className="ml-2" /> حفظ اللوجو
                      </button>
                      
                      <button
                        onClick={handleResetLogo}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                      >
                        <FaUndo className="ml-2" /> استعادة الافتراضي
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">ملاحظات:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    <li>سيتم حفظ اللوجو في التخزين المحلي للمتصفح</li>
                    <li>يجب استخدام صور ذات حجم صغير لتحسين الأداء</li>
                    <li>يمكنك استعادة اللوجو الافتراضي في أي وقت</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* قسم الفوتر */}
          {activeTab === "footer" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">إعدادات الفوتر</h2>
              {/* محتوى قسم الفوتر */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* النبذة المختصرة */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">النبذة المختصرة</h3>
                  <textarea
                    value={footerData.bio}
                    onChange={(e) => setFooterData({...footerData, bio: e.target.value})}
                    className="w-full h-32 p-2 bg-gray-700 rounded border border-gray-600 text-white"
                  />
                </div>
                
                {/* معلومات الاتصال */}
                <div>
                  <h3 className="text-xl font-semibold mb-3">معلومات الاتصال</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block mb-1">واتساب</label>
                      <input
                        type="text"
                        value={footerData.contactInfo.whatsapp}
                        onChange={(e) => setFooterData({
                          ...footerData,
                          contactInfo: {...footerData.contactInfo, whatsapp: e.target.value}
                        })}
                        className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={footerData.contactInfo.email}
                        onChange={(e) => setFooterData({
                          ...footerData,
                          contactInfo: {...footerData.contactInfo, email: e.target.value}
                        })}
                        className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">العنوان</label>
                      <input
                        type="text"
                        value={footerData.contactInfo.location}
                        onChange={(e) => setFooterData({
                          ...footerData,
                          contactInfo: {...footerData.contactInfo, location: e.target.value}
                        })}
                        className="w-full p-2 bg-gray-700 rounded border border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* قسم بطاقة التواصل */}
          {activeTab === "vcard" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">إعدادات بطاقة التواصل (VCard)</h2>
              <p className="text-gray-400 mb-6">
                هذه البيانات ستستخدم في ملف بطاقة التواصل (VCard) الذي يمكن للزوار تحميله وإضافته لجهات الاتصال لديهم.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">الاسم الأول</label>
                    <input
                      type="text"
                      value={vCardInfo.firstName}
                      onChange={(e) => setVCardInfo({...vCardInfo, firstName: e.target.value})}
                      className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">الاسم الأخير</label>
                    <input
                      type="text"
                      value={vCardInfo.lastName}
                      onChange={(e) => setVCardInfo({...vCardInfo, lastName: e.target.value})}
                      className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">المسمى الوظيفي</label>
                    <input
                      type="text"
                      value={vCardInfo.title}
                      onChange={(e) => setVCardInfo({...vCardInfo, title: e.target.value})}
                      className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">رقم الهاتف</label>
                    <input
                      type="text"
                      value={vCardInfo.phone}
                      onChange={(e) => setVCardInfo({...vCardInfo, phone: e.target.value})}
                      className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={vCardInfo.email}
                      onChange={(e) => setVCardInfo({...vCardInfo, email: e.target.value})}
                      className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">العنوان</label>
                    <input
                      type="text"
                      value={vCardInfo.address}
                      onChange={(e) => setVCardInfo({...vCardInfo, address: e.target.value})}
                      className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">الموقع الإلكتروني</label>
                    <input
                      type="text"
                      value={vCardInfo.website}
                      onChange={(e) => setVCardInfo({...vCardInfo, website: e.target.value})}
                      className="w-full p-3 bg-gray-700 rounded border border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <div>
                  <button
                    onClick={() => {
                      const vCardText = `BEGIN:VCARD
VERSION:3.0
N:${vCardInfo.lastName};${vCardInfo.firstName};;;
FN:${vCardInfo.firstName} ${vCardInfo.lastName}
TITLE:${vCardInfo.title}
TEL;TYPE=CELL:${vCardInfo.phone}
EMAIL:${vCardInfo.email}
ADR:;;${vCardInfo.address};;;
URL:${vCardInfo.website}
END:VCARD`;

                      // حفظ الملف مباشرة في المجلد العام
                      try {
                        // إنشاء ملف blob
                        const blob = new Blob([vCardText], { type: 'text/vcard' });
                        
                        // تنزيل محلي للمستخدم
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'karim-contact.vcf';
                        document.body.appendChild(a);
                        a.click();
                        
                        // تنظيف
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        
                        // تحويل Blob إلى File لإرساله في FormData
                        const file = new File([blob], 'karim-contact.vcf', { type: 'text/vcard' });
                        
                        // إنشاء FormData وإضافة الملف والمسار
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('path', '/karim-contact.vcf');
                        
                        // إرسال الطلب إلى API
                        fetch('/api/upload', {
                          method: 'POST',
                          body: formData
                        })
                        .then(response => {
                          if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                          }
                          return response.json();
                        })
                        .then(data => {
                          console.log("تم حفظ ملف VCard بنجاح:", data);
                          toast.success("تم حفظ بطاقة التواصل بنجاح");
                        })
                        .catch(error => {
                          console.error("خطأ في حفظ بطاقة التواصل:", error);
                          toast.error(`حدث خطأ أثناء حفظ بطاقة التواصل: ${error.message}`);
                        });
                      } catch (error) {
                        console.error("خطأ في إنشاء ملف بطاقة التواصل:", error);
                        toast.error("حدث خطأ أثناء إنشاء ملف بطاقة التواصل");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <FaSave className="inline ml-2" /> حفظ بطاقة التواصل
                  </button>
                </div>
                
                <div>
                  <a
                    href="/karim-contact.vcf"
                    download
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors inline-flex items-center"
                  >
                    <FaDownload className="mr-2" /> معاينة بطاقة التواصل الحالية
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
};

// إضافة دالة لعرض الأيقونات
const getContactIcon = (iconName: string) => {
  switch (iconName) {
    case 'FaPhone':
      return <FaPhone className="inline" />;
    case 'FaEnvelope':
      return <FaEnvelope className="inline" />;
    case 'FaWhatsapp':
      return <FaWhatsapp className="inline" />;
    case 'FaMapMarkerAlt':
      return <FaMapMarkerAlt className="inline" />;
    case 'FaFacebook':
      return <FaFacebook className="inline" />;
    case 'FaInstagram':
      return <FaInstagram className="inline" />;
    case 'FaTwitter':
      return <FaTwitter className="inline" />;
    case 'FaYoutube':
      return <FaYoutube className="inline" />;
    case 'FaLinkedin':
      return <FaLinkedin className="inline" />;
    case 'FaGlobe':
      return <FaGlobe className="inline" />;
    default:
      return <FaLink className="inline" />;
  }
};

// الخطأ في التحميل
const handleError = (error: unknown, message: string) => {
  console.error(message, error);
  if (error instanceof Error) {
    return `${message}: ${error.message}`;
  }
  return message;
};

// معالجة خطأ التحميل
const handleUploadError = (uploadError: unknown) => {
  console.error("خطأ في رفع الصورة:", uploadError);
  alert(handleError(uploadError, "حدث خطأ أثناء رفع الصورة"));
};

// الحصول على أيقونة وسائل التواصل الاجتماعي
const getSocialIcon = (iconName: string) => {
  return getContactIcon(iconName);
};

// مكون تعديل وضبط الصورة
const ImageCropper = ({ imageUrl, onCropChange, aspectRatio = 0.8 }: { imageUrl: string, onCropChange: (position: {x: number, y: number, scale: number}) => void, aspectRatio?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, scale: 1 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    // محاولة استرجاع موضع الصورة من التخزين المحلي عند تحميل المكون
    try {
      const savedData = localStorage.getItem('profileImagePosition');
      if (savedData) {
        const savedPosition = JSON.parse(savedData);
        // تحقق من أن الصورة المحفوظة هي نفسها الصورة الحالية
        if (savedPosition.url === imageUrl) {
          console.log("استعادة موضع الصورة المحفوظ:", savedPosition.position);
          setPosition(savedPosition.position);
          // إرسال الموضع المحفوظ إلى المكون الأب
          onCropChange(savedPosition.position);
          return;
        }
      }
    } catch (error) {
      console.error("خطأ في استعادة موضع الصورة:", error);
    }
    
    // إذا لم يتم العثور على بيانات محفوظة، استخدام الوضع الافتراضي
    setPosition({ x: 0, y: 0, scale: 1 });
  }, [imageUrl, onCropChange]);
  
  // باقي الكود كما هو
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    setIsDragging(true);
    setStartPos({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    e.preventDefault();
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!imageRef.current || e.touches.length !== 1) return;
    
    setIsDragging(true);
    setStartPos({
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y
    });
    
    e.preventDefault();
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    // حساب الحدود القصوى للتحريك
    const maxX = (imageRect.width * position.scale - containerRect.width) / 2;
    const maxY = (imageRect.height * position.scale - containerRect.height) / 2;
    
    let newX = e.clientX - startPos.x;
    let newY = e.clientY - startPos.y;
    
    // تقييد الحركة داخل حدود العنصر الحاوي
    newX = Math.max(-maxX, Math.min(maxX, newX));
    newY = Math.max(-maxY, Math.min(maxY, newY));
    
    setPosition(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
    
    // إرسال التغيير إلى الأعلى
    onCropChange({ x: newX, y: newY, scale: position.scale });
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current || !imageRef.current || e.touches.length !== 1) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    // حساب الحدود القصوى للتحريك
    const maxX = (imageRect.width * position.scale - containerRect.width) / 2;
    const maxY = (imageRect.height * position.scale - containerRect.height) / 2;
    
    let newX = e.touches[0].clientX - startPos.x;
    let newY = e.touches[0].clientY - startPos.y;
    
    // تقييد الحركة داخل حدود العنصر الحاوي
    newX = Math.max(-maxX, Math.min(maxX, newX));
    newY = Math.max(-maxY, Math.min(maxY, newY));
    
    setPosition(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
    
    // إرسال التغيير إلى الأعلى
    onCropChange({ x: newX, y: newY, scale: position.scale });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    // تحديث حجم الصورة عند استخدام عجلة الماوس
    const delta = -e.deltaY;
    const scaleChange = delta > 0 ? 0.1 : -0.1;
    const newScale = Math.max(1, Math.min(3, position.scale + scaleChange));
    
    setPosition(prev => ({
      ...prev,
      scale: newScale
    }));
    
    // إرسال التغيير إلى الأعلى
    onCropChange({ x: position.x, y: position.y, scale: newScale });
  };
  
  // تفعيل الاستماع لأحداث المستند لمتابعة الحركة حتى خارج العنصر
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (containerRef.current && imageRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const imageRect = imageRef.current.getBoundingClientRect();
          
          const maxX = (imageRect.width * position.scale - containerRect.width) / 2;
          const maxY = (imageRect.height * position.scale - containerRect.height) / 2;
          
          let newX = e.clientX - startPos.x;
          let newY = e.clientY - startPos.y;
          
          newX = Math.max(-maxX, Math.min(maxX, newX));
          newY = Math.max(-maxY, Math.min(maxY, newY));
          
          setPosition(prev => ({
            ...prev,
            x: newX,
            y: newY
          }));
          
          onCropChange({ x: newX, y: newY, scale: position.scale });
        }
      };
      
      const handleGlobalTouchMove = (e: TouchEvent) => {
        if (e.touches.length !== 1 || !containerRef.current || !imageRef.current) return;
        
        const containerRect = containerRef.current.getBoundingClientRect();
        const imageRect = imageRef.current.getBoundingClientRect();
        
        const maxX = (imageRect.width * position.scale - containerRect.width) / 2;
        const maxY = (imageRect.height * position.scale - containerRect.height) / 2;
        
        let newX = e.touches[0].clientX - startPos.x;
        let newY = e.touches[0].clientY - startPos.y;
        
        newX = Math.max(-maxX, Math.min(maxX, newX));
        newY = Math.max(-maxY, Math.min(maxY, newY));
        
        setPosition(prev => ({
          ...prev,
          x: newX,
          y: newY
        }));
        
        onCropChange({ x: newX, y: newY, scale: position.scale });
      };
      
      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };
      
      const handleGlobalTouchEnd = () => {
        setIsDragging(false);
      };
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('touchmove', handleGlobalTouchMove);
      document.addEventListener('touchend', handleGlobalTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging, startPos, position.scale, onCropChange]);
  
  return (
    <div className="flex flex-col items-center">
      <div
        ref={containerRef}
        className="relative w-full max-w-md h-0 pb-[125%] overflow-hidden border border-white/20 rounded-2xl shadow-[0_0_25px_rgba(8,112,184,0.3)] cursor-move touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-transparent z-10 mix-blend-overlay"></div>
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
            transformOrigin: 'center',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="معاينة الصورة الشخصية"
            className="w-full h-full object-contain p-1.5 rounded-2xl"
            draggable="false"
            onDragStart={e => e.preventDefault()}
          />
        </div>
        {/* تأثير خفيف متدرج من الأسفل للأعلى */}
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent z-20 rounded-b-2xl"></div>
      </div>
      
      <div className="flex items-center space-x-4 mt-4 w-full max-w-md px-2">
        <button
          onClick={() => {
            setPosition(prev => ({ ...prev, scale: Math.max(1, prev.scale - 0.1) }));
            onCropChange({ ...position, scale: Math.max(1, position.scale - 0.1) });
          }}
          className="p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600"
          title="تصغير"
        >
          <FaMinus />
        </button>
        
        <input 
          type="range" 
          min="1" 
          max="3" 
          step="0.1" 
          value={position.scale} 
          onChange={e => {
            const newScale = parseFloat(e.target.value);
            setPosition(prev => ({ ...prev, scale: newScale }));
            onCropChange({ ...position, scale: newScale });
          }}
          className="w-full bg-gray-700 h-1 rounded-full appearance-none"
        />
        
        <button
          onClick={() => {
            setPosition(prev => ({ ...prev, scale: Math.min(3, prev.scale + 0.1) }));
            onCropChange({ ...position, scale: Math.min(3, position.scale + 0.1) });
          }}
          className="p-2 bg-gray-700 rounded-full text-white hover:bg-gray-600"
          title="تكبير"
        >
          <FaPlus />
        </button>
      </div>
      
      <div className="text-xs text-gray-400 mt-2 text-center">
        <p>اسحب الصورة لضبط الموضع - استخدم عجلة الماوس أو شريط التمرير للتكبير/التصغير</p>
      </div>
    </div>
  );
};

export default AdminPage; 
