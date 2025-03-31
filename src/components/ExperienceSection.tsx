"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { FaMicrophone, FaHeadphones, FaFilm, FaMusic, FaCompactDisc, FaUserTie, FaTrophy, FaBroadcastTower, FaAward, FaBriefcase, FaVideo } from "react-icons/fa";
import Image from "next/image";
import gsap from "gsap";
import { getExperiences } from "@/lib/firebase/data-service";
import { Experience } from "@/types";
import React from "react";

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "FaHeadphones":
      return <FaHeadphones className="text-2xl text-blue-400" />;
    case "FaMusic":
      return <FaMusic className="text-2xl text-blue-400" />;
    case "FaMicrophone":
      return <FaMicrophone className="text-2xl text-blue-400" />;
    default:
      return <FaAward className="text-2xl text-blue-400" />;
  }
};

// تعريف نوع البيانات المحلي
interface LocalExperience extends Omit<Experience, 'icon'> {
  icon: React.ReactNode;
}

const ExperienceSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const [experienceData, setExperienceData] = useState<LocalExperience[]>([]);
  
  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    const loadExperiences = async () => {
      try {
        console.log("=== بدء تحميل الخبرات في ExperienceSection ===");
        
        // التأكد من أننا في بيئة العميل
        if (typeof window === 'undefined') {
          console.log("المكون يعمل على جانب الخادم، لن يتم تحميل البيانات");
          return;
        }
        
        // تأخير بسيط لضمان تجنب مشاكل hydration
        setTimeout(async () => {
          // استخدام خدمة البيانات الجديدة للحصول على البيانات
          const data = await getExperiences();
          console.log("ExperienceSection: البيانات المستلمة من getExperiences:", data);
          
          if (data && Array.isArray(data) && data.length > 0) {
            // تحويل البيانات إلى التنسيق المحلي مع إضافة أيقونات
            const formattedData: LocalExperience[] = data.map(item => {
              // تحديد الأيقونة المناسبة بناء على العنوان
              let icon: React.ReactNode = <FaBriefcase />;
              if (item.icon === "FaHeadphones") icon = <FaHeadphones />;
              else if (item.icon === "FaMusic") icon = <FaMusic />;
              else if (item.icon === "FaMicrophone") icon = <FaMicrophone />;
              else if (item.icon === "FaVideo") icon = <FaVideo />;
              
              return {
                ...item,
                icon
              };
            });
            
            setExperienceData(formattedData);
          } else {
            console.log("لم يتم العثور على خبرات، استخدام البيانات الافتراضية");
            setExperienceData([]);
          }
          
          console.log("اكتمل تحميل البيانات في ExperienceSection");
        }, 500);
      } catch (error) {
        console.error("خطأ في تحميل الخبرات:", error);
        setExperienceData([]);
      }
    };

    // تنفيذ دالة التحميل
    loadExperiences();
  }, []);
  
  useEffect(() => {
    if (sectionRef.current && isInView) {
      // تأثيرات GSAP للعناصر المختلفة
      gsap.utils.toArray(".experience-item").forEach((item: any, i) => {
        gsap.to(item, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.2,
          ease: "power3.out"
        });
      });
    }
  }, [isInView]);
  
  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-900 to-black"
    >
      {/* طبقة الضوضاء */}
      <div className="absolute inset-0 bg-noise opacity-5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">الخبرات المهنية</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2"></div>
        </motion.div>
        
        {/* محتوى الخبرات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {experienceData.map((experience, index) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group"
            >
              <div className="p-3 mb-4 inline-block rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                {experience.icon}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {experience.title}
              </h3>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-blue-400 font-semibold">{experience.company}</span>
                <span className="text-sm px-3 py-1 rounded-full bg-white/5 text-gray-400">
                  {experience.period}
                </span>
              </div>
              
              <p className="text-gray-300 font-light">
                {experience.description}
              </p>
              
              <div className="h-1 w-0 group-hover:w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"></div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* زخرفة */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl"></div>
    </section>
  );
};

export default ExperienceSection; 