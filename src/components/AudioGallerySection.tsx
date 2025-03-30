"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

interface AudioTrack {
  id: number;
  title: string;
  description: string;
  category: string;
  audioUrl: string;
}

const AudioGallerySection = () => {
  const [playing, setPlaying] = useState<number | null>(null);
  const [muted, setMuted] = useState<boolean>(false);
  const [filter, setFilter] = useState<string>("all");
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});
  
  const audioTracks: AudioTrack[] = [
    {
      id: 1,
      title: "مؤثر صوتي للمعارك",
      description: "تصميم مؤثرات صوتية لمشهد معركة في فيلم ياباني أصلي",
      category: "sfx",
      audioUrl: "/demo-audio.mp3"
    },
    {
      id: 2,
      title: "موسيقى تصويرية",
      description: "موسيقى تصويرية لمشهد درامي في مسلسل الكبريت الأحمر",
      category: "music",
      audioUrl: "/demo-audio.mp3"
    },
    {
      id: 3,
      title: "هندسة صوت - حوار",
      description: "معالجة صوتية لمشهد حواري في فيلم أخلاق العبيد",
      category: "dialog",
      audioUrl: "/demo-audio.mp3"
    },
    {
      id: 4,
      title: "مؤثرات بيئية",
      description: "تصميم أصوات بيئية لخلفية برنامج تعالى اشرب شاي",
      category: "sfx",
      audioUrl: "/demo-audio.mp3"
    },
    {
      id: 5,
      title: "مكساج نهائي",
      description: "المكساج النهائي لفيلم عندما يقع الإنسان في مستنقع أفكاره",
      category: "mixing",
      audioUrl: "/demo-audio.mp3"
    },
    {
      id: 6,
      title: "تعليق صوتي",
      description: "تسجيل وهندسة تعليق صوتي لبرنامج وثائقي",
      category: "voiceover",
      audioUrl: "/demo-audio.mp3"
    }
  ];
  
  const filteredTracks = filter === "all" 
    ? audioTracks 
    : audioTracks.filter(track => track.category === filter);
  
  const categories = [
    { id: "all", label: "الكل" },
    { id: "sfx", label: "مؤثرات صوتية" },
    { id: "music", label: "موسيقى" },
    { id: "dialog", label: "حوار" },
    { id: "mixing", label: "مكساج" },
    { id: "voiceover", label: "تعليق صوتي" }
  ];
  
  const handlePlay = (id: number) => {
    if (playing === id) {
      audioRefs.current[id]?.pause();
      setPlaying(null);
    } else {
      // إيقاف أي ملف يعمل حالياً
      if (playing !== null && audioRefs.current[playing]) {
        audioRefs.current[playing]?.pause();
      }
      
      audioRefs.current[id]?.play();
      setPlaying(id);
    }
  };
  
  const toggleMute = () => {
    setMuted(!muted);
    
    // تطبيق الكتم على جميع ملفات الصوت
    Object.keys(audioRefs.current).forEach(key => {
      if (audioRefs.current[Number(key)]) {
        audioRefs.current[Number(key)]!.muted = !muted;
      }
    });
  };
  
  // تسجيل المراجع الصوتية
  useEffect(() => {
    audioTracks.forEach(track => {
      if (!audioRefs.current[track.id]) {
        const audio = new Audio(track.audioUrl);
        audio.addEventListener('ended', () => {
          setPlaying(null);
        });
        audioRefs.current[track.id] = audio;
      }
    });
    
    // تنظيف عند إلغاء التحميل
    return () => {
      audioTracks.forEach(track => {
        if (audioRefs.current[track.id]) {
          audioRefs.current[track.id]?.pause();
          audioRefs.current[track.id] = null;
        }
      });
    };
  }, [audioTracks]);
  
  return (
    <section className="py-16 bg-gradient-to-b from-gray-900/50 to-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            معرض <span className="text-gradient-gold">الأعمال الصوتية</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            استمع إلى نماذج من أعمالي الصوتية المختلفة، من تصميم المؤثرات إلى المكساج النهائي
          </p>
        </motion.div>
        
        {/* فلاتر التصنيف */}
        <div className="flex flex-wrap justify-center mb-8 gap-2 px-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`px-3 py-2 text-sm md:text-base md:px-4 md:py-2 rounded-full transition-all ${
                filter === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800/60 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        
        {/* زر كتم الصوت الرئيسي */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-all"
            aria-label={muted ? "إلغاء كتم الصوت" : "كتم الصوت"}
          >
            {muted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
        </div>
        
        {/* قائمة المقاطع الصوتية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredTracks.map((track) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, margin: "-50px" }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <div className="p-4 md:p-5 h-full flex flex-col">
                <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                  <h3 className="text-lg md:text-xl font-bold text-white">{track.title}</h3>
                  <div className="bg-blue-600/20 text-blue-400 text-xs rounded-full px-2 py-1 whitespace-nowrap">
                    {categories.find(c => c.id === track.category)?.label}
                  </div>
                </div>
                
                <p className="text-gray-300 flex-grow mb-4 text-sm">
                  {track.description}
                </p>
                
                <div className="flex justify-between items-center mt-auto flex-wrap gap-2">
                  <button
                    onClick={() => handlePlay(track.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm md:px-4 md:py-2 rounded-lg transition-all ${
                      playing === track.id
                        ? "bg-red-600/80 hover:bg-red-700 text-white"
                        : "bg-blue-600/80 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {playing === track.id ? <FaPause /> : <FaPlay />}
                    <span className="whitespace-nowrap">{playing === track.id ? "إيقاف" : "تشغيل"}</span>
                  </button>
                  
                  <div className="h-1 w-1/3 bg-gray-700 rounded-full overflow-hidden hidden md:block">
                    <div 
                      className={`h-full bg-blue-500 ${playing === track.id ? "animate-pulse" : ""}`}
                      style={{ width: playing === track.id ? "100%" : "0%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* رسالة عندما لا توجد نتائج */}
        {filteredTracks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">لا توجد مقاطع في هذه الفئة</p>
            <button 
              onClick={() => setFilter('all')} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              عرض كل المقاطع
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AudioGallerySection; 