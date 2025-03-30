"use client";
import { useState } from "react";
import Image from "next/image";
import { FaImage } from "react-icons/fa";

interface ProjectImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export default function ProjectImage({ src, alt, className = "", width = 500, height = 300 }: ProjectImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // عرض صورة بديلة في حالة الخطأ
  if (error || !src) {
    return (
      <div className={`bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <FaImage className="text-gray-500 text-5xl mx-auto mb-2" />
          <p className="text-gray-400 text-sm">{alt || "صورة غير متوفرة"}</p>
        </div>
      </div>
    );
  }

  const defaultImage = "/images/default.jpg";
  const imageSrc = src || defaultImage;
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {loading ? (
        <div className="flex items-center justify-center h-full w-full bg-gray-800 animate-pulse">
          <FaImage className="text-gray-600 text-4xl" />
        </div>
      ) : null}
      <Image 
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        className={`object-cover transition-transform hover:scale-105 w-full h-full ${loading ? 'opacity-0' : 'opacity-100'}`}
        onError={() => {
          console.error(`فشل في تحميل الصورة: ${imageSrc} للمشروع: ${alt}`);
          setError(true);
          setLoading(false);
        }}
        onLoad={() => {
          console.log(`تم تحميل الصورة بنجاح: ${imageSrc}`);
          setLoading(false);
        }}
        priority={true}
        unoptimized={true}
      />
    </div>
  );
} 