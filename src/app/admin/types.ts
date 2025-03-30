import { HeroInfo, PersonalInfo, Experience, Project, ContactInfo, SocialLink, CVInfo, TimelineItem, VideoInfo, Category } from "@/types";

// Extended interfaces for admin panel
export interface PersonalInfoExt extends PersonalInfo {
  // any additional admin-specific fields
}

export interface ExperienceExt extends Experience {
  // any additional admin-specific fields
}

export interface ProjectExt extends Project {
  // any additional admin-specific fields
}

export interface ContactInfoExt extends ContactInfo {
  // any additional admin-specific fields
}

export interface HeroInfoExt extends HeroInfo {
  // any additional admin-specific fields
}

export interface SocialLinkExt extends SocialLink {
  // any additional admin-specific fields
}

export interface CVInfoExt extends CVInfo {
  // any additional admin-specific fields
}

export interface TimelineItemExt extends TimelineItem {
  // any additional admin-specific fields
}

export interface VideoInfoExt extends VideoInfo {
  thumbnailUrl?: string;
}

export interface HeaderLink {
  name: string;
  url: string;
  isActive: boolean;
} 