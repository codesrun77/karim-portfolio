"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FaMicrophone, FaHeadphones, FaUniversity, FaUserGraduate, FaAward, FaCertificate, FaBriefcase, FaTv, FaFilm, FaYoutube, FaGraduationCap, FaTrophy, FaDownload } from "react-icons/fa";
import gsap from "gsap";
import Image from "next/image";
import { getTimelineItems, getCVFiles, incrementCVDownloadCount } from "@/lib/firebase/data-service";
import { TimelineItem, CVInfo } from "@/types";

const TimelineSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [timelineData, setTimelineData] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cvData, setCvData] = useState<CVInfo | null>(null);
  
  // تحميل بيانات التايم لاين من Firebase
  useEffect(() => {
    const loadTimelineData = async () => {
      try {
        setIsLoading(true);
        console.log("تحميل بيانات التايم لاين...");
        const data = await getTimelineItems();
        console.log(`تم تحميل ${data.length} عنصر من بيانات التايم لاين`);
        
        if (data && data.length > 0) {
          // ترتيب البيانات حسب السنة (من الأحدث إلى الأقدم)
          const sortedData = [...data]
            .filter(item => item.isActive !== false) // استبعاد العناصر المعطلة
            .sort((a, b) => parseInt(b.year) - parseInt(a.year));
          
          console.log(`عدد العناصر بعد الفلترة: ${sortedData.length}`);
          setTimelineData(sortedData);
        } else {
          console.warn("لم يتم العثور على بيانات للتايم لاين");
          setTimelineData([]);
        }
      } catch (error) {
        console.error("خطأ في تحميل بيانات التايم لاين:", error);
        setTimelineData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTimelineData();
    
    // إعادة تحميل البيانات كل دقيقة للتأكد من تحديثها
    const interval = setInterval(() => {
      loadTimelineData();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // تحميل ملف السيرة الذاتية
  useEffect(() => {
    const loadCVData = async () => {
      try {
        console.log("تحميل بيانات السيرة الذاتية...");
        const cvFiles = await getCVFiles();
        if (cvFiles && cvFiles.length > 0) {
          // البحث عن السيرة الذاتية النشطة
          const activeCV = cvFiles.find(cv => cv.isActive);
          if (activeCV) {
            console.log("تم العثور على ملف السيرة الذاتية النشط:", activeCV.title);
            setCvData(activeCV);
          } else {
            // إذا لم يكن هناك ملف نشط، استخدم الأول
            console.log("لا يوجد ملف نشط، استخدام أول ملف:", cvFiles[0].title);
            setCvData(cvFiles[0]);
          }
        } else {
          console.warn("لم يتم العثور على ملفات للسيرة الذاتية، استخدام الملف الافتراضي");
          // استخدام ملف افتراضي في حالة عدم وجود بيانات
          setCvData({
            id: "cv-default",
            title: "السيرة الذاتية الرئيسية",
            fileUrl: "/cv/CV_default.pdf",
            version: "1.0",
            downloadCount: 0,
            lastUpdate: new Date().toISOString(),
            isActive: true
          });
        }
      } catch (error) {
        console.error("خطأ في تحميل بيانات السيرة الذاتية:", error);
        // استخدام ملف افتراضي في حالة حدوث خطأ
        setCvData({
          id: "cv-default",
          title: "السيرة الذاتية الرئيسية",
          fileUrl: "/cv/CV_default.pdf",
          version: "1.0",
          downloadCount: 0,
          lastUpdate: new Date().toISOString(),
          isActive: true
        });
      }
    };
    
    loadCVData();
  }, []);

  // معالج التنزيل
  const handleDownloadCV = async () => {
    try {
      // استخدام مسار ثابت للملف PDF الجديد
      const downloadUrl = cvData?.fileUrl || '/cv/CV_default.pdf';
      
      console.log("جاري تنزيل السيرة الذاتية من المسار:", downloadUrl);
      
      // فتح ملف السيرة الذاتية في نافذة جديدة
      window.open(downloadUrl, '_blank');
      
      // محاولة تحديث عداد التنزيل إذا كان هناك سيرة ذاتية
      if (cvData) {
        try {
          await incrementCVDownloadCount(cvData.id);
          console.log("تم زيادة عداد التنزيل بنجاح");
        } catch (error) {
          console.log("تعذر تحديث عداد التنزيل ولكن تم فتح الملف بنجاح");
        }
      }
    } catch (error) {
      console.error("خطأ في تنزيل السيرة الذاتية:", error);
      // استخدام alert للإشارة إلى المشكلة
      alert("حدث خطأ أثناء محاولة تنزيل السيرة الذاتية");
    }
  };

  useEffect(() => {
    if (isInView && sectionRef.current) {
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.timeline-item'),
        { 
          opacity: 0,
          x: (index, target) => {
            if (window.innerWidth >= 1024) {
              return index % 2 === 0 ? -50 : 50;
            }
            return 0;
          },
          y: 30
        },
        { 
          opacity: 1, 
          x: 0, 
          y: 0, 
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out" 
        }
      );
    }
  }, [isInView, timelineData]);
  
  // الحصول على الأيقونة المناسبة
  const getIcon = (iconName: string | undefined): React.ReactElement => {
    switch(iconName) {
      case 'FaMicrophone': return <FaMicrophone className="text-2xl" />;
      case 'FaHeadphones': return <FaHeadphones className="text-2xl" />;
      case 'FaTv': return <FaTv className="text-2xl" />;
      case 'FaFilm': return <FaFilm className="text-2xl" />;
      case 'FaYoutube': return <FaYoutube className="text-2xl" />;
      case 'FaAward': return <FaAward className="text-2xl" />;
      case 'FaCertificate': return <FaCertificate className="text-2xl" />;
      case 'FaBriefcase': return <FaBriefcase className="text-2xl" />;
      case 'FaUniversity': return <FaUniversity className="text-2xl" />;
      case 'FaGraduationCap': return <FaGraduationCap className="text-2xl" />;
      case 'FaTrophy': return <FaTrophy className="text-2xl" />;
      default: return <FaBriefcase className="text-2xl" />;
    }
  };
  
  // دمج جميع البيانات وترتيبها حسب السنة (من الأحدث إلى الأقدم)
  const allTimelineItems = [...timelineData].sort((a, b) => {
    return parseInt(b.year) - parseInt(a.year);
  });
  
  // الحصول على تصنيف العنصر
  const getCategoryLabel = (category: 'tv' | 'film' | 'program'): string => {
    switch(category) {
      case 'tv': return 'قنوات وإذاعات';
      case 'film': return 'أفلام ومسلسلات';
      case 'program': return 'برامج ووثائقيات';
      default: return 'أخرى';
    }
  };
  
  // الحصول على لون التصنيف
  const getCategoryColor = (category: 'tv' | 'film' | 'program'): string => {
    switch(category) {
      case 'tv': return 'bg-gradient-to-r from-blue-600 to-blue-500';
      case 'film': return 'bg-gradient-to-r from-purple-600 to-purple-500';
      case 'program': return 'bg-gradient-to-r from-green-600 to-green-500';
      default: return 'bg-gradient-to-r from-blue-600 to-blue-500';
    }
  };
  
  // الحصول على لون نص التصنيف
  const getCategoryTextColor = (category: 'tv' | 'film' | 'program'): string => {
    switch(category) {
      case 'tv': return 'blue-300';
      case 'film': return 'purple-300';
      case 'program': return 'green-300';
      default: return 'blue-300';
    }
  };

  return (
    <section id="timeline" className="py-20 bg-gradient-to-b from-gray-950 to-gray-900 overflow-hidden">
      <div className="container mx-auto px-4" ref={sectionRef}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient bg-gradient-to-r from-blue-500 to-purple-600 inline-block">السيرة الذاتية</h2>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            تضم مسيرتي المهنية العديد من المشاريع والإنجازات في مجال هندسة الصوت والمونتاج والإنتاج.
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <button 
              onClick={handleDownloadCV}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-blue-600/20"
            >
              <FaDownload /> تحميل السيرة الذاتية كاملة
              <span className="text-xs opacity-80 mr-2">(النسخة الحالية)</span>
            </button>
          </motion.div>
        </motion.div>
        
        {/* خط الزمن */}
        <div className="relative">
          {/* الخط الرأسي */}
          <div className="absolute h-full w-1 bg-blue-900/50 lg:left-1/2 md:left-[80px] sm:left-[65px] left-[65px] transform -translate-x-1/2 z-0"></div>
          
          {/* عناصر الخط الزمني */}
          <div className="relative z-10">
            {isLoading ? (
              // حالة التحميل
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : allTimelineItems.length === 0 ? (
              // رسالة في حالة عدم وجود بيانات
              <div className="text-center py-10">
                <p className="text-gray-400 text-lg">لا توجد بيانات متاحة في الخط الزمني</p>
              </div>
            ) : (
              // عرض عناصر التايم لاين
              allTimelineItems.map((item, index) => (
                <div 
                  key={item.id}
                  className={`timeline-item flex md:items-start mb-14 relative ${
                    index % 2 === 0 
                      ? "lg:flex-row md:flex-row flex-row" 
                      : "lg:flex-row-reverse md:flex-row flex-row"
                  }`}
                >
                  {/* النقطة في المنتصف */}
                  <div className="absolute lg:left-1/2 md:left-[80px] sm:left-[65px] left-[65px] transform -translate-x-1/2 flex items-center justify-center">
                    <div className={`w-10 h-10 rounded-full ${item.category === 'tv' ? 'bg-blue-500' : (item.category === 'film' ? 'bg-purple-500' : 'bg-green-500')} border-4 border-gray-900 z-10 flex items-center justify-center`}>
                      {getIcon(item.icon)}
                    </div>
                  </div>
                  
                  {/* محتوى عنصر التايم لاين */}
                  <div className={`lg:w-5/12 md:w-8/12 w-9/12 ${
                    index % 2 === 0 
                      ? 'lg:mr-auto lg:ml-0 lg:pl-10 md:mr-0 md:ml-auto md:pl-10 ml-auto pl-8' 
                      : 'lg:ml-auto lg:mr-0 lg:pr-10 md:mr-0 md:ml-auto md:pl-10 ml-auto pl-8'
                  }`}>
                    <div className={`bg-gradient-to-br from-gray-900 to-gray-800/90 backdrop-blur-sm p-4 md:p-6 rounded-lg shadow-lg border-2 border-gray-800 relative ${
                      index % 2 === 0 
                        ? 'lg:text-left md:text-left text-left' 
                        : 'lg:text-right md:text-left text-left'
                    }`}>
                      {/* المثلث المؤشر - يظهر فقط في الشاشات الكبيرة */}
                      <div className={`lg:block hidden absolute top-6 ${
                        index % 2 === 0 
                          ? 'left-0 -translate-x-full border-r-[20px]' 
                          : 'right-0 translate-x-full border-l-[20px]'
                      } border-y-[15px] border-y-transparent ${
                        index % 2 === 0 
                          ? 'border-r-gray-800' 
                          : 'border-l-gray-800'
                      }`}></div>
                      
                      {/* سنة العمل */}
                      <div className={`${getCategoryColor(item.category)} text-white text-lg font-bold w-fit mb-3 px-4 py-1 rounded-lg ${
                        index % 2 === 0 
                          ? '' 
                          : 'lg:mr-auto'
                      }`}>
                        {item.year}
                      </div>
                      
                      {/* المسمى الوظيفي والجهة */}
                      <h4 className="text-xl md:text-2xl font-bold text-white mb-2">
                        {item.title}
                      </h4>
                      <p className={`text-${getCategoryTextColor(item.category)} text-lg mb-1`}>
                        {item.company}
                      </p>
                      {item.description && (
                        <p className="text-gray-400 text-sm mt-2">{item.description}</p>
                      )}
                      <div className={`text-sm bg-gray-800/50 w-fit px-3 py-1 rounded-full mt-2 border border-gray-700 ${
                        index % 2 === 0 
                          ? '' 
                          : 'lg:mr-auto lg:ml-0'
                      }`}>
                        {getCategoryLabel(item.category)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* نهاية التايم لاين */}
          <div className="absolute lg:left-1/2 md:left-[80px] sm:left-[65px] left-[65px] -bottom-10 transform -translate-x-1/2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-4 border-gray-900 flex items-center justify-center">
              <FaUserGraduate className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection; 