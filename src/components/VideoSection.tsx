"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FaExpand, FaAward } from "react-icons/fa";
import { getVideoInfo } from "@/lib/firebase/data-service";
import { VideoInfo } from "@/types";

const defaultVideoInfo: VideoInfo = {
  id: "video-1",
  title: "الفيديو التعريفي",
  description: "نبذة عن خبراتي ومهاراتي في مجال هندسة الصوت",
  videoUrl: "https://www.youtube.com/watch?v=yfZox-wm-Kg",
  isActive: true,
  lastUpdate: new Date().toISOString()
};

// وظيفة تحويل روابط YouTube العادية إلى روابط embed
const convertYouTubeUrl = (url: string): string => {
  if (!url) return '';
  
  // التحقق من شكل الرابط وعمل التحويل المناسب
  if (url.includes('youtube.com/watch?v=')) {
    // استخراج معرف الفيديو من الرابط العادي
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes('youtu.be/')) {
    // استخراج معرف الفيديو من الرابط المختصر
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } else if (url.includes('youtube.com/embed/')) {
    // الرابط بالفعل بصيغة embed
    return url;
  }
  
  // إذا لم يكن رابط يوتيوب معروف، إرجاع الرابط كما هو
  return url;
};

const VideoSection = () => {
  const [videoInfo, setVideoInfo] = useState<VideoInfo>(defaultVideoInfo);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const videoRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8], [0, 1, 0.5]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.95, 1]);
  
  useEffect(() => {
    const loadVideoInfo = async () => {
      try {
        setIsLoading(true);
        console.log("بدأ تحميل بيانات الفيديو...");
        const data = await getVideoInfo();
        console.log("تم استلام بيانات الفيديو:", data);
        
        if (data) {
          setVideoInfo(data);
          console.log("تم تحديث حالة الفيديو. مفعل:", data.isActive);
        } else {
          console.log("لم يتم العثور على بيانات الفيديو. استخدام القيم الافتراضية.");
          setVideoInfo(defaultVideoInfo);
        }
      } catch (error) {
        console.error("خطأ في تحميل بيانات الفيديو:", error);
        setVideoInfo(defaultVideoInfo);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideoInfo();
  }, []);
  
  const toggleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!isFullscreen) {
        if (playerContainerRef.current.requestFullscreen) {
          playerContainerRef.current.requestFullscreen();
        } else if ((playerContainerRef.current as any).webkitRequestFullscreen) {
          (playerContainerRef.current as any).webkitRequestFullscreen();
        } else if ((playerContainerRef.current as any).msRequestFullscreen) {
          (playerContainerRef.current as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);
  
  // تحويل الرابط العادي إلى رابط embed للعرض
  const embedUrl = convertYouTubeUrl(videoInfo.videoUrl);
  
  if (!videoInfo || !videoInfo.isActive) {
    console.log("الفيديو غير مفعل أو البيانات فارغة. isActive =", videoInfo?.isActive);
    return null; // لا يتم عرض القسم إذا كان الفيديو غير مفعل
  }
  
  return (
    <section 
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-blue-900/20 to-gray-900 overflow-hidden"
      id="video"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{videoInfo.title}</h2>
          <p className="max-w-2xl mx-auto text-gray-300">{videoInfo.description}</p>
        </motion.div>
        
        <motion.div 
          style={{ opacity, scale }}
          className="max-w-4xl mx-auto"
        >
          <div 
            ref={playerContainerRef}
            className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          >
            {/* توهج في الخلفية */}
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-600/30 via-purple-600/20 to-blue-400/30 rounded-2xl blur-sm -z-10"></div>
            
            {/* طبقة خلفية الفيديو */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-blue-900/50 backdrop-blur-sm z-0"></div>
            
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : null}
            
            <iframe
              ref={videoRef}
              className="absolute inset-[3px] w-[calc(100%-6px)] h-[calc(100%-6px)] z-10 rounded-xl shadow-inner"
              src={embedUrl}
              title={videoInfo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
            ></iframe>
            
            {/* زر ملء الشاشة */}
            <div className="absolute bottom-4 right-4 z-20">
              <button 
                className="p-3 bg-black/70 backdrop-blur-sm rounded-full transition-all hover:scale-110 text-blue-400 hover:text-blue-300 hover:bg-black/90 shadow-lg"
                onClick={toggleFullscreen}
                aria-label="وضع ملء الشاشة"
              >
                <FaExpand size={18} />
              </button>
            </div>
            
            {/* زخرفة */}
            <div className="absolute top-4 left-4 w-16 h-px bg-gradient-to-r from-blue-400 to-transparent z-20"></div>
            <div className="absolute top-4 right-4 w-16 h-px bg-gradient-to-l from-blue-400 to-transparent z-20"></div>
            <div className="absolute bottom-4 left-4 w-16 h-px bg-gradient-to-r from-blue-400 to-transparent z-20"></div>
          </div>
        </motion.div>
      </div>
      
      {/* زخرفة خلفية */}
      <div className="absolute inset-0 bg-noise opacity-5 z-10"></div>
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-gray-900 to-transparent z-5"></div>
      <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-900 to-transparent z-5"></div>
    </section>
  );
};

export default VideoSection; 