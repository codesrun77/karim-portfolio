"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { FaFilter, FaSearch } from "react-icons/fa";
import { getProjects, getCategories } from "@/lib/firebase/data-service";
import { Project, Category } from "@/types";
import ProjectCard from "./ProjectCard";

// تعريف واجهة المشروع للتوافق مع البيانات
interface ProjectWithId extends Project {
  id: string;
  image: string;
  description: string;
  category: string;
  year?: number;
  isActive?: boolean;
  link?: string;
}

export default function WorksSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [projects, setProjects] = useState<ProjectWithId[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithId[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([
    { id: "all", name: "كل الأعمال", isActive: true, order: 0 }
  ]);
  
  // تحميل المشاريع والتصنيفات عند تهيئة المكون
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // تحميل التصنيفات
        try {
          console.log("جاري تحميل التصنيفات...");
          const categoriesData = await getCategories();
          if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
            // التأكد من وجود تصنيف "كل الأعمال"
            const hasAllCategory = categoriesData.some(cat => cat.id === "all");
            
            // إنشاء مصفوفة التصنيفات النهائية
            let finalCategories = hasAllCategory 
              ? categoriesData 
              : [{ id: "all", name: "كل الأعمال", isActive: true, order: 0 }, ...categoriesData];
              
            // ترتيب التصنيفات حسب الترتيب
            finalCategories = finalCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
            
            // تصفية التصنيفات النشطة فقط
            finalCategories = finalCategories.filter(cat => cat.isActive !== false);
            
            console.log("تم تحميل التصنيفات:", finalCategories.length);
            setCategories(finalCategories);
          } else {
            console.warn("لم يتم العثور على تصنيفات، استخدام التصنيفات الافتراضية");
          }
        } catch (categoryError) {
          console.error("خطأ في تحميل التصنيفات:", categoryError);
        }
        
        // تحميل المشاريع
        const data = await getProjects();
        
        // التحقق من وجود بيانات وتنسيقها إلى الواجهة المتوقعة
        if (data && Array.isArray(data)) {
          const formattedProjects = data.map(project => ({
            id: project.id || `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: project.title || "مشروع بدون عنوان",
            description: project.description || "",
            image: project.image || "/images/default.jpg",
            category: project.category || "أخرى",
            year: project.year || new Date().getFullYear(),
            isActive: project.isActive !== undefined ? project.isActive : true,
            link: project.link || ""
          }));
          
          // تصفية المشاريع النشطة فقط
          const activeProjects = formattedProjects.filter(project => project.isActive);
          
          // ترتيب المشاريع بحسب السنة (من الأحدث للأقدم)
          const sortedProjects = activeProjects.sort((a, b) => 
            (b.year || 0) - (a.year || 0)
          );
          
          setProjects(sortedProjects);
          setFilteredProjects(sortedProjects);
        } else {
          console.error("تنسيق بيانات المشاريع غير صحيح:", data);
          setError("فشل في تحميل المشاريع. تنسيق البيانات غير صحيح.");
        }
      } catch (error) {
        console.error("خطأ في تحميل البيانات:", error);
        setError("حدث خطأ أثناء تحميل البيانات.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
    
    // التحقق من الرؤية عند التمرير
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  // تصفية المشاريع عند تغيير الفئة المحددة أو مصطلح البحث
  useEffect(() => {
    if (!projects?.length) return;
    
    let result = [...projects];
    
    // تصفية حسب الفئة
    if (selectedCategory !== "all") {
      result = result.filter(project => project.category === selectedCategory);
    }
    
    // تصفية حسب نص البحث
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        project => 
          project.title.toLowerCase().includes(term) || 
          project.description.toLowerCase().includes(term) ||
          (project.category && project.category.toLowerCase().includes(term))
      );
    }
    
    setFilteredProjects(result);
  }, [selectedCategory, searchTerm, projects]);
  
  // معالجة خطأ الصورة (استخدام صورة بديلة إذا فشل تحميل الصورة الأصلية)
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = "/images/default.jpg";
    target.onerror = null; // منع الحلقة اللانهائية
  };
  
  return (
    <section id="works" ref={sectionRef} className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      {/* طبقة الضوضاء والزخارف */}
      <div className="absolute inset-0 bg-noise opacity-5"></div>
      <div className="absolute -bottom-64 -left-32 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl"></div>
      <div className="absolute -top-64 -right-32 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl"></div>
      
      <div className="container mx-auto px-4">
        {/* العنوان والوصف */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">أعمالي</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            مجموعة من أهم الأعمال التي ساهمت فيها كمهندس صوت ومصمم صوتي
          </p>
        </motion.div>
        
        {/* أدوات التصفية والبحث */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {/* تصفية حسب الفئة */}
          <div className="bg-gray-800/50 p-1 rounded-lg flex flex-wrap justify-center">
            {categories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-md text-sm transition-all ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* البحث */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="ابحث عن مشروع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 px-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        
        {/* عرض المشاريع */}
        <div className="mt-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-8 bg-red-900/20 rounded-lg">
              {error}
              <p className="mt-2 text-sm text-gray-400">
                حاول تحديث الصفحة أو التحقق من اتصالك بالإنترنت.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center text-gray-400 p-8 bg-gray-800/50 rounded-lg">
              لا توجد مشاريع متاحة في هذه الفئة
              {searchTerm && <p>يرجى تعديل معايير البحث.</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 