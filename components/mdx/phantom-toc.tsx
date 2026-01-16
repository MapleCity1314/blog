"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Heading } from "@/lib/toc";

export default function PhantomTOC({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>("");
  const [isHovered, setIsHovered] = useState(false);

  // 监听滚动逻辑 (保持不变)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0% -80% 0%" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <motion.nav
      className={cn(
        // FIXED 定位：永远死死固定在窗口右侧，不随页面滚动
        "fixed right-6 top-1/2 z-50",
        "flex flex-col items-end", // 始终右对齐
        "rounded-xl overflow-hidden", // 关键：隐藏溢出，防止文字在展开前撑开宽度
        // 视觉样式
        isHovered 
          ? "bg-background/90 backdrop-blur-md border border-border/50 shadow-2xl py-4 pr-2 pl-4" 
          : "bg-transparent border-transparent py-0 pr-0 pl-0"
      )}
      // 手动控制宽高动画，而不是依赖 layout="position"，这样更稳
      animate={{
        y: "-50%", // 垂直居中
        width: isHovered ? 260 : 40, // 宽度变化：条形码(40px) -> 目录(260px)
        gap: isHovered ? 8 : 4, // 间距变化
      }}
      transition={{
        // 使用弹簧动画，但增加了阻尼(damping)，减少“果冻”效应，更稳重
        type: "spring", stiffness: 260, damping: 25 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* 顶部标题：仅展开时显示 */}
      <AnimatePresence>
        {isHovered && (
            <motion.div 
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="w-full text-[10px] font-mono font-bold uppercase text-muted-foreground/50 tracking-widest border-b border-border pb-2 whitespace-nowrap"
            >
                Index_Radar
            </motion.div>
        )}
      </AnimatePresence>

      {/* 滚动区域容器 */}
      <div 
        className={cn(
          "flex flex-col w-full transition-all",
          isHovered ? "overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin" : "overflow-hidden max-h-[80vh]"
        )}
      >
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          // 这里的 minWidth 保证线条有最短长度
          const lineWidth = Math.min(40, Math.max(8, heading.text.length * 1.5));

          return (
            <motion.a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: "smooth" });
                setActiveId(heading.id);
              }}
              // 核心动画：高度压缩
              // 悬停时：h-8 (32px) 适合阅读
              // 收起时：h-1 (4px) 极度紧密，像条形码
              animate={{
                height: isHovered ? 32 : 4,
                marginBottom: isHovered ? 0 : 2 // 收起时也要有一点点间距
              }}
              className="relative flex items-center justify-end w-full cursor-pointer group"
            >
              
              {/* === 状态 A: 信号线 (The Barcode) === */}
              {/* 只有在未悬停，或者悬停但该项未激活时显示线条背景 */}
              <motion.div
                className={cn(
                  "absolute right-0 rounded-full transition-colors duration-300",
                  isActive 
                    ? "bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)] z-10" // 激活态：发光，层级高
                    : "bg-foreground/20 group-hover:bg-foreground/40" // 普通态：暗淡
                )}
                animate={{
                    // 悬停时：激活项变为左侧指示条(4px宽)，非激活项消失(opacity 0)
                    // 收起时：变成长短不一的条形码
                    width: isHovered ? (isActive ? 3 : 0) : (isActive ? 40 : lineWidth),
                    height: isHovered ? (isActive ? 16 : 0) : 3, // 收起时线条高度
                    opacity: isHovered ? (isActive ? 1 : 0) : 1,
                    right: isHovered ? "auto" : 0, // 展开时位置由 flex 控制，收起时靠右
                    left: isHovered ? 0 : "auto", 
                }}
              />

              {/* === 状态 B: 文字标题 (The Text) === */}
              <motion.span
                className={cn(
                  "text-sm truncate w-full text-left transition-colors duration-200",
                  // 强制不换行，这是防止抽搐的关键！
                  "whitespace-nowrap",
                  heading.level === 3 && "pl-4 text-xs",
                  isActive ? "text-primary font-bold" : "text-muted-foreground group-hover:text-foreground"
                )}
                // 动画：只控制透明度和位移，不改变 DOM 布局流
                initial={{ opacity: 0, x: 10 }}
                animate={{ 
                    opacity: isHovered ? 1 : 0, 
                    x: isHovered ? 0 : 10,
                    paddingLeft: isHovered ? (isActive ? 12 : 0) : 0 // 给激活的指示条留位置
                }}
                transition={{ duration: 0.2 }} // 快速切换，减少拖泥带水
              >
                 {heading.text}
              </motion.span>
              
              {/* 激活时的背景高亮条 (仅展开时显示) */}
              {isActive && isHovered && (
                 <motion.div 
                    layoutId="toc-active-bg"
                    className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                 />
              )}

            </motion.a>
          );
        })}
      </div>
    </motion.nav>
  );
}