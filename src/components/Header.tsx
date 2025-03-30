"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaHome, FaUser, FaFileAlt, FaProjectDiagram, FaEnvelope, FaSignOutAlt } from "react-icons/fa";
import { getHeaderLinks, getHeroInfo } from "@/lib/firebase/data-service";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [heroInfo, setHeroInfo] = useState({ name: "كريم السيد", title: "مهندس صوت" });
  const [logoPath, setLogoPath] = useState("/favicon.webp");
  const [navLinks, setNavLinks] = useState([
    { name: "الرئيسية", url: "/" },
    { name: "الفيديو", url: "/#video" },
    { name: "نبذة عني", url: "/#info" },
    { name: "الخبرات", url: "/#experience" },
    { name: "المسار الزمني", url: "/#timeline" },
    { name: "أعمالي", url: "/#works" },
    { name: "تواصل معي", url: "/#contact" },
    { name: "لوحة التحكم", url: "/admin" },
  ]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // دالة للحصول على أيقونة مناسبة لكل عنصر في القائمة
  const getMenuIcon = (name: string) => {
    switch(name) {
      case "الرئيسية":
        return <FaHome />;
      case "نبذة عني":
        return <FaUser />;
      case "أعمالي":
        return <FaProjectDiagram />;
      case "الخبرات":
        return <FaFileAlt />;
      case "تواصل معي":
        return <FaEnvelope />;
      case "لوحة التحكم":
        return <FaFileAlt />;
      case "الفيديو":
        return <FaProjectDiagram />;
      case "المسار الزمني":
        return <FaFileAlt />;
      case "تسجيل الخروج":
        return <FaSignOutAlt />;
      default:
        return <FaHome />;
    }
  };

  // دالة لتسجيل الخروج
  const handleLogout = async () => {
    if (!auth) {
      console.error("المصادقة غير متاحة");
      return;
    }
    try {
      await signOut(auth);
      router.push('/');
      setIsLoggedIn(false);
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  // إضافة useEffect لتحميل بيانات الهيدر من قاعدة البيانات والتحقق من تسجيل الدخول
  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        console.log("جاري تحميل روابط الهيدر في الواجهة الأمامية...");
        const data = await getHeaderLinks();
        
        // تصفية الروابط النشطة فقط
        const activeLinks = data.filter(link => link.isActive);
        
        if (activeLinks && activeLinks.length > 0) {
          console.log("تم تحميل روابط الهيدر بنجاح:", activeLinks.length);
          setNavLinks(activeLinks);
        } else {
          console.log("لا توجد روابط نشطة، سيتم عرض الروابط الافتراضية");
        }
      } catch (error) {
        console.error("خطأ في تحميل روابط الهيدر:", error);
      }
    };
    
    // دالة لتحميل معلومات القسم الرئيسي
    const loadHeroInfo = async () => {
      try {
        console.log("جاري تحميل معلومات القسم الرئيسي...");
        const data = await getHeroInfo();
        
        if (data && data.name && data.title) {
          console.log("تم تحميل معلومات القسم الرئيسي بنجاح:", data.name, data.title);
          setHeroInfo({ name: data.name, title: data.title });
        } else {
          console.log("لم يتم العثور على معلومات القسم الرئيسي كاملة");
        }
      } catch (error) {
        console.error("خطأ في تحميل معلومات القسم الرئيسي:", error);
      }
    };
    
    // تحميل مسار اللوجو من التخزين المحلي
    const loadLogoPath = () => {
      try {
        if (typeof window !== 'undefined') {
          const savedLogoPath = localStorage.getItem('siteLogo');
          if (savedLogoPath) {
            console.log("تم تحميل مسار اللوجو من التخزين المحلي:", savedLogoPath);
            setLogoPath(savedLogoPath);
          }
        }
      } catch (error) {
        console.error("خطأ في تحميل مسار اللوجو من التخزين المحلي:", error);
      }
    };
    
    loadHeaderData();
    loadHeroInfo();
    loadLogoPath();

    // التحقق مما إذا كان المستخدم مسجل دخوله
    const unsubscribe = auth?.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    }) || (() => {});

    return () => unsubscribe();
  }, []);

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "py-2 backdrop-blur-xl bg-black/40 border-b border-white/10 shadow-xl"
          : "py-4 bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className={`relative flex items-center justify-center w-10 h-10 ${scrolled ? 'scale-90' : 'scale-100'} rounded-full overflow-hidden shadow-lg transition-all duration-300 border-2 border-blue-400/30 group`}>
              <Image 
                src={logoPath} 
                alt={heroInfo.name} 
                width={48} 
                height={48} 
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/40 to-purple-500/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-bold text-white transition-all duration-300 ${scrolled ? 'text-base' : ''}`}>{heroInfo.name}</span>
              <span className={`text-xs text-blue-300 transition-all duration-300 ${scrolled ? 'text-opacity-100' : 'text-opacity-80'}`}>{heroInfo.title}</span>
            </div>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden md:flex items-center"
        >
          <ul className="flex items-center space-x-1 rtl:space-x-reverse">
            {navLinks.filter(item => item.name !== "لوحة التحكم").map((item, index) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Link
                  href={item.url}
                  className="flex items-center px-4 py-2 text-gray-200 hover:text-white rounded-lg transition-all relative group"
                >
                  <span className={`absolute opacity-0 scale-0 ${scrolled ? 'group-hover:opacity-100 group-hover:scale-100' : ''} transition-all duration-300 left-4 rtl:right-4 rtl:left-auto`}>{getMenuIcon(item.name)}</span>
                  <span className={`transition-all duration-300 ${scrolled ? 'group-hover:mr-5 rtl:group-hover:ml-5 rtl:group-hover:mr-0' : ''}`}>{item.name}</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"
                    whileHover={{ width: "100%" }}
                  />
                </Link>
              </motion.li>
            ))}
            
            {/* دائما إظهار لوحة التحكم في النهاية */}
            {navLinks.find(item => item.name === "لوحة التحكم") && (
              <motion.li
                key="لوحة التحكم"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Link
                  href="/admin"
                  className="flex items-center px-4 py-2 text-gray-200 hover:text-white rounded-lg transition-all relative group"
                >
                  <span className={`absolute opacity-0 scale-0 ${scrolled ? 'group-hover:opacity-100 group-hover:scale-100' : ''} transition-all duration-300 left-4 rtl:right-4 rtl:left-auto`}>{getMenuIcon("لوحة التحكم")}</span>
                  <span className={`transition-all duration-300 ${scrolled ? 'group-hover:mr-5 rtl:group-hover:ml-5 rtl:group-hover:mr-0' : ''}`}>لوحة التحكم</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"
                    whileHover={{ width: "100%" }}
                  />
                </Link>
              </motion.li>
            )}

            {/* إضافة زر تسجيل الخروج إذا كان المستخدم مسجل دخوله */}
            {isLoggedIn && (
              <motion.li
                key="تسجيل الخروج"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 + 0.1 }}
              >
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-gray-200 hover:text-white rounded-lg transition-all relative group"
                >
                  <span className={`absolute opacity-0 scale-0 ${scrolled ? 'group-hover:opacity-100 group-hover:scale-100' : ''} transition-all duration-300 left-4 rtl:right-4 rtl:left-auto`}><FaSignOutAlt /></span>
                  <span className={`transition-all duration-300 ${scrolled ? 'group-hover:mr-5 rtl:group-hover:ml-5 rtl:group-hover:mr-0' : ''}`}>تسجيل الخروج</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-red-500 to-orange-500 group-hover:w-full transition-all duration-300"
                    whileHover={{ width: "100%" }}
                  />
                </button>
              </motion.li>
            )}
          </ul>
        </motion.nav>

        {/* Mobile Navigation Controls */}
        <div className="flex items-center md:hidden">
          {/* زر القائمة للموبايل */}
          <button 
            className="lg:hidden text-2xl text-white"
            onClick={toggleMenu}
            aria-label="القائمة"
          >
            <FaBars />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden backdrop-blur-xl bg-black/70 border-t border-white/10 shadow-xl"
          >
            <div className="container mx-auto px-4 py-4">
              <ul className="space-y-3">
                {navLinks.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={item.url}
                      className="flex items-center py-2 px-3 text-gray-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="inline-block ml-3 text-blue-400">{getMenuIcon(item.name)}</span>
                      <span>{item.name}</span>
                    </Link>
                  </motion.li>
                ))}
                
                {/* إضافة زر تسجيل الخروج للهاتف المحمول */}
                {isLoggedIn && (
                  <motion.li
                    key="تسجيل الخروج"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full py-2 px-3 text-gray-200 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <span className="inline-block ml-3 text-red-400"><FaSignOutAlt /></span>
                      <span>تسجيل الخروج</span>
                    </button>
                  </motion.li>
                )}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Decorative Elements */}
      {scrolled && (
        <>
          <div className="absolute bottom-0 left-0 w-1/4 h-px bg-gradient-to-r from-transparent to-blue-500/50"></div>
          <div className="absolute bottom-0 right-0 w-1/4 h-px bg-gradient-to-l from-transparent to-purple-500/50"></div>
        </>
      )}
    </header>
  );
};

export default Header; 