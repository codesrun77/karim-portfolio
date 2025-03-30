"use client";

import HeroSection from "@/components/HeroSection";
import VideoSection from "@/components/VideoSection";
import InfoSection from "@/components/InfoSection";
import ExperienceSection from "@/components/ExperienceSection";
import TimelineSection from "@/components/TimelineSection";
import WorksSection from "@/components/WorksSection";
import ContactSection from "@/components/ContactSection";

export default function Home() {
  return (
    <div className="min-h-screen font-cairo">
      <HeroSection />
      <VideoSection />
      <div className="z-10 relative">
        <InfoSection />
      </div>
      <ExperienceSection />
      <TimelineSection />
      <WorksSection />
      <ContactSection />
    </div>
  );
}
