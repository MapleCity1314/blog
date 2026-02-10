"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export default function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      closeButton
      richColors
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "border border-border/70 bg-background/90 text-foreground font-mono tracking-wide backdrop-blur-md",
          title: "text-xs uppercase tracking-[0.18em]",
          description: "text-xs text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground hover:opacity-90 rounded-none",
          cancelButton: "bg-muted text-muted-foreground rounded-none",
        },
      }}
      {...props}
    />
  );
}
