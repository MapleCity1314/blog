"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Friend } from "@/components/friends/types";

type FriendCardProps = {
  friend: Friend;
  isActive: boolean;
  onActivate: (id: string) => void;
};

export function FriendCard({ friend, isActive, onActivate }: FriendCardProps) {
  return (
    <motion.div
      layout
      onClick={() => onActivate(friend.id)}
      onMouseEnter={() => onActivate(friend.id)}
      className={cn(
        "relative h-full rounded-3xl overflow-hidden cursor-pointer border transition-colors duration-500 ease-out group",
        isActive
          ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl"
          : "border-transparent bg-zinc-200/50 dark:bg-zinc-900/40 hover:bg-zinc-200 dark:hover:bg-zinc-800"
      )}
      animate={{
        flex: isActive ? 4 : 1,
        opacity: 1,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
    >
      {!isActive ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 py-8 opacity-60 group-hover:opacity-100 transition-opacity">
          <span className="md:[writing-mode:vertical-rl] md:rotate-180 text-sm font-mono font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
            {friend.role}
          </span>
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden grayscale opacity-50">
            <Image src={friend.avatar} alt={friend.name} width={40} height={40} className="object-cover" />
          </div>
          <span className="hidden md:block md:[writing-mode:vertical-rl] md:rotate-180 text-xs text-zinc-300 dark:text-zinc-700">
            {friend.id}
          </span>
        </div>
      ) : null}

      <AnimatePresence>
        {isActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="absolute inset-0 p-8 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 backdrop-blur-md text-xs font-mono text-zinc-500">
                NODE_{friend.id}
              </div>
              <Link href={friend.url} target="_blank" aria-label={`Open ${friend.name} in a new tab`}>
                <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 group/btn">
                  <ArrowUpRight size={20} className="transition-transform group-hover/btn:rotate-45" />
                </div>
              </Link>
            </div>

            <div className="relative z-10">
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl lg:text-8xl font-logo text-zinc-900 dark:text-white leading-[0.9]"
                style={{ color: "var(--foreground)" }}
              >
                {friend.name}
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-4 max-w-md text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-mono"
              >
                //{friend.desc}
              </motion.p>
            </div>

            <div className="flex items-end justify-between mt-4">
              <div className="flex gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Role</span>
                  <span className="text-sm font-bold dark:text-white">{friend.role}</span>
                </div>
                <div className="w-[1px] h-8 bg-zinc-200 dark:bg-zinc-800 mx-2" />
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Status</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-bold dark:text-white">Active</span>
                  </div>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0, x: 50 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="relative w-24 h-24 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              >
                <Image src={friend.avatar} alt={friend.name} fill className="object-cover" />
                <div className="absolute inset-0 mix-blend-overlay opacity-30" style={{ backgroundColor: friend.color }} />
              </motion.div>
            </div>

            <div className="absolute -bottom-10 -right-10 text-[10rem] md:text-[14rem] font-bold text-black/5 dark:text-white/5 pointer-events-none select-none z-0 leading-none overflow-hidden">
              {friend.id}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
