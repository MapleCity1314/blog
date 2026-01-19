"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUp, Github, Twitter, Mail, Command } from "lucide-react";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/yourusername", icon: Github },
  { label: "Twitter", href: "https://twitter.com/yourusername", icon: Twitter },
  { label: "Email", href: "mailto:your@email.com", icon: Mail },
];

const footerLinks = [
  { label: "Timeline", href: "/timeline" },
  { label: "Friends", href: "/friends" },
  { label: "About", href: "/about" },
];

const SITE_START_AT = new Date("2025-01-01T23:20:13+08:00");

const formatUptime = (startAt: Date) => {
  const diffMs = Math.max(0, Date.now() - startAt.getTime());
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${days}天${hours}小时`;
};

/**
 * === 3D 流体光带 (修复版) ===
 * 调整了层级和遮罩逻辑，防止遮挡文字
 */
const FluidStrip = () => {
  return (
    // 容器设为 z-0，确保它永远在文字(z-10/20)的下面
    // pointer-events-none 确保鼠标能穿透光效点击下面的按钮
    <div className="absolute top-0 left-0 w-full h-[1px] z-0 pointer-events-none select-none">
      
      {/* 
         光效容器：
         向上一半 (top-[-60px])，让光效中心对准 Footer 的上边缘线
         这样光晕会自然地向上和向下溢出，而不会生硬地切断
      */}
      <div className="absolute inset-x-0 top-[-60px] h-40 overflow-visible opacity-60 dark:opacity-90">
        
        {/* 
           === 核心修复点：遮罩层 ===
           只在左右两侧做渐隐，中间保持通透。
           去掉了原本向下的遮罩，防止遮挡下方的文字内容。
        */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-transparent to-background w-full h-full" />
        
        {/* 
           流体混合层 
           mix-blend-mode: plus-lighter 让光效叠加变亮
        */}
        <div className="relative w-full h-full mix-blend-plus-lighter filter blur-[30px]">
            
            {/* 青色流体 - 基础层 */}
            <motion.div
              className="absolute top-10 left-[15%] w-[30%] h-20 bg-cyan-500/40 rounded-full"
              animate={{
                x: ["-10%", "10%", "-10%"],
                scale: [1, 1.1, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* 紫色流体 - 核心层 */}
            <motion.div
              className="absolute top-5 left-[35%] w-[40%] h-24 bg-purple-600/50 rounded-full"
              animate={{
                x: ["5%", "-5%", "5%"],
                y: [-5, 5, -5],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* 粉色/洋红流体 - 高光层 */}
            <motion.div
              className="absolute top-8 left-[60%] w-[25%] h-16 bg-pink-500/40 rounded-full"
              animate={{
                x: ["0%", "10%", "0%"],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />
        </div>
      </div>

      {/* 物理分割线：放在光效之上，但仍在文字之下 */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/15 to-transparent z-10" />
    </div>
  );
};

export default function Footer() {
  const [uptime, setUptime] = useState("计算中…");

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const updateUptime = () => {
      setUptime(formatUptime(SITE_START_AT));
    };

    updateUptime();
    const timer = setInterval(updateUptime, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    // Footer 容器
    <footer className="relative w-full mt-32 pt-16 pb-8 bg-background overflow-hidden">
        
      {/* 光带层：z-0 */}
      <FluidStrip />

      {/* 
         内容层：z-20 
         关键修改：添加 relative 和 z-20，确保内容绝对浮在光带和遮罩之上
      */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 flex flex-col gap-5">
            <Link href="/" className="font-logo text-4xl tracking-tight select-none w-fit text-foreground">
              Presto.
            </Link>
            <p className="text-muted-foreground font-light max-w-sm leading-relaxed text-sm">
              Exploring the boundaries between design, code, and vibes. 
              Building trustless agents in a trust-filled world.
            </p>
            
            <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                <span>Powered by</span>
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient font-black">
                    z0 Agent
                </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-bold text-foreground/40 tracking-[0.2em] uppercase">
                Explore
            </h3>
            <ul className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-2 group w-fit"
                  >
                    <span className="w-0.5 h-0.5 rounded-full bg-foreground/0 group-hover:bg-indigo-500 transition-colors duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Connect & Actions */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xs font-bold text-foreground/40 tracking-[0.2em] uppercase">
                Connect
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 rounded-full bg-foreground/5 hover:bg-foreground/10 transition-colors overflow-hidden"
                  aria-label={item.label}
                >
                  <item.icon size={16} className="text-foreground/70 group-hover:text-foreground relative z-10 transition-colors" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
            
            <button
                onClick={scrollToTop}
                className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group w-fit"
            >
                <div className="p-1.5 rounded-md border border-foreground/10 group-hover:border-foreground/30 bg-background transition-colors">
                    <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <span>Back to top</span>
            </button>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-foreground/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground/80 font-light">
          
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <span>&copy; {currentYear} Presto. All rights reserved.</span>
            <span>本站居然已经运行了{uptime}</span>
            
            <a 
                href="https://beian.miit.gov.cn/" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-foreground transition-colors group px-2 py-1 -ml-2 rounded-md hover:bg-foreground/5"
            >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <span className="font-mono tracking-tight group-hover:underline decoration-foreground/20 underline-offset-4">
                    辽ICP备2024044961号
                </span>
            </a>
          </div>

          <div className="flex items-center gap-1.5 opacity-40 hover:opacity-100 transition-opacity select-none">
            <Command size={10} /> 
            <span className="font-mono tracking-wider">CTRL+K</span>
          </div>

        </div>
      </div>
    </footer>
  );
}
