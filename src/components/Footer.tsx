"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaPhoneAlt, FaEnvelope, FaWhatsapp, FaFacebook, FaInstagram, FaYoutube, FaMapMarkerAlt } from "react-icons/fa";

// تعريف واجهة بيانات القسم الرئيسي
interface HeroInfo {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  profileImage?: string;
  showProfileImage: boolean;
}

// تعريف نوع بيانات الفوتر
interface FooterData {
  bio: string;
  quickLinks: {
    name: string;
    url: string;
  }[];
  contactInfo: {
    whatsapp: string;
    email: string;
    location: string;
  };
  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  copyright: string;
  developer: string;
}

// القيم الافتراضية لبيانات الفوتر
const defaultFooterData: FooterData = {
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
  developer: "كريم السيد"
};

// القيم الافتراضية لبيانات القسم الرئيسي
const defaultHeroInfo: HeroInfo = {
  name: "كريم السيد",
  title: "مهندس صوت محترف",
  bio: "أعمل في مجال هندسة الصوت منذ أكثر من 10 سنوات، قمت خلالها بالعمل في العديد من الأفلام والمسلسلات والإعلانات.",
  skills: ["هندسة صوت", "مونتاج", "موسيقى", "إنتاج"],
  showProfileImage: true
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [logoPath, setLogoPath] = useState("/favicon.webp");
  const [footerData, setFooterData] = useState<FooterData>(defaultFooterData);
  const [heroInfo, setHeroInfo] = useState<HeroInfo>(defaultHeroInfo);
  
  // تحميل اللوجو وبيانات الفوتر من التخزين المحلي عند تحميل المكون
  useEffect(() => {
    const loadData = () => {
      try {
        if (typeof window !== 'undefined') {
          // تحميل اللوجو
          const savedLogoPath = localStorage.getItem('siteLogo');
          if (savedLogoPath) {
            console.log("تم تحميل مسار اللوجو في الفوتر من التخزين المحلي");
            setLogoPath(savedLogoPath);
          }
          
          // تحميل بيانات الفوتر
          const savedFooterData = localStorage.getItem('footerData');
          if (savedFooterData) {
            console.log("تم تحميل بيانات الفوتر من التخزين المحلي");
            setFooterData(JSON.parse(savedFooterData));
          }
          
          // تحميل بيانات القسم الرئيسي
          const savedHeroInfo = localStorage.getItem('heroInfo');
          if (savedHeroInfo) {
            console.log("تم تحميل بيانات القسم الرئيسي في الفوتر من التخزين المحلي");
            setHeroInfo(JSON.parse(savedHeroInfo));
          }
        }
      } catch (error) {
        console.error("خطأ في تحميل البيانات من التخزين المحلي:", error);
      }
    };
    
    loadData();
  }, []);
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black py-12 mt-12 relative overflow-hidden">
      {/* أشكال زخرفية في الخلفية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/40 via-purple-500/40 to-blue-400/40"></div>
        <div className="absolute -top-64 -right-32 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl"></div>
        <div className="absolute -bottom-64 -left-32 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* المعلومات الشخصية والشعار */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/30 shadow-lg">
                <Image 
                  src={logoPath} 
                  alt={heroInfo.name} 
                  width={60} 
                  height={60} 
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {heroInfo.name}
                </h3>
                <p className="text-sm text-gray-400">{heroInfo.title}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {footerData.bio}
            </p>
          </div>
          
          {/* الوصول السريع */}
          <div className="md:text-center">
            <h4 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-800/50">روابط سريعة</h4>
            <ul className="space-y-2">
              {footerData.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.url} className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* معلومات التواصل */}
          <div className="md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-800/50">تواصل معي</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <FaWhatsapp className="text-green-500" />
                <a href={`https://wa.me/${footerData.contactInfo.whatsapp.replace(/\D/g,'')}`} className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  {footerData.contactInfo.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-blue-500" />
                <a href={`mailto:${footerData.contactInfo.email}`} className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                  {footerData.contactInfo.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-red-500" />
                <span className="text-gray-400">{footerData.contactInfo.location}</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* وسائل التواصل الاجتماعي */}
        <div className="flex justify-center items-center gap-4 my-6">
          <a href={footerData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition-colors duration-300">
            <FaFacebook className="text-white" />
          </a>
          <a href={footerData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-pink-600 transition-colors duration-300">
            <FaInstagram className="text-white" />
          </a>
          <a href={footerData.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-600 transition-colors duration-300">
            <FaYoutube className="text-white" />
          </a>
        </div>
        
        {/* حقوق النشر */}
        <div className="mt-8 pt-6 text-center border-t border-gray-800/20">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} {footerData.copyright}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            تم تطوير الموقع بواسطة Codesrun
          </p>
        </div>
      </div>
    </footer>
  );
} 