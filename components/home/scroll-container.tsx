"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import AmbientBackground from "@/components/ambient-background";
import GhostActor from "./ghost-actor";
import HeroSection from "./hero-section";
import PostsSection from "./posts-section";
import ProjectsSection from "./projects-section";
import FooterSection from "./footer-section";
import type { Post } from "@/lib/posts";

type ScrollContainerProps = {
  posts: Post[];
};

export default function ScrollContainer({ posts }: ScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });

  return (
    <div 
      ref={containerRef} 
      className="relative h-[400vh] bg-background text-foreground font-sans selection:bg-primary selection:text-white overflow-hidden"
    >
      <AmbientBackground />

      {/* 幽灵角色 */}
      <GhostActor scrollProgress={smoothProgress} />

      {/* 滚动内容区域 */}
      <HeroSection scrollProgress={smoothProgress} />
      <PostsSection posts={posts} scrollProgress={smoothProgress} />
      <ProjectsSection scrollProgress={smoothProgress} />
      <FooterSection scrollProgress={smoothProgress} />

      {/* 进度条指示器 */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 h-32 w-[1px] bg-border/30 hidden md:block">
        <motion.div 
          style={{ height: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }}
          className="w-full bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
        />
      </div>
    </div>
  );
}
