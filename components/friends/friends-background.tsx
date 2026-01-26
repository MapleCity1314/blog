"use client";

import { AnimatePresence, motion } from "framer-motion";

type FriendsBackgroundProps = {
  activeColor?: string;
  activeId: string | null;
};

export function FriendsBackground({ activeColor, activeId }: FriendsBackgroundProps) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150" />
      <AnimatePresence mode="wait">
        {activeId ? (
          <motion.div
            key={activeId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10 dark:opacity-20 transition-colors duration-1000"
              style={{ backgroundColor: activeColor || "#333" }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
