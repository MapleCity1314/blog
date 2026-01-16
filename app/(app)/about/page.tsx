"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, User, Cpu, Code, Briefcase, 
  Globe, Mail, Phone, Shield, ArrowUpRight, 
  Fingerprint, Download, Copy, Check
} from "lucide-react";
import AmbientBackground from "@/components/ambient-background";
import FrameSequencePlayer from "@/components/frame/frame-sequence-player";
import { cn } from "@/lib/utils";

// --- Resume Data (Extracted from PDF) ---
const PROFILE = {
  name: "Presto",
  alias: "z0_DEV",
  role: "Full-stack Engineer / AI Specialist",
  exp: "2 Years",
  location: "Hangzhou, CN",
  // 敏感信息加密处理
  contact: {
    email: "murder******@outlook.com",
    phone: "155****9093",
    realEmail: "murder051215@outlook.com",
    realPhone: "15541649093"
  }
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
  useEffect(() => {
    fetch("/api/frames")
      .then((res) => res.json())
      .then((data) => {
        if (data.frames) setFrames(data.frames);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen text-foreground font-sans selection:bg-primary selection:text-white overflow-x-hidden">
      <AmbientBackground />

      <main className="max-w-5xl mx-auto px-6 py-20 lg:py-32 flex flex-col gap-20">
        
        {/* === HEADER: IDENTITY CARD === */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Avatar / Ghost Container */}
            <div className="md:col-span-4 flex justify-center md:justify-start">
                <div className="relative w-48 h-48 rounded-full border border-border bg-background/50 backdrop-blur-md flex items-center justify-center overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all duration-500" />
                    <div className="scale-75 group-hover:scale-90 transition-transform duration-500">
                        {frames.length > 0 && (
                          <FrameSequencePlayer
                            frames={frames}
                            config={{
                              scaleX: 1.15,
                              scaleY: 0.9,
                              fps: 40,
                            }}
                          />
                        )}
                    </div>
                    {/* 扫描线动画 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent w-full h-1 animate-scan" />
                </div>
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


        {/* === SKILL MATRIX: 技能模块 === */}
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


        {/* === EXPERIENCE LOG: 项目经历 === */}
        <section>
            <SectionTitle title="Execution_Logs (Projects)" icon={<Terminal size={16}/>} />
            
            <div className="relative border-l border-dashed border-border ml-3 md:ml-6 space-y-12 pb-12">
                {EXPERIENCES.map((exp, idx) => (
                    <div key={idx} className="relative pl-8 md:pl-12 group">
                        {/* Timeline Node */}
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

                        <div className="flex flex-wrap gap-2">
                            {exp.tech.map((t, i) => (
                                <span key={i} className="text-[10px] font-mono text-muted-foreground/60">
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>


        {/* === EDUCATION & DOWNLOAD === */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <SectionTitle title="Origin_Data (Education)" icon={<Briefcase size={16}/>} />
                <div className="p-6 rounded-xl border border-border bg-background/30">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">Liaoning Provincial College of Communications</h3>
                        <span className="text-xs font-mono text-muted-foreground">2024 - 2027</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Major: AI Technology Application</p>
                    <p className="text-xs text-muted-foreground mt-4 border-t border-border/50 pt-2">
                        Led the customization of the Online OJ system, improving user efficiency by 40%.
                    </p>
                </div>
            </div>

            <div>
                 <SectionTitle title="Data_Export" icon={<Download size={16}/>} />
                 <div className="h-full flex flex-col justify-center items-start gap-4 p-6 rounded-xl border border-dashed border-border bg-muted/10">
                    <p className="text-sm text-muted-foreground">
                        Download the full resume version (PDF) with detailed architectural diagrams.
                    </p>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-bold font-mono text-xs rounded-lg hover:bg-primary hover:text-white transition-all shadow-lg hover:shadow-primary/20">
                        <Download size={16} />
                        <span>INITIALIZE_DOWNLOAD.PDF</span>
                    </button>
                 </div>
            </div>
        </section>

      </main>
    </div>
  );
}


// --- COMPONENTS ---

// 1. 标题组件
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

// 2. 加密通讯组件 (核心创意)
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
                <div className="flex items-center gap-3">
                    <Phone size={14} className="text-muted-foreground" />
                    {isDecrypted ? (
                        <span className="text-foreground select-all">{PROFILE.contact.realPhone}</span>
                    ) : (
                         <span className="text-muted-foreground/50 blur-[2px] select-none">{PROFILE.contact.phone}</span>
                    )}
                </div>
            </div>

            {!isDecrypted && (
                <button 
                    onClick={onDecrypt}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-primary/30 text-primary text-xs font-bold uppercase hover:bg-primary/5 transition-colors rounded"
                >
                    <Fingerprint size={14} />
                    <span>Tap to Decrypt Identity</span>
                </button>
            )}
        </div>
    )
}