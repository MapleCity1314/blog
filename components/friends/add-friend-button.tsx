"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

type AddFriendButtonProps = {
  canAdd: boolean;
  onClick: () => void;
};

export function AddFriendButton({ canAdd, onClick }: AddFriendButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative w-16 md:w-20 h-20 md:h-auto rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 bg-transparent flex flex-col items-center justify-center gap-4 transition-colors touch-manipulation"
      whileHover={{ scale: 0.98 }}
      whileTap={{ scale: 0.95 }}
      aria-label={canAdd ? "Add friend link" : "Request access to add friend link"}
    >
      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
        <Plus size={20} />
      </div>
      <span className="md:[writing-mode:vertical-rl] md:rotate-180 text-xs font-mono text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 uppercase tracking-widest">
        {canAdd ? "Add Node" : "Request Access"}
      </span>
    </motion.button>
  );
}
