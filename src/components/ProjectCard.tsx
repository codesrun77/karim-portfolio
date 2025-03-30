"use client";
import { motion } from "framer-motion";
import { FaArrowRight, FaVideo, FaMicrophone, FaEdit } from "react-icons/fa";
import { useState } from "react";
import Image from "next/image";

// قائمة الفئات للمساعدة في عرض الأيقونات والأسماء
const categories = [
  { id: "all", name: "الكل" },
  { id: "أفلام", name: "أفلام", icon: <FaMicrophone /> },
  { id: "قنوات تلفزيونية", name: "قنوات تلفزيونية", icon: <FaVideo /> },
  { id: "مسلسلات", name: "مسلسلات", icon: <FaVideo /> },
  { id: "برامج", name: "برامج", icon: <FaEdit /> }
];

// واجهة المشروع المحدثة لتتوافق مع WorksSection
interface ProjectWithId {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  year?: number;
  isActive?: boolean;
  link?: string;
}

interface ProjectCardProps {
  project: ProjectWithId;
  index?: number;
  delay?: number;
}

const ProjectCard = ({ project, index = 0, delay = 0 }: ProjectCardProps) => {
  const [isSelected, setIsSelected] = useState(false);
  
  const handleProjectClick = () => {
    setIsSelected(!isSelected);
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 + delay }}
      className={`
        project-card group relative overflow-hidden rounded-xl 
        cursor-pointer backdrop-blur-sm border border-white/10
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''}
      `}
      onClick={handleProjectClick}
    >
      {/* تأثير التدرج أكثر تغطية لمساعدة النص على الظهور بشكل أفضل */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 opacity-80 group-hover:opacity-90 transition-opacity z-10" />
      
      {/* الصورة */}
      <div className="relative h-[300px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"
        >
          <Image 
            src={project.image || "/images/default.jpg"}
            alt={project.title}
            width={400}
            height={300}
            className="h-full w-full object-cover"
            onError={(e) => {
              // تلقائياً استخدام الصورة البديلة
              console.error(`فشل في تحميل صورة المشروع: ${project.title}`);
              if (e.currentTarget) {
                e.currentTarget.src = "/images/default.jpg";
                e.currentTarget.alt = "صورة بديلة";
              }
            }}
            priority={index < 2}
            unoptimized={true}
          />
        </div>
      </div>
      
      {/* المعلومات مع خلفية شفافة داكنة لتحسين ظهور النص */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20 bg-black/50 backdrop-blur-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors text-shadow-sm">
              {project.title}
            </h3>
            <p className={`
              text-gray-100 text-sm transition-all duration-300 max-h-0 overflow-hidden opacity-0
              ${isSelected ? 'max-h-20 opacity-100 mt-2' : ''}
            `}>
              {project.description}
            </p>
          </div>
          <div 
            className={`
              p-3 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/30
              transform transition-all duration-300
              ${isSelected ? 'rotate-180' : 'group-hover:translate-x-2'}
            `}
          >
            <FaArrowRight className="text-blue-400" />
          </div>
        </div>
      </div>

      {/* شريط الفئة والسنة */}
      <div className="absolute top-5 right-5 z-30">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg font-medium flex items-center gap-1.5 border border-blue-300/20">
          {project.category === 'قنوات تلفزيونية' && <FaVideo className="text-blue-200" />}
          {project.category === 'أفلام' && <FaMicrophone className="text-blue-200" />}
          {project.category === 'مسلسلات' && <FaVideo className="text-blue-200" />}
          {project.category === 'برامج' && <FaEdit className="text-blue-200" />}
          <span>{categories.find(cat => cat.id === project.category)?.name || project.category}</span>
          <span className="mx-1 text-blue-300/70">|</span>
          <span className="bg-blue-800/70 px-2 py-0.5 rounded text-xs">{project.year || "غير محدد"}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard; 