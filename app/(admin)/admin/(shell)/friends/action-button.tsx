"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

type ActionButtonProps = {
  label: string;
  variant?: "approve" | "reject";
  className?: string;
};

export default function ActionButton({
  label,
  variant = "approve",
  className,
}: ActionButtonProps) {
  const { pending } = useFormStatus();
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest transition disabled:opacity-60 touch-manipulation";
  const variantStyles =
    variant === "approve"
      ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
      : "bg-red-500/10 text-red-300 hover:bg-red-500/20";

  return (
    <button
      type="submit"
      aria-busy={pending}
      disabled={pending}
      className={cn(baseStyles, variantStyles, className)}
    >
      {pending ? <Loader2 size={12} className="animate-spin" /> : null}
      {label}
    </button>
  );
}
