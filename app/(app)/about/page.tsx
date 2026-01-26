"use client";

import { useState } from "react";
import AmbientBackground from "@/components/ambient-background";
import { AboutExperience } from "@/components/about/about-experience";
import { AboutHero } from "@/components/about/about-hero";
import { AboutSkills } from "@/components/about/about-skills";

const PROFILE = {
  name: "Presto",
  alias: "z0_DEV",
  role: "Full-stack Engineer / AI Specialist",
  exp: "2 Years",
  location: "Hangzhou, CN",
  contact: {
    email: "murder******@outlook.com",
    phone: "155****9093",
    realEmail: "murder051215@outlook.com",
    realPhone: "15541649093"
  }
};

const PARTNER = {
  myAvatar: "static/i.jpg",
  partnerAvatar: "static/u.jpg",
  startDate: "2025-05-24",
  daysTogether: 237, 
  alias1: "Presto",
  alias2: "My Muse",
};

const SKILLS = [
  { category: "Core", items: ["Next.js (Contributor)", "React 19", "TypeScript", "RSC"] },
  { category: "Backend", items: ["Go", "Rust", "PostgreSQL", "Nest.js"] },
  { category: "AI & Agent", items: ["LangChain", "Vibe Coding", "RAG", "Workflow SDK"] },
  { category: "Infra", items: ["Docker", "CI/CD", "Web3/Solana", "Vercel"] },
];

const EXPERIENCES = [
  {
    id: "01",
    role: "Developer",
    company: "z0 Gateway",
    period: "2025.11 - 2025.12",
    desc: "Enterprise-grade AI Gateway compatible with OpenAI API.",
    tech: ["Go", "Workflow SDK", "Next.js"],
    highlight: "Reduced model integration cost by >70%."
  },
  {
    id: "02",
    role: "Creator",
    company: "z0 Agent",
    period: "2025.10 - 2025.11",
    desc: "Vibe Coding system for complex tasks with Plan/Execute/Feedback loop.",
    tech: ["Next.js 16", "RSC", "Server Actions", "mem0"],
    highlight: "AI-guided requirement completion & context management."
  },
  {
    id: "03",
    role: "Developer",
    company: "z0 Lens",
    period: "2025.11 - Present",
    desc: "Quant research platform driven by z0-Agent.",
    tech: ["WebGL", "WebSocket", "Quant Strategies"],
    highlight: "Automated Alpha evaluation & risk control metrics."
  },
];

const AVATAR_SRC = "/static/avatar.jpg";

export default function AboutPage() {
  const [isDecrypted, setIsDecrypted] = useState(false);
  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      <AmbientBackground />

      <main className="max-w-5xl mx-auto px-6 py-20 lg:py-32 flex flex-col gap-20">
        <AboutHero
          profile={PROFILE}
          partner={PARTNER}
          avatarSrc={AVATAR_SRC}
          isDecrypted={isDecrypted}
          onDecrypt={() => setIsDecrypted(true)}
        />
        <AboutSkills skills={SKILLS} />
        <AboutExperience experiences={EXPERIENCES} />
      </main>
    </div>
  );
}




