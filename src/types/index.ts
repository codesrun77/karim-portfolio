// نماذج البيانات المستخدمة في المشروع

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  link?: string;
  year?: number;
  isActive?: boolean;
  technologies?: string[];
}

// نموذج بيانات التصنيفات
export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  order?: number;
}

export interface HeroInfo {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  profileImage?: string;
  showProfileImage: boolean;
  socialLinks?: {
    whatsapp: string;
    instagram: string;
    facebook: string;
    youtube: string;
    soundcloud: string;
    email: string;
  };
}

// إضافة نوع بيانات الفيديو التعريفي
export interface VideoInfo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  isActive: boolean;
  lastUpdate: string;
}

export interface PersonalInfo {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  icon: string;
}

export interface ContactInfo {
  id: string;
  icon: string;
  title: string;
  value: string;
  link: string;
  color?: string;
  content?: string;
  subtitle?: string;
  contactType?: string;
  buttonText?: string;
}

export interface SocialLink {
  id: string;
  icon: string;
  url: string;
  label: string;
}

// نموذج بيانات السيرة الذاتية
export interface CVInfo {
  id: string;
  title: string;
  fileUrl: string;
  description?: string;
  version: string;
  downloadCount?: number;
  lastUpdate: string;
  isActive: boolean;
}

// نموذج بيانات التايم لاين (الخط الزمني)
export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  company: string;
  description?: string;
  category: 'tv' | 'film' | 'program';
  icon?: string;
  isActive?: boolean;
} 