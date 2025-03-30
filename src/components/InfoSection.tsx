"use client";

import { useRef, useEffect, useState, Fragment } from "react";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { FaUniversity, FaCalendarAlt, FaFlag, FaMapMarkerAlt, FaInfoCircle } from "react-icons/fa";
import { getPersonalInfo } from "@/lib/firebase/data-service";
import { PersonalInfo } from "@/types";

// تعريف نوع البيانات المحلي
interface LocalPersonalInfo {
  id: string;
  icon: string;
  title: string;
  info: string;
  extra: string | null;
}

export default function InfoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [isLoading, setIsLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<LocalPersonalInfo[]>([]);
  
  // البيانات الافتراضية
  const defaultPersonalInfo: LocalPersonalInfo[] = [
    {
      id: "education",
      icon: "FaUniversity",
      title: "التعليم",
      info: "بكاليريوس المعهد العالي للسينما",
      extra: "قسم هندسة صوت - عام التخرج 2012"
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
  
  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    console.log("[InfoSection] تحميل المكون...");  // تسجيل بدء تحميل المكون
    
    const loadData = async () => {
      try {
        console.log("[InfoSection] بدء تحميل المعلومات الشخصية");
        setIsLoading(true);

        // تأكد من أن البيانات الافتراضية تظهر أثناء التحميل
        console.log("[InfoSection] تعيين البيانات الافتراضية:", defaultPersonalInfo);
        setPersonalInfo(defaultPersonalInfo);

        // تحميل البيانات
        console.log("[InfoSection] استدعاء getPersonalInfo()...");
        const data = await getPersonalInfo();
        console.log("[InfoSection] البيانات المستلمة من getPersonalInfo:", data);
        
        if (!data) {
          console.warn("[InfoSection] لا توجد بيانات مستلمة (قيمة فارغة)");
          return; // نستخدم البيانات الافتراضية المعينة مسبقاً
        }

        if (Array.isArray(data)) {
          console.log(`[InfoSection] تم استلام مصفوفة بطول ${data.length}`);
          
          if (data.length === 0) {
            console.warn("[InfoSection] المصفوفة المستلمة فارغة، الإبقاء على البيانات الافتراضية");
            return; // نستخدم البيانات الافتراضية المعينة مسبقاً
          }
          
          // تحويل البيانات من PersonalInfo إلى LocalPersonalInfo
          const formattedData: LocalPersonalInfo[] = data.map((item, index) => {
            console.log("[InfoSection] معالجة عنصر:", item);
            
            // تحديد الأيقونة المناسبة بناءً على العنوان أو استخدام الأيقونة الموجودة
            let iconName = "FaInfoCircle";
            const title = (item.title || "").toLowerCase();
            
            if (title.includes("تعليم") || title.includes("دراس")) iconName = "FaUniversity";
            else if (title.includes("ميلاد") || title.includes("تاريخ")) iconName = "FaCalendarAlt";
            else if (title.includes("جنسية")) iconName = "FaFlag";
            else if (title.includes("اقامة") || title.includes("موقع")) iconName = "FaMapMarkerAlt";
            
            // استخدام الأيقونة المخزنة في Firebase إذا كانت موجودة
            const finalIcon = item.icon || iconName;
            
            // استخراج المعلومات الرئيسية والإضافية
            let info = '';
            let extra: string | null = null;
            
            if (item.content) {
              if (item.content.includes(' - ')) {
                const parts = item.content.split(' - ');
                info = parts[0].trim();
                extra = parts.length > 1 ? parts[1].trim() : null;
              } else {
                info = item.content.trim();
              }
            } else {
              info = "بلا معلومات";
            }
            
            return {
              id: item.id || `info-${index}`,
              icon: finalIcon,
              title: item.title || "بلا عنوان",
              info,
              extra
            };
          });
          
          console.log("[InfoSection] البيانات بعد التحويل:", formattedData);
          if (formattedData.length > 0) {
            setPersonalInfo(formattedData);
          }
        } else {
          console.warn("[InfoSection] البيانات المستلمة ليست مصفوفة:", typeof data);
          // نبقي على البيانات الافتراضية
        }
      } catch (error) {
        console.error("[InfoSection] خطأ في تحميل المعلومات الشخصية:", error);
        // نبقي على البيانات الافتراضية
      } finally {
        console.log("[InfoSection] انتهاء عملية التحميل، isLoading = false");
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // تحديد الأيقونة المناسبة
  const getIconComponent = (iconName: string) => {
    // إزالة أي classes قد تكون موجودة في الأيقونة بالفعل
    const cleanIconName = iconName.replace(/\s.*$/, '');
    
    switch(cleanIconName) {
      case "FaUniversity":
        return <FaUniversity className="text-current" />;
      case "FaCalendarAlt":
        return <FaCalendarAlt className="text-current" />;
      case "FaFlag":
        return <FaFlag className="text-current" />;
      case "FaMapMarkerAlt":
        return <FaMapMarkerAlt className="text-current" />;
      default:
        return <FaInfoCircle className="text-current" />;
    }
  };

  useEffect(() => {
    if (isInView && sectionRef.current) {
      // تأثير دخول المعلومات
      const items = sectionRef.current.querySelectorAll('.info-item');
      gsap.fromTo(items, 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power2.out" }
      );
      
      // تأثير الأيقونات المضيئة
      const icons = sectionRef.current.querySelectorAll('.icon-container');
      gsap.fromTo(icons, 
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.15, duration: 0.8, ease: "back.out(1.7)" }
      );
    }
  }, [isInView, personalInfo]);

  console.log("[InfoSection] isLoading =", isLoading, "، personalInfo.length =", personalInfo.length);

  if (isLoading) {
    console.log("[InfoSection] عرض حالة التحميل...");
    return (
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-95"></div>
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-300 mt-4">جاري تحميل المعلومات الشخصية...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  console.log("[InfoSection] عرض البيانات، عدد العناصر:", personalInfo.length);

  return (
    <section ref={sectionRef} className="info-section py-20 md:py-28 relative overflow-hidden z-10">
      {/* الخلفية المتدرجة والزخارف */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-95"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-noise"></div>
      
      {/* الأشكال الزخرفية */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-blue-800/5 blur-3xl"></div>
      
      <div className="container relative z-20 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <h2 className="inline-block text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 mb-3">
            المعلومات الشخصية
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-indigo-500 mx-auto mt-2"></div>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
            نبذة عن المعلومات الأساسية والخلفية المهنية
          </p>
        </motion.div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-300 mt-4">جاري تحميل المعلومات الشخصية...</p>
            </div>
          </div>
        ) : personalInfo && personalInfo.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-20">
            {personalInfo.map((item, index) => (
              <motion.div 
                key={item.id || index} 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className="group info-item relative !block"
                style={{ display: 'block', opacity: 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-700/10 rounded-xl blur-[2px] group-hover:blur-[1px] transition-all duration-300"></div>
                <div className="relative bg-gray-800/70 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden h-full transform transition-all duration-300 group-hover:translate-y-[-5px] group-hover:shadow-xl !block">
                  {/* الخلفية البراقة للعنصر */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  
                  <div className="p-6 relative z-10 flex flex-col items-center text-center h-full">
                    {/* أيقونة العنوان مع تأثيرات متحركة */}
                    <div className="icon-container w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-indigo-700/25 mb-4 p-3 relative overflow-hidden group-hover:from-blue-600/30 group-hover:to-indigo-700/35 transition-all duration-300 !flex">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 animate-pulse bg-blue-500/10"></div>
                      </div>
                      <div className="text-3xl text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                        {getIconComponent(item.icon)}
                      </div>
                    </div>
                    
                    {/* عنوان العنصر */}
                    <h3 className="text-lg font-semibold text-gray-200 mb-3 group-hover:text-white transition-colors duration-300">
                      {item.title}
                    </h3>
                    
                    {/* محتوى العنصر */}
                    {item.info !== "بلا معلومات" ? (
                      <>
                        <p className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors duration-300">
                          {item.info}
                        </p>
                        {item.extra && (
                          <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors duration-300">
                            {item.extra}
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="bg-yellow-500/10 px-4 py-2 rounded-lg">
                        <p className="text-yellow-400 font-medium">لا توجد معلومات متاحة</p>
                      </div>
                    )}
                    
                    {/* تأثير التوهج في الخلفية */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="bg-gray-800/70 backdrop-blur-sm border border-white/5 rounded-xl p-6 max-w-md">
              <p className="text-yellow-400 text-center">لا توجد معلومات شخصية متاحة حالياً. يرجى إضافة المعلومات من لوحة التحكم.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
} 