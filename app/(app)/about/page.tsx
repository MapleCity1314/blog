"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, User, Cpu, Code, Briefcase, 
  Globe, Mail, Phone, Shield, ArrowUpRight, 
  Fingerprint, Download, Copy, Check, Heart, Link as LinkIcon, Lock
} from "lucide-react";
import AmbientBackground from "@/components/ambient-background";
import FrameSequencePlayer from "@/components/frame/frame-sequence-player";
import { cn } from "@/lib/utils";

// --- Resume Data ---
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

// --- Love / Partner Data (新增配置) ---
const PARTNER = {
  myAvatar: "/i.jpg", // 替换为你的头像路径
  partnerAvatar: "/u.jpg", // 替换为爱人的头像路径
  startDate: "2025-05-24", // 假设这是237天前的日期，你可以修改为真实的纪念日
  daysTogether: 237, 
  alias1: "Presto",
  alias2: "My Muse", // 或者用 "Player 2", "Co-Pilot"
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

export default function AboutPage() {
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [frames, setFrames] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    // 从 API 加载 frames 数据
    fetch("/api/frames")
      .then((res) => res.json())
      .then((data) => {
        if (data.frames && Array.isArray(data.frames)) {
          setFrames(data.frames);
        }
      })
      .catch((error) => {
        console.error("Failed to load frames:", error);
      });
  }, []);

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      <AmbientBackground />

      <main className="max-w-5xl mx-auto px-6 py-20 lg:py-32 flex flex-col gap-20">
        
        {/* === HEADER: IDENTITY CARD === */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Avatar / Ghost Container */}
            <div className="md:col-span-4 flex flex-col gap-6">
                <div className="relative w-48 h-48 rounded-full border border-border bg-background/50 backdrop-blur-md flex items-center justify-center overflow-hidden group mx-auto md:mx-0">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500" />
                    <div className="scale-75 group-hover:scale-90 transition-transform duration-500 text-muted-foreground/50 w-full h-full flex items-center justify-center">
                        {/* 优先显示动画 frames，如果没有则显示头像图片，最后才显示图标 */}
                        {frames.length > 0 ? (
                          <FrameSequencePlayer
                            frames={frames}
                            config={{ scaleX: 1.15, scaleY: 0.9, fps: 40 }}
                          />
                        ) : imageError ? (
                          <User size={64} />
                        ) : (
                          <img 
                            src={PARTNER.myAvatar} 
                            alt={PROFILE.name}
                            className="w-full h-full object-cover rounded-full"
                            onError={() => setImageError(true)}
                          />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent w-full h-1 animate-scan" />
                </div>

                {/* --- 新增：双人链接模块 (Neural Link) --- */}
                <NeuralLinkModule />
            </div>

            {/* Basic Info */}
            <div className="md:col-span-8 space-y-6">
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-mono font-bold uppercase border border-primary/20">
                        Level 20 // {PROFILE.alias}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                </div>
                
                <h1 className="text-5xl md:text-7xl font-logo leading-none">
                    {PROFILE.name}
                </h1>
                
                <p className="text-lg text-muted-foreground font-light max-w-2xl">
                    Full-stack developer obsessed with <span className="text-foreground font-medium">Engineering Quality</span> and <span className="text-foreground font-medium">AI Agents</span>. 
                    Contributor to Next.js. Building the future of Web3 & Quant tools.
                </p>

                {/* 隐私保护通讯模块 */}
                <EncryptedContact isDecrypted={isDecrypted} onDecrypt={() => setIsDecrypted(true)} />
            </div>
        </section>


        {/* === SKILL MATRIX === */}
        <section>
            <SectionTitle title="Neural_Modules (Tech Stack)" icon={<Cpu size={16}/>} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SKILLS.map((skill, idx) => (
                    <div key={idx} className="p-5 rounded-xl border border-border bg-background/30 hover:border-primary/50 transition-all group">
                        <h3 className="text-sm font-bold font-mono uppercase text-muted-foreground mb-4 group-hover:text-primary transition-colors">
                            {skill.category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {skill.items.map((item, i) => (
                                <span key={i} className="px-2 py-1 rounded-md bg-muted/50 text-xs font-medium border border-transparent hover:border-border transition-colors">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>


        {/* === EXPERIENCE LOG === */}
        <section>
            <SectionTitle title="Execution_Logs (Projects)" icon={<Terminal size={16}/>} />
            <div className="relative border-l border-dashed border-border ml-3 md:ml-6 space-y-12 pb-12">
                {EXPERIENCES.map((exp, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-12 group">
                        <div className="absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border border-background bg-muted-foreground group-hover:bg-primary group-hover:scale-125 transition-all" />
                        <div className="flex flex-col md:flex-row md:items-baseline justify-between mb-2">
                            <h3 className="text-2xl font-bold font-sans group-hover:text-primary transition-colors">
                                {exp.company}
                            </h3>
                            <span className="font-mono text-xs text-muted-foreground">{exp.period}</span>
                        </div>
                        <div className="mb-4 flex items-center gap-2">
                             <span className="text-xs font-mono px-2 py-0.5 rounded border border-border text-muted-foreground">
                                {exp.role}
                             </span>
                        </div>
                        <p className="text-muted-foreground mb-4 max-w-3xl leading-relaxed">
                            {exp.desc}
                        </p>
                        <div className="bg-muted/30 rounded-lg p-3 border-l-2 border-primary/50 text-sm text-foreground/80 mb-4">
                            <span className="font-bold text-primary mr-2">Impact:</span>
                            {exp.highlight}
                        </div>
                    </div>
                ))}
            </div>
        </section>

      </main>
    </div>
  );
}

// --- COMPONENTS ---

function SectionTitle({ title, icon }: { title: string, icon: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-muted rounded-md text-foreground">
                {icon}
            </div>
            <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-muted-foreground">
                {title}
            </h2>
        </div>
    )
}

function EncryptedContact({ isDecrypted, onDecrypt }: { isDecrypted: boolean, onDecrypt: () => void }) {
    return (
        <div className="p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm max-w-lg">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-muted-foreground">
                    <Shield size={12} className={isDecrypted ? "text-emerald-500" : "text-amber-500"} />
                    <span>Communication Channel</span>
                </div>
                <div className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded border",
                    isDecrypted 
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" 
                        : "border-amber-500/30 bg-amber-500/10 text-amber-500 animate-pulse"
                )}>
                    {isDecrypted ? "SECURE_OPEN" : "ENCRYPTED"}
                </div>
            </div>
            <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-3">
                    <Mail size={14} className="text-muted-foreground" />
                    {isDecrypted ? (
                         <span className="text-foreground select-all">{PROFILE.contact.realEmail}</span>
                    ) : (
                        <span className="text-muted-foreground/50 blur-[2px] select-none">{PROFILE.contact.email}</span>
                    )}
                </div>
                {!isDecrypted && (
                <button onClick={onDecrypt} className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-primary/30 text-primary text-xs font-bold uppercase hover:bg-primary/5 transition-colors rounded">
                    <Fingerprint size={14} />
                    <span>Tap to Decrypt Identity</span>
                </button>
            )}
            </div>
        </div>
    )
}

// --- 新增组件：情侣双核链接模块 ---
function NeuralLinkModule() {
  return (
    <div className="relative group p-4 rounded-xl border border-pink-500/20 bg-background/40 backdrop-blur-sm overflow-hidden hover:border-pink-500/40 transition-all duration-500">
      
      {/* 背景动态网格 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 标题栏 */}
      <div className="flex justify-between items-center mb-4 relative z-10">
         <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-pink-500/80 uppercase tracking-wider">
            <LinkIcon size={12} className="animate-pulse" />
            <span>Dual_Core Link</span>
         </div>
         <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
            <Lock size={10} />
            <span>E2EE</span>
         </div>
      </div>

      {/* 头像链接区域 */}
      <div className="flex items-center justify-between px-2 relative z-10">
         
         {/* User 1 (You) */}
         <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-primary/30 p-0.5 relative">
                {/* 你的头像 (占位符) */}
                <div className="w-full h-full rounded-full bg-muted overflow-hidden">
                    <img src={PARTNER.myAvatar} alt="Me" className="w-full h-full object-cover opacity-80" />
                </div>
                {/* 在线状态点 */}
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{PARTNER.alias1}</span>
         </div>

         {/* 连接线动画 */}
         <div className="flex-1 flex flex-col items-center px-2">
             <div className="relative w-full h-px bg-gradient-to-r from-blue-500/20 via-pink-500/50 to-purple-500/20">
                 {/* 传输粒子的动画 */}
                 <motion.div 
                    className="absolute top-[-1px] left-0 w-2 h-0.5 bg-pink-400 blur-[1px]"
                    animate={{ left: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                 />
             </div>
             <div className="mt-2 flex items-center gap-1 text-pink-400">
                <Heart size={10} className="fill-pink-400/50 animate-pulse" />
                <span className="text-xs font-bold font-mono tabular-nums">{PARTNER.daysTogether}d</span>
             </div>
             <span className="text-[9px] text-muted-foreground/50 scale-90 uppercase">Connection Uptime</span>
         </div>

         {/* User 2 (Partner) */}
         <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/30 p-0.5 relative">
                {/* 对方头像 (占位符) */}
                <div className="w-full h-full rounded-full bg-muted overflow-hidden">
                    <img src={PARTNER.partnerAvatar} alt="Partner" className="w-full h-full object-cover opacity-80" />
                </div>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">{PARTNER.alias2}</span>
         </div>

      </div>
    </div>
  )
}