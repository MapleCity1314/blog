"use client";

import { Fingerprint, Mail, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type Contact = {
  email: string;
  phone: string;
  realEmail: string;
  realPhone: string;
};

type EncryptedContactProps = {
  contact: Contact;
  isDecrypted: boolean;
  onDecrypt: () => void;
};

export function EncryptedContact({ contact, isDecrypted, onDecrypt }: EncryptedContactProps) {
  return (
    <div className="p-4 rounded-lg border border-border bg-background/50 backdrop-blur-sm max-w-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-muted-foreground">
          <Shield size={12} className={isDecrypted ? "text-emerald-500" : "text-amber-500"} />
          <span>Communication Channel</span>
        </div>
        <div
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded border",
            isDecrypted
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
              : "border-amber-500/30 bg-amber-500/10 text-amber-500 animate-pulse"
          )}
        >
          {isDecrypted ? "SECURE_OPEN" : "ENCRYPTED"}
        </div>
      </div>
      <div className="space-y-2 font-mono text-sm">
        <div className="flex items-center gap-3">
          <Mail size={14} className="text-muted-foreground" />
          {isDecrypted ? (
            <span className="text-foreground select-all">{contact.realEmail}</span>
          ) : (
            <span className="text-muted-foreground/50 blur-[2px] select-none">{contact.email}</span>
          )}
        </div>
        {!isDecrypted ? (
          <button
            onClick={onDecrypt}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 border border-dashed border-primary/30 text-primary text-xs font-bold uppercase hover:bg-primary/5 transition-colors rounded"
          >
            <Fingerprint size={14} />
            <span>Tap to Decrypt Identity</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
