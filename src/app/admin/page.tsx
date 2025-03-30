"use client";
import { useState, useEffect, useRef } from "react";
import AuthCheck from "../components/AuthCheck";
import { FaCamera, FaTrash, FaSave, FaPlus, FaTimes, FaUser, FaBriefcase, FaPhone, FaHome, FaClipboard, FaEnvelope, FaWhatsapp, FaEdit, FaMapMarkerAlt, FaProjectDiagram, FaFileAlt, FaPause, FaPlay, FaLink, FaGlobe, FaFacebook, FaInstagram, FaTwitter, FaTv, FaFilm, FaYoutube, FaAward, FaCertificate, FaHistory, FaMicrophone, FaHeadphones, FaChevronUp, FaChevronDown, FaList, FaInfoCircle, FaPalette, FaCheck, FaLinkedin, FaEye, FaEyeSlash, FaImage, FaVideo, FaLock, FaMinus, FaBars, FaUndo, FaArrowUp, FaArrowDown, FaBan, FaUserCircle, FaVideo, FaInfoCircle, FaBriefcase, FaClock, FaFolderOpen, FaEnvelope, FaDownload, FaSave, FaTrash, FaUpload, FaAngleDown, FaAngleUp, FaImage, FaLink, FaFacebookSquare, FaTwitterSquare, FaInstagram, FaLinkedin, FaYoutube, FaTags, FaIdCard } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  DataService,
  getHeroInfo, saveHeroInfo,
  getPersonalInfo, savePersonalInfo,
  getExperiences, saveExperiences,
  getProjects, saveProjects,
  getContactInfo, saveContactInfo,
  getSocialLinks, saveSocialLinks,
  getCVFiles, saveCVFiles,
  getTimelineItems, saveTimelineItems,
  saveVideoInfo,
  getVideoInfo,
  getHeaderLinks,
  saveHeaderLinks,
  getCategories,
  saveCategories,
  getContactVCard, saveContactVCard, uploadContactPhoto
} from "@/lib/firebase/data-service";
import { FiLogOut } from "react-icons/fi";
import { HeroInfo, PersonalInfo, Experience, Project, ContactInfo, SocialLink, CVInfo, TimelineItem, VideoInfo, ContactVCard } from "@/types";
import { collection, getDocs, doc, setDoc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [activeTab, setActiveTab] = useState<string>("hero");

  // State variables for hero info
  const [heroInfo, setHeroInfo] = useState({
    name: '',
    title: '',
    subtitle: '',
    description: '',
    image: '',
    socialLinks: {
      whatsapp: '',
      instagram: '',
      facebook: '',
      youtube: '',
      soundcloud: '',
      email: ''
    }
  });

  // Loading state
  const [loading, setLoading] = useState(false);

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gray-900 text-white py-12">
        <div className="container mx-auto max-w-6xl">
          {message && (
            <div className={`mb-4 p-4 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {message.text}
            </div>
          )}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
          </div>

          {/* أزرار التنقل بين الأقسام */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              <button 
                onClick={() => setActiveTab("hero")} 
                className={`px-4 py-2 rounded-lg transition-colors duration-300 ${activeTab === "hero" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
              >
                <FaHome className="inline ml-2" /> القسم الرئيسي
              </button>
            </div>
          </div>

          {/* محتوى القسم النشط */}
          {activeTab === "hero" && (
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-6 border-b pb-3">معلومات القسم الرئيسي</h2>
              <p>قريبًا سيتم إعادة بناء لوحة التحكم</p>
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
