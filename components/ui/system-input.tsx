"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SystemInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function SystemInput({ label, className, ...props }: SystemInputProps) {
  const placeholderValue = props.placeholder ?? " ";

  return (
    <div className="relative w-full group">
      <input
        {...props}
        placeholder={placeholderValue}
        className={cn(
          "peer w-full bg-background/50 border border-border/60 px-4 py-3 text-sm font-mono tracking-wider outline-none transition-all",
          "focus:border-primary/50 focus:bg-background/80",
          "placeholder-transparent",
          className
        )}
      />
      <label
        className={cn(
          "absolute left-3 -top-2.5 px-2 bg-background text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-all",
          "peer-placeholder-shown:text-sm peer-placeholder-shown:top-3 peer-placeholder-shown:left-4 peer-placeholder-shown:bg-transparent",
          "peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-[10px] peer-focus:text-primary peer-focus:bg-background",
          "pointer-events-none"
        )}
      >
        {label}
      </label>
      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-primary transition-all duration-300 peer-focus:w-full" />
    </div>
  );
}
