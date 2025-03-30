"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Image from "next/image";
import gsap from "gsap";
import { FaPlayCircle, FaPauseCircle, FaVolumeUp, FaVolumeMute, FaExpand, FaHeadphones, FaMusic, FaMicrophone, FaFilm, FaAward, FaAddressCard } from "react-icons/fa";
import { getHeroInfo } from "@/lib/firebase/data-service";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import VCardDownloader from "./VCardDownloader";

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: [0.215, 0.610, 0.355, 1.000] // cubic-bezier
    }
  })
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.1 + 1,
      duration: 0.5,
      type: "spring",
      stiffness: 200,
      damping: 10
    }
  })
};

// تعريف نوع البيانات للقسم الرئيسي
interface HeroData {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  profileImage?: string;
  showProfileImage: boolean;
}

// البيانات الافتراضية
const defaultHeroInfo: HeroData = {
  name: "كريم السيد",
  title: "مهندس صوت محترف",
  bio: "أعمل في مجال هندسة الصوت منذ أكثر من 10 سنوات، قمت خلالها بالعمل في العديد من الأفلام والمسلسلات والإعلانات. أسعى دائماً لتقديم أفضل جودة صوتية ممكنة لجميع المشاريع.",
  skills: ["هندسة صوت", "مونتاج", "موسيقى", "إنتاج"],
  profileImage: "/images/profile.jpg",
  showProfileImage: true
};

// وظيفة لتحميل البيانات من Firestore
const getFirebaseHeroInfo = async (): Promise<HeroData | null> => {
  try {
    console.log("محاولة تحميل معلومات القسم الرئيسي من Firestore...");
    
    // التحقق من وجود db قبل استخدامه
    if (!db) {
      console.error("Firestore غير متاح");
      throw new Error("Firestore غير متاح");
    }
    
    const docRef = doc(db, "siteData", "heroInfo");
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("تم العثور على بيانات القسم الرئيسي في Firestore");
      const data = docSnap.data();
      // التحقق من وجود جميع الحقول المطلوبة
      if (data.name && data.title && data.bio && Array.isArray(data.skills)) {
        return data as HeroData;
      } else {
        console.log("البيانات غير مكتملة في Firestore");
        return null;
      }
    } else {
      console.log("لم يتم العثور على بيانات القسم الرئيسي في Firestore");
      return null;
    }
  } catch (error) {
    console.error("خطأ في تحميل بيانات القسم الرئيسي من Firestore:", error);
    return null;
  }
};

const HeroSection = () => {
  const [particles, setParticles] = useState<any[]>([]);
  const [hoverSkill, setHoverSkill] = useState<string | null>(null);
  const [heroInfo, setHeroInfo] = useState<HeroData>(defaultHeroInfo);
  const [imagePosition, setImagePosition] = useState<{x: number, y: number, scale: number}>({x: 0, y: 0, scale: 1});
  const heroRef = useRef<HTMLDivElement>(null);
  const [showVCardDownloader, setShowVCardDownloader] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  
  // إنشاء جزيئات عشوائية
  useEffect(() => {
    const generatedParticles = Array(15).fill(0).map(() => ({
      width: Math.random() * 100 + 30,
      height: Math.random() * 100 + 30,
      left: Math.random() * 100,
      top: Math.random() * 100,
      opacity: Math.random() * 0.15 + 0.05,
      blur: Math.random() * 10 + 5
    }));
    
    setParticles(generatedParticles);
  }, []);
  
  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    const loadHeroInfo = async () => {
      try {
        console.log("=== بدء تحميل البيانات في مكون HeroSection ===");
        
        // التأكد من أننا في بيئة العميل
        if (typeof window === 'undefined') {
          console.log("المكون يعمل على جانب الخادم، لن يتم تحميل البيانات");
          return;
        }
        
        console.log("مكون HeroSection في بيئة العميل، سيتم تحميل البيانات بعد تأخير قصير...");
        
        // تأخير أطول لضمان استقرار البيانات
        setTimeout(async () => {
          try {
            console.log("بدء تحميل البيانات بعد التأخير...");
            
            // استخدام خدمة البيانات الجديدة للحصول على البيانات
            const data = await getHeroInfo();
            console.log("HeroSection: البيانات المستلمة من getHeroInfo:", data);
            
            // التحقق من البيانات بشكل مفصل
            if (data) {
              console.log("تفاصيل البيانات المستلمة: name:", !!data.name, "title:", !!data.title, "bio:", !!data.bio, "skills:", Array.isArray(data.skills));
              
              if (data.name && data.title) {
                console.log("البيانات كاملة، تحديث الحالة");
                setHeroInfo(data);
              } else {
                console.log("البيانات غير مكتملة، استخدام البيانات الافتراضية:", defaultHeroInfo);
                setHeroInfo(defaultHeroInfo);
              }
            } else {
              console.log("لم يتم استلام بيانات، استخدام البيانات الافتراضية");
              setHeroInfo(defaultHeroInfo);
            }
            
            console.log("اكتمل تحميل البيانات في مكون HeroSection");
          } catch (error) {
            console.error("خطأ داخل دالة التحميل المؤجلة:", error);
            setHeroInfo(defaultHeroInfo);
          }
        }, 1000); // زيادة وقت التأخير لضمان اكتمال تهيئة Firebase
      } catch (error) {
        console.error("خطأ في تحميل المعلومات في HeroSection:", error);
        setHeroInfo(defaultHeroInfo);
      }
    };

    // تنفيذ الدالة
    loadHeroInfo();
  }, []);
  
  // تحميل إعدادات موضع الصورة من Local Storage
  useEffect(() => {
    if (typeof window !== 'undefined' && heroInfo.profileImage) {
      try {
        const savedPosition = localStorage.getItem('profileImagePosition');
        if (savedPosition) {
          const positionData = JSON.parse(savedPosition);
          // التحقق من أن الصورة المخزنة هي نفس الصورة الحالية
          if (positionData.url === heroInfo.profileImage) {
            setImagePosition(positionData.position);
          } else {
            // إذا كانت صورة مختلفة، استخدم الإعدادات الافتراضية
            setImagePosition({x: 0, y: 0, scale: 1});
          }
        }
      } catch (error) {
        console.error("خطأ في قراءة إعدادات موضع الصورة:", error);
        setImagePosition({x: 0, y: 0, scale: 1});
      }
    }
  }, [heroInfo.profileImage]);
  
  // تأثيرات GSAP للجزيئات
  useEffect(() => {
    if (heroRef.current) {
      const particleElements = heroRef.current.querySelectorAll('.particle');
      
      gsap.to(particleElements, {
        y: 'random(-60, 60)',
        x: 'random(-60, 60)',
        scale: 'random(0.9, 1.1)',
        opacity: 'random(0.05, 0.2)',
        duration: 'random(20, 30)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        stagger: 0.15
      });
    }
  }, []);

  // إعداد المهارات من البيانات المحملة
  const skillsWithIcons = heroInfo?.skills ? heroInfo.skills.map(skill => {
    let icon;
    switch(skill) {
      case "هندسة صوت":
        icon = <FaMicrophone />;
        break;
      case "مونتاج":
        icon = <FaFilm />;
        break;
      case "موسيقى":
        icon = <FaMusic />;
        break;
      case "إنتاج":
        icon = <FaHeadphones />;
        break;
      default:
        icon = <FaAward />;
    }
    return { name: skill, icon };
  }) : [];
  
  return (
    <section 
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-black via-gray-900 to-blue-900/30"
      style={{ paddingTop: '80px' }}
    >
      {/* طبقة الضوضاء */}
      <div className="absolute inset-0 bg-noise opacity-5 z-10"></div>
      
      {/* خطوط الشبكة */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] z-5"></div>
      
      {/* الجزيئات المتحركة */}
      <div className="absolute inset-0 z-0">
        {particles.map((particle, i) => (
          <div 
            key={i}
            className="particle absolute rounded-full bg-blue-500/10"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              opacity: particle.opacity,
              filter: `blur(${particle.blur}px)`
            }}
          />
        ))}
      </div>
      
      {/* طبقة توهج علوية */}
      <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-blue-900/20 to-transparent z-0"></div>
      
      {/* المحتوى الرئيسي */}
      <div className="container relative z-20 mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          {/* النص الرئيسي */}
          <motion.div 
            className={`${heroInfo.showProfileImage ? 'md:col-span-6 lg:col-span-7' : 'md:col-span-12'} text-center ${heroInfo.showProfileImage ? 'md:text-right' : 'md:text-center'}`}
            style={{ opacity, scale }}
          >
            <div className={`space-y-8 ${heroInfo.showProfileImage ? 'md:pr-10' : 'max-w-3xl mx-auto'}`}>
              {/* عنوان */}
              <div className="relative">
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '40%' }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`absolute top-0 ${heroInfo.showProfileImage ? 'right-0' : 'right-1/2 transform translate-x-1/2'} h-px bg-gradient-to-l from-blue-400 to-transparent w-[40%] -mt-2`}
                />
                
                <motion.div
                  custom={0}
                  initial="hidden"
                  animate="visible"
                  variants={textVariants}
                  className="inline-block"
                >
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white drop-shadow-md leading-none mb-2">
                    {heroInfo.name}
                  </h1>
                  <div className={`h-1.5 w-2/3 bg-gradient-to-r from-blue-500 via-purple-400 to-transparent ${heroInfo.showProfileImage ? 'mr-auto md:ml-0' : 'mx-auto'}`}></div>
                </motion.div>
                
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: '25%' }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className={`absolute bottom-0 ${heroInfo.showProfileImage ? 'left-0' : 'left-1/2 transform -translate-x-1/2'} h-px bg-gradient-to-r from-blue-400 to-transparent w-[25%]`}
                />
              </div>
              
              {/* المسمى الوظيفي */}
              <motion.h2
                custom={1}
                initial="hidden"
                animate="visible"
                variants={textVariants}
                className="text-4xl md:text-5xl font-semibold text-blue-300 drop-shadow-md"
              >
                {heroInfo.title}
              </motion.h2>
              
              {/* نبذة */}
              <motion.p
                custom={2}
                initial="hidden"
                animate="visible"
                variants={textVariants}
                className={`text-lg md:text-xl text-gray-300 max-w-2xl ${heroInfo.showProfileImage ? 'mx-auto md:mr-0' : 'mx-auto'} leading-relaxed drop-shadow-md`}
              >
                {heroInfo.bio}
              </motion.p>
              
              {/* المهارات */}
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={textVariants}  
                className={`flex flex-wrap ${heroInfo.showProfileImage ? 'justify-center md:justify-start' : 'justify-center'} gap-4`}
              >
                {skillsWithIcons.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    custom={index}
                    variants={iconVariants}
                    initial="hidden"
                    animate="visible"
                    onMouseEnter={() => setHoverSkill(skill.name)}
                    onMouseLeave={() => setHoverSkill(null)}
                    className="relative group"
                  >
                    <div className="glass-card p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-blue-500/20 group-hover:shadow-lg">
                      <div className="text-2xl text-blue-400 mb-2">
                        {skill.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-200">{skill.name}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
              
              {/* زر تنزيل معلومات الاتصال */}
              <motion.div
                custom={3}
                initial="hidden"
                animate="visible"
                variants={textVariants}
                className="mt-8"
              >
                <button 
                  onClick={() => setShowVCardDownloader(!showVCardDownloader)}
                  className="group inline-flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-lg transition-all hover:shadow-lg hover:shadow-blue-900/30"
                >
                  <FaAddressCard className="text-lg group-hover:scale-110 transition-transform" />
                  <span className="font-semibold">بطاقة الاتصال</span>
                </button>
                
                {/* مكون تنزيل vCard */}
                {showVCardDownloader && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-gray-900/70 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-blue-500/20"
                  >
                    <VCardDownloader />
                  </motion.div>
                )}
              </motion.div>
              
              {/* الأزرار */}
              <motion.div
                custom={4}
                initial="hidden"
                animate="visible"
                variants={textVariants}
                className={`flex flex-wrap ${heroInfo.showProfileImage ? 'justify-center md:justify-start' : 'justify-center'} gap-5 pt-2`}
              >
                <Link
                  href="#works"
                  className="btn-glow relative overflow-hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40 hover:-translate-y-1"
                >
                  <span className="relative z-10">مشاهدة أعمالي</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                </Link>
                <a 
                  href="#contact" 
                  className="px-8 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all duration-300 hover:scale-105 hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-900/10 hover:-translate-y-1"
                >
                  <span>تواصل معي</span>
                </a>
              </motion.div>
            </div>
          </motion.div>
          
          {/* عرض الصورة الشخصية */}
          {heroInfo.showProfileImage && (
            <motion.div 
              style={{ opacity, y }}
              className="md:col-span-6 lg:col-span-5"
            >
              <div className="relative w-full h-0 pb-[125%] md:pb-[125%]">
                <div className="absolute inset-0 backdrop-blur-[2px] rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_25px_rgba(8,112,184,0.3)] transform md:rotate-2 hover:rotate-0 transition-all duration-700">
                  {/* صورة الخلفية المتدرجة */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/10 to-transparent z-10 mix-blend-overlay"></div>
                  
                  {heroInfo.profileImage ? (
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 overflow-hidden">
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imagePosition.scale})`,
                            transformOrigin: 'center'
                          }}
                        >
                          <Image 
                            src={heroInfo.profileImage} 
                            alt={heroInfo.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            style={{ 
                              objectFit: "contain",
                              objectPosition: "center"
                            }}
                            className="z-10 p-1.5 rounded-2xl"
                            priority
                          />
                        </div>
                      </div>
                      {/* تأثير خفيف متدرج من الأسفل للأعلى */}
                      <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/40 to-transparent z-20 rounded-b-2xl"></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-white/50 text-2xl p-8 text-center z-10">
                      <div>
                        <FaAward className="text-5xl mx-auto mb-4 text-blue-400/70" />
                        <p>{heroInfo.name}</p>
                        <p className="text-lg text-white/30 mt-2">{heroInfo.title}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* زخرفة */}
                  <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-blue-400 to-transparent z-20"></div>
                  <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-blue-400 to-transparent z-20"></div>
                  <div className="absolute bottom-4 left-4 w-16 h-px bg-gradient-to-r from-blue-400 to-transparent z-20"></div>
                </div>
                
                {/* خط زخرفي */}
                <div className="hidden md:block absolute -bottom-4 -right-20 w-[150%] h-0.5 bg-gradient-to-l from-blue-600/20 via-blue-400/10 to-transparent z-10 transform -rotate-12"></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* تأثير تمرير للأسفل */}
      <motion.div 
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="text-white/50 text-center">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto mb-2 relative">
            <motion.div 
              className="w-1.5 h-1.5 bg-white/60 rounded-full absolute left-1/2 transform -translate-x-1/2"
              animate={{ 
                top: ["20%", "60%", "20%"],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          </div>
          <span className="text-sm">اسحب للأسفل</span>
        </div>
      </motion.div>
      
      {/* زخرفة */}
      <div className="hidden md:block absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-950/30 to-transparent z-5"></div>
      <div className="absolute top-0 left-0 w-full h-60 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-5"></div>
    </section>
  );
};

export default HeroSection; 