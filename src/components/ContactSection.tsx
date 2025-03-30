"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { FaEnvelope, FaPhone, FaWhatsapp, FaMapMarkerAlt, FaLinkedin, FaInstagram, FaFacebook, FaTwitter, FaChevronDown } from "react-icons/fa";
import gsap from "gsap";
import Link from "next/link";
import { getContactInfo, getSocialLinks } from "@/lib/firebase/data-service";
import { IoMail, IoLogoWhatsapp, IoCall } from "react-icons/io5";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import "react-phone-input-2/lib/style.css";
import PhoneInput from 'react-phone-input-2';

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "FaEnvelope":
      return <FaEnvelope className="text-2xl text-blue-400" />;
    case "FaPhone":
      return <FaPhone className="text-2xl text-blue-400" />;
    case "FaWhatsapp":
      return <FaWhatsapp className="text-2xl text-blue-400" />;
    case "FaMapMarkerAlt":
      return <FaMapMarkerAlt className="text-2xl text-blue-400" />;
    default:
      return <FaEnvelope className="text-2xl text-blue-400" />;
  }
};

const getSocialIconComponent = (iconName: string) => {
  switch (iconName) {
    case "FaLinkedin":
      return <FaLinkedin />;
    case "FaInstagram":
      return <FaInstagram />;
    case "FaFacebook":
      return <FaFacebook />;
    case "FaTwitter":
      return <FaTwitter />;
    default:
      return <FaLinkedin />;
  }
};

// تعريف نوع البيانات لمعلومات الاتصال
interface ContactInfo {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  icon?: string;
  link?: string;
  content?: string;
}

// تعريف نوع البيانات الخاص بروابط التواصل الاجتماعي
interface SocialLink {
  id: string;
  platform?: string;
  url?: string;
  label?: string;
  icon?: string;
}

// إعداد بيانات الاتصال الافتراضية
const defaultContactInfo = {
  email: "karim@example.com",
  phone: "+20 123 456 7890",
  address: "القاهرة، مصر"
};

// إعداد روابط التواصل الاجتماعي الافتراضية
const defaultSocialLinks: SocialLink[] = [
  { id: "1", platform: "facebook", url: "https://facebook.com/example" },
  { id: "2", platform: "twitter", url: "https://twitter.com/example" },
  { id: "3", platform: "instagram", url: "https://instagram.com/example" },
  { id: "4", platform: "linkedin", url: "https://linkedin.com/in/example" }
];

const ContactSection = () => {
  const [particles, setParticles] = useState<any[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });
  const particlesRef = useRef<HTMLDivElement>(null);
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [socialLinks, setSocialLinks] = useState<ContactInfo[]>([]);
  
  // تحميل البيانات عند تحميل المكون
  useEffect(() => {
    const loadContactData = async () => {
      try {
        console.log("=== بدء تحميل بيانات الاتصال في ContactSection ===");
        
        // التأكد من أننا في بيئة العميل
        if (typeof window === 'undefined') {
          console.log("المكون يعمل على جانب الخادم، لن يتم تحميل البيانات");
          return;
        }
        
        // تأخير بسيط لضمان تجنب مشاكل hydration
        setTimeout(async () => {
          // تحميل بيانات الاتصال
          const contactData = await getContactInfo();
          console.log("ContactSection: بيانات الاتصال المستلمة:", contactData);
          
          if (contactData && Array.isArray(contactData) && contactData.length > 0) {
            // استخدام البيانات كما هي إذا كانت بالفعل مصفوفة من contactInfo
            console.log("تم العثور على بيانات اتصال بالتنسيق الصحيح");
            
            // إزالة التكرار في أرقام الواتساب والهاتف
            const seenValues = new Set();
            const uniqueContactData = contactData.filter(item => {
              const identifier = item.icon === "FaWhatsapp" || item.icon === "FaPhone" 
                ? `${item.icon}-${item.value}` 
                : item.id;
                
              if (seenValues.has(identifier)) {
                return false;
              }
              
              seenValues.add(identifier);
              return true;
            });
            
            setContactInfo(uniqueContactData.map(item => ({
              id: item.id || String(Math.random()),
              title: item.title || "",
              value: typeof item.value === 'string' ? item.value : JSON.stringify(item.value),
              icon: item.icon || "",
              link: item.link || "#",
              color: item.color || "",
              content: item.content || "",
              subtitle: item.subtitle || ""
            })));
          } else if (contactData && typeof contactData === 'object' && !Array.isArray(contactData)) {
            // تحويل الكائن إلى مصفوفة
            console.log("تحويل بيانات الاتصال من كائن إلى مصفوفة");
            setContactInfo(Object.entries(contactData).map(([key, value]) => ({
              id: key,
              title: key.charAt(0).toUpperCase() + key.slice(1),
              value: typeof value === 'string' ? value : JSON.stringify(value),
              icon: key === "email" ? "FaEnvelope" : key === "phone" ? "FaPhone" : key === "address" ? "FaMapMarkerAlt" : undefined,
              link: key === "email" ? `mailto:${value}` : key === "phone" ? `tel:${value}` : key === "address" ? value : "#"
            })));
          } else {
            // استخدام البيانات الافتراضية
            console.log("لم يتم العثور على بيانات اتصال، استخدام البيانات الافتراضية");
            setContactInfo(Object.entries(defaultContactInfo).map(([key, value]) => ({
              id: key,
              title: key.charAt(0).toUpperCase() + key.slice(1),
              value: value,
              icon: key === "email" ? "FaEnvelope" : key === "phone" ? "FaPhone" : key === "address" ? "FaMapMarkerAlt" : undefined,
              link: key === "email" ? `mailto:${value}` : key === "phone" ? `tel:${value}` : key === "address" ? value : "#"
            })));
          }
          
          // تحميل روابط التواصل الاجتماعي
          const socialData = await getSocialLinks();
          console.log("ContactSection: روابط التواصل الاجتماعي المستلمة:", socialData);
          
          if (socialData && Array.isArray(socialData) && socialData.length > 0) {
            console.log("وجدت روابط تواصل اجتماعي:", socialData);
            
            setSocialLinks(socialData.map(link => {
              // التأكد من وجود البيانات المطلوبة
              if (!link || typeof link !== 'object') {
                console.warn("تم استلام بيانات غير صالحة لرابط تواصل اجتماعي:", link);
                return {
                  id: String(Math.random()),
                  title: "رابط تواصل",
                  value: "",
                  icon: "FaLink",
                  link: "#"
                };
              }
              
              // التعامل مع الهيكل الجديد الذي قد يحتوي على id/label/url
              const socialId = link.id || String(Math.random());
              // استخراج نوع الشبكة الاجتماعية من id, label أو تخمينه
              const platformType = link.platform || link.label || link.id || "";
              const displayName = (link.label || platformType || "رابط").toString();
              const url = link.url || "#";
              
              // تحديد الأيقونة المناسبة
              let iconType = "FaLink";
              if (platformType.toLowerCase().includes("facebook")) {
                iconType = "FaFacebook";
              } else if (platformType.toLowerCase().includes("twitter")) {
                iconType = "FaTwitter";
              } else if (platformType.toLowerCase().includes("instagram")) {
                iconType = "FaInstagram";
              } else if (platformType.toLowerCase().includes("linkedin")) {
                iconType = "FaLinkedin";
              } else if (link.icon) {
                iconType = link.icon;
              }
              
              return {
                id: socialId,
                title: displayName.charAt(0).toUpperCase() + displayName.slice(1),
                value: url,
                icon: iconType,
                link: url
              };
            }));
          } else {
            console.log("لم يتم العثور على روابط تواصل اجتماعي، استخدام البيانات الافتراضية");
            
            // استخدام البيانات الافتراضية بطريقة آمنة
            setSocialLinks(defaultSocialLinks.map(link => {
              const platform = link.platform || "";
              return {
                id: link.id || String(Math.random()),
                title: platform.charAt(0).toUpperCase() + platform.slice(1),
                value: link.url || "#",
                icon: platform === "facebook" ? "FaFacebook" : 
                      platform === "twitter" ? "FaTwitter" : 
                      platform === "instagram" ? "FaInstagram" : 
                      platform === "linkedin" ? "FaLinkedin" : "FaLink",
                link: link.url || "#"
              };
            }));
          }
          
          console.log("اكتمل تحميل البيانات في ContactSection");
        }, 500);
      } catch (error) {
        console.error("خطأ في تحميل بيانات الاتصال:", error);
        
        // استخدام البيانات الافتراضية في حالة الخطأ
        setContactInfo(Object.entries(defaultContactInfo).map(([key, value]) => ({
          id: key,
          title: key.charAt(0).toUpperCase() + key.slice(1),
          value: value,
          icon: key === "email" ? "FaEnvelope" : key === "phone" ? "FaPhone" : key === "address" ? "FaMapMarkerAlt" : undefined,
          link: key === "email" ? `mailto:${value}` : key === "phone" ? `tel:${value}` : key === "address" ? value : "#"
        })));
        setSocialLinks(defaultSocialLinks.map(link => ({
          id: link.id,
          title: link.platform.charAt(0).toUpperCase() + link.platform.slice(1),
          value: link.url,
          icon: link.platform === "facebook" ? "FaFacebook" : link.platform === "twitter" ? "FaTwitter" : link.platform === "instagram" ? "FaInstagram" : link.platform === "linkedin" ? "FaLinkedin" : undefined,
          link: link.url
        })));
      }
    };

    // تنفيذ دالة التحميل
    loadContactData();
  }, []);

  // إنشاء الجزيئات بعدد أقل لتحسين الأداء
  useEffect(() => {
    const generatedParticles = Array(8).fill(0).map(() => ({
      width: Math.random() * 10 + 5,
      height: Math.random() * 10 + 5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      backgroundColor: `rgba(${59 + Math.random() * 50}, ${130 + Math.random() * 50}, ${246 + Math.random() * 10}, ${0.1 + Math.random() * 0.2})`,
      blur: Math.random() * 1.5 + 0.5
    }));
    
    setParticles(generatedParticles);
  }, []);

  // تأثيرات الجزيئات المتحركة بشكل مخفف
  useEffect(() => {
    if (particlesRef.current && isInView && particles.length > 0) {
      const particleElements = particlesRef.current.querySelectorAll('.particle');
      
      gsap.fromTo(particleElements, 
        { scale: 0.5, opacity: 0 }, 
        { 
          scale: 1, 
          opacity: 0.7, 
          duration: 1.5, 
          stagger: 0.05, 
          ease: "power2.out"
        }
      );
      
      gsap.to(particleElements, {
        x: "random(-40, 40)",
        y: "random(-40, 40)",
        rotation: "random(-90, 90)",
        duration: "random(15, 25)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.1,
        delay: 1.5
      });
    }
  }, [isInView, particles]);

  useEffect(() => {
    // طباعة بيانات الاتصال للتحقق
    console.log("ContactSection - معلومات الاتصال المستلمة:", contactInfo);
    console.log("ContactSection - روابط التواصل الاجتماعي:", socialLinks);
  }, [contactInfo, socialLinks]);
  
  // وظيفة لعرض الأيقونة المناسبة بناءً على نوع الاتصال
  const getIcon = (iconName: string) => {
    console.log("نوع الأيقونة المطلوبة:", iconName);
    
    switch (iconName) {
      case "FaPhone":
        return <FaPhone className="text-3xl" />;
      case "FaEnvelope":
        return <FaEnvelope className="text-3xl" />;
      case "FaWhatsapp":
        return <FaWhatsapp className="text-3xl" />;
      case "FaMapMarkerAlt":
        return <FaMapMarkerAlt className="text-3xl" />;
      case "FaFacebook":
        return <FaFacebook className="text-3xl" />;
      case "FaInstagram":
        return <FaInstagram className="text-3xl" />;
      case "FaTwitter":
        return <FaTwitter className="text-3xl" />;
      case "FaLinkedin":
        return <FaLinkedin className="text-3xl" />;
      case "mail":
        return <IoMail className="text-3xl" />;
      case "whatsapp":
        return <IoLogoWhatsapp className="text-3xl" />;
      case "call":
        return <IoCall className="text-3xl" />;
      default:
        console.log("استخدام أيقونة افتراضية بدلاً من:", iconName);
        return <FaPhone className="text-3xl" />;
    }
  };

  // إنشاء الرابط بناءً على القيمة ونوع الأيقونة
  const getLinkFromIcon = (contact: ContactInfo): string => {
    if (!contact.value || contact.value.trim() === "") return "#";
    
    // تنظيف القيمة من المسافات والأحرف الخاصة للروابط التي تحتاج ذلك
    const cleanValue = contact.value.trim().replace(/\s+/g, "");
    
    switch (contact.icon) {
      case "FaPhone":
        return `tel:${cleanValue}`;
      case "FaEnvelope":
        return `mailto:${cleanValue}`;
      case "FaWhatsapp":
        // إزالة علامة + من بداية الرقم إذا وجدت
        const whatsappNumber = cleanValue.startsWith("+") ? cleanValue.substring(1) : cleanValue;
        return `https://wa.me/${whatsappNumber}`;
      case "FaMapMarkerAlt":
        return `https://maps.google.com/?q=${encodeURIComponent(contact.value)}`;
      case "FaFacebook":
        return cleanValue.startsWith("http") ? cleanValue : `https://facebook.com/${cleanValue}`;
      case "FaInstagram":
        return cleanValue.startsWith("http") ? cleanValue : `https://instagram.com/${cleanValue}`;
      case "FaTwitter":
        return cleanValue.startsWith("http") ? cleanValue : `https://twitter.com/${cleanValue}`;
      case "FaLinkedin":
        return cleanValue.startsWith("http") ? cleanValue : `https://linkedin.com/in/${cleanValue}`;
      default:
        return contact.link || "#";
    }
  };

  // وظيفة مساعدة لتطبيق الألوان بشكل صحيح
  const applyColorClass = (colorValue: string | undefined, defaultColor: string): string => {
    if (!colorValue) return defaultColor;
    
    // تحقق مما إذا كان اللون يحتوي على فئات CSS صحيحة
    if (colorValue.includes("bg-")) {
      return colorValue;
    }
    
    // محاولة إصلاح الألوان القديمة التي لا تحتوي على bg-
    if (colorValue.includes("from-") && !colorValue.includes("bg-gradient-to-r")) {
      return `bg-gradient-to-r ${colorValue}`;
    }
    
    // إرجاع اللون الافتراضي إذا لم يكن اللون بالصيغة المتوقعة
    return defaultColor;
  };

  // وظائف معالجة عرض الهاتف بتنسيق الدولة
  const formatPhoneNumberWithFlag = (phoneNumber: string) => {
    if (!phoneNumber) return null;
    
    // تنظيف رقم الهاتف من الفواصل والمسافات
    const cleanNumber = phoneNumber.replace(/\s+/g, "");
    
    return (
      <div className="flex items-center justify-center">
        <PhoneInput
          value={cleanNumber}
          disabled={true}
          disableDropdown={true}
          disableSearchIcon={true}
          inputProps={{
            readOnly: true,
            className: "bg-transparent border-none text-center text-gray-300 !w-auto !p-0"
          }}
          containerClass="!bg-transparent !w-auto"
          buttonClass="!bg-transparent"
          buttonStyle={{border: 'none'}}
          inputStyle={{border: 'none', backgroundColor: 'transparent', color: 'white', width: 'auto', padding: 0}}
        />
      </div>
    );
  };

  return (
    <section 
      id="contact" 
      ref={sectionRef}
      className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-b from-gray-900 to-black"
    >
      {/* طبقة الضوضاء */}
      <div className="absolute inset-0 bg-noise opacity-5 z-10"></div>
      
      {/* الجزيئات المتحركة */}
      <div 
        ref={particlesRef}
        className="absolute inset-0 z-0"
      >
        {particles.map((particle, i) => (
          <div 
            key={i}
            className="particle absolute rounded-full"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              backgroundColor: particle.backgroundColor,
              filter: `blur(${particle.blur}px)`
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="inline-block text-3xl md:text-5xl font-bold text-white mb-4">
            تواصل معي
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-2"></div>
        </motion.div>
        
        {/* تغيير تصميم قسم وسائل الاتصال من أكورديون إلى بطاقات مسطحة */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contactInfo.map((contact, index) => {
              // إنشاء الرابط المناسب بناءً على نوع الأيقونة
              const linkHref = getLinkFromIcon(contact);
              
              // تطبيق فئات الألوان بشكل صحيح
              const colorClass = applyColorClass(
                contact.color, 
                "bg-gradient-to-r from-blue-500 to-purple-600"
              );
              
              return (
                <motion.div
                  key={contact.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden shadow-lg p-6 flex flex-col items-center text-center"
                >
                  <div className={`w-16 h-16 rounded-full ${colorClass} flex items-center justify-center text-white mb-4`}>
                    {getIcon(contact.icon || "")}
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{contact.title || ""}</h3>
                  
                  {contact.subtitle && (
                    <p className="text-gray-400 text-sm mb-3">{contact.subtitle}</p>
                  )}
                  
                  {/* عرض الرقم مع علم الدولة للهاتف */}
                  {contact.value && typeof contact.value === 'string' && contact.icon === "FaPhone" && (
                    <div className="flex justify-center mb-4">
                      {formatPhoneNumberWithFlag(contact.value)}
                    </div>
                  )}
                  
                  {/* عرض الرقم مع علم الدولة للواتساب */}
                  {contact.value && typeof contact.value === 'string' && contact.icon === "FaWhatsapp" && (
                    <div className="flex justify-center mb-4">
                      {formatPhoneNumberWithFlag(contact.value)}
                    </div>
                  )}
                  
                  {/* عرض بقية أنواع البيانات بشكل عادي ولكن ليس للواتساب أو الهاتف */}
                  {contact.value && typeof contact.value === 'string' && contact.icon !== "FaWhatsapp" && contact.icon !== "FaPhone" && (
                    <p className="text-gray-300 mb-4">{contact.value}</p>
                  )}
                  
                  {/* لا نعرض المحتوى إذا كان هو نفس رقم الهاتف أو الواتساب */}
                  {contact.content && contact.content !== contact.value && (
                    <p className="text-gray-400 mb-4 text-sm">{contact.content}</p>
                  )}
                  
                  <div className="mt-auto pt-4">
                    <Link 
                      href={linkHref}
                      target={contact.icon === "FaPhone" || contact.icon === "FaEnvelope" ? undefined : "_blank"}
                      rel={contact.icon === "FaPhone" || contact.icon === "FaEnvelope" ? undefined : "noopener noreferrer"}
                      className={`inline-block py-2 px-5 rounded-full ${colorClass} text-white font-medium shadow-lg shadow-black/20 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300`}
                    >
                      تواصل الآن
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 