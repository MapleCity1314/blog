"use client";

import Link from "next/link";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

type FriendsFooterProps = {
  isCopied: boolean;
  onCopy: () => void;
};

export function FriendsFooter({ isCopied, onCopy }: FriendsFooterProps) {
  return (
    <div className="absolute bottom-10 right-10 flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-6 text-xs font-mono text-zinc-400">
      <button
        onClick={onCopy}
        className="group flex items-center gap-2 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
        aria-label="Copy site info"
      >
        {isCopied ? (
          <Check size={14} className="text-emerald-500" />
        ) : (
          <Copy size={14} className="group-hover:scale-110 transition-transform" />
        )}
        <span className={cn("uppercase font-bold", isCopied && "text-emerald-500")}>
          {isCopied ? "INFO_COPIED" : "COPY_MY_INFO"}
        </span>
      </button>

      <div className="w-[1px] h-3 bg-zinc-300 dark:bg-zinc-700 hidden md:block" />

      <div className="flex items-center gap-2">
        <Terminal size={14} />
        <span>v2.0.4 // STABLE</span>
      </div>
      <Link href="/links" className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1">
        VIEW_ALL <span className="opacity-50">-{">"}</span>
      </Link>
    </div>
  );
}
