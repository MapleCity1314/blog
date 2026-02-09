import "server-only";

import { cache } from "react";
import { cacheLife } from "next/cache";

export type AboutProfile = {
  name: string;
  alias: string;
  role: string;
  location: string;
};

export type AboutHeroIntroPart = {
  text: string;
  highlight?: boolean;
};

export type AboutHeroMeta = {
  roleLabel: string;
  locationLabel: string;
};

export type AboutPartner = {
  myAvatar: string;
  partnerAvatar: string;
  alias1: string;
  alias2: string;
  startDate: string;
};

export type AboutSkillGroup = {
  category: string;
  items: string[];
};

export type AboutExperience = {
  id: string;
  role: string;
  company: string;
  period: string;
  desc: string;
};

export type AboutBlogSpecIcon = "cpu" | "layers" | "palette" | "monitor";

export type AboutBlogSpec = {
  label: string;
  value: string;
  icon: AboutBlogSpecIcon;
};

export type AboutBlog = {
  title: string;
  overviewTitle: string;
  overviewBody: string;
  buildStatusLabel: string;
  buildStatusValue: string;
  versionLabel: string;
  versionValue: string;
  specs: AboutBlogSpec[];
  footerLines: string[];
};

export type AboutData = {
  profile: AboutProfile;
  heroIntro: AboutHeroIntroPart[];
  heroMeta: AboutHeroMeta;
  partner: AboutPartner;
  skills: AboutSkillGroup[];
  experiences: AboutExperience[];
  blog: AboutBlog;
};

const ABOUT_DATA: AboutData = {
  profile: {
    name: "0xPresto",
    alias: "PRESTO_SYSTEM_ADMIN",
    role: "Full-stack Engineer / AI Specialist",
    location: "Hangzhou, CN",
  },
  heroIntro: [
    { text: "Web3 Full-stack Architect specialized in " },
    { text: "Next.js & Frontend Infrastructure", highlight: true },
    { text: ". Currently dedicated to the " },
    { text: "Autonomous Agent Ecosystem", highlight: true },
    { text: ", with a core research focus on AI Security and Agentic Evaluations (Evals)." },
  ],
  heroMeta: {
    roleLabel: "Primary_Role",
    locationLabel: "Current_Loc",
  },
  partner: {
    myAvatar: "/static/i.jpg",
    partnerAvatar: "/static/u.jpg",
    alias1: "0xPresto",
    alias2: "My Love",
    startDate: "2025-05-24T20:00:00+08:00",
  },
  skills: [
    { category: "Core", items: ["Next.js (Contributor)", "React 19", "TypeScript", "RSC"] },
    { category: "Backend", items: ["Go", "Rust", "PostgreSQL", "Nest.js"] },
    { category: "AI & Agent", items: ["AI SDK", "x402 protocol", "mem0", "Workflow SDK"] },
    { category: "Web3", items: ["Ethereum", "DeFi", "SpoonOS", "Trustless Agent"] },
  ],
  experiences: [
    {
      id: "01",
      role: "Developer",
      company: "z0 Gateway",
      period: "2025.11 - 2025.12",
      desc: "Enterprise-grade AI Gateway compatible with OpenAI API.",
    },
    {
      id: "02",
      role: "Creator",
      company: "z0 Agent",
      period: "2025.10 - 2025.11",
      desc: "Vibe Coding system for complex tasks with Plan/Execute/Feedback loop.",
    },
  ],
  blog: {
    title: "System_Manifest (About Blog)",
    overviewTitle: "Architecture_Overview",
    overviewBody:
      "This blog is designed as a high-performance digital terminal. It utilizes the latest advancements in web technology to ensure near-instantaneous content delivery and a seamless, data-rich user experience.",
    buildStatusLabel: "Build_Status",
    buildStatusValue: "OPTIMIZED_PRODUCTION",
    versionLabel: "Version",
    versionValue: "4.2.0-STABLE",
    specs: [
      { label: "Core_Framework", value: "Next.js 15 (App Router)", icon: "cpu" },
      { label: "Rendering", value: "RSC (React Server Components)", icon: "layers" },
      { label: "Styling", value: "Tailwind CSS / Framer Motion", icon: "palette" },
      { label: "Deployment", value: "Vercel Edge Network", icon: "monitor" },
    ],
    footerLines: [
      "THE ENTIRE INTERFACE IS CUSTOM-BUILT.",
      "NO PRE-BUILT THEMES USED.",
      "ALL SYSTEMS OPERATIONAL.",
    ],
  },
};

export const getAboutData = cache(async () => {
  "use cache";
  cacheLife("hours");
  return ABOUT_DATA;
});
