"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, Fingerprint, Cpu, ArrowRight } from "lucide-react";
import { useFormStatus } from "react-dom";
import AmbientBackground from "@/components/ambient-background";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { SystemInput } from "@/components/ui/system-input";
import type { AdminAuthState } from "@/lib/admin-auth";

type LoginAction = (
  prevState: AdminAuthState,
  formData: FormData
) => Promise<AdminAuthState>;

const initialState: AdminAuthState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      aria-busy={pending}
      disabled={pending}
      className="w-full group relative flex items-center justify-center gap-3 bg-primary py-4 text-xs font-mono font-bold text-primary-foreground uppercase tracking-widest overflow-hidden transition-all active:scale-95 disabled:opacity-70 touch-manipulation"
    >
      <span className="inline-flex items-center gap-3">
        {pending ? (
          <Cpu size={16} className="animate-spin" />
        ) : (
          <Fingerprint size={16} />
        )}
        AUTHORIZE_ENTRY
      </span>
      <ArrowRight
        size={14}
        className="transition-transform group-hover:translate-x-1"
        aria-hidden
      />
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      {pending ? (
        <span className="sr-only">INITIALIZING_AUTH…</span>
      ) : null}
    </button>
  );
}

export default function LoginPage({
  action,
  nextPath,
}: {
  action: LoginAction;
  nextPath: string;
}) {
  const [state, formAction] = React.useActionState(action, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground relative selection:bg-primary/30">
      <AmbientBackground />

      <div className="absolute top-6 right-6 flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end font-mono text-[9px] text-muted-foreground/40 leading-none">
          <span>SECURE_CONNECTION: ACTIVE</span>
          <span className="mt-1">ENCRYPTION: AES-256</span>
        </div>
        <AnimatedThemeToggler className="border border-border/40 bg-background/50 backdrop-blur" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="absolute -inset-4 border border-primary/10 -z-10" />
        <div className="absolute -inset-px border border-border/60 -z-10 bg-background/40 backdrop-blur-xl" />

        {/* L-Corners */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary" />

        <div className="p-8">
          {/* Header */}
          <header className="mb-10 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center bg-primary/10 border border-primary/20 text-primary mb-4 relative overflow-hidden group">
              <Lock size={20} />
              <div className="absolute inset-0 bg-primary/20 -translate-y-full group-hover:translate-y-0 transition-transform" />
            </div>
            <h1 className="text-xl font-bold font-mono tracking-[0.3em] uppercase italic">
              Admin_Gateway
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground mt-2 uppercase tracking-widest">
              Restricted Area // Authorization Required
            </p>
            <p className="mt-3 text-[10px] font-mono text-primary/70 uppercase tracking-[0.2em]">
              Secure_Channel_Only // TLS Required
            </p>
          </header>

          {/* Form */}
          <form action={formAction} className="space-y-8" noValidate>
            <input type="hidden" name="next" value={nextPath} />
            <div className="space-y-6">
              <SystemInput
                label="Administrator_ID"
                type="text"
                name="username"
                autoComplete="username"
                spellCheck={false}
                required
              />
              <SystemInput
                label="Access_Key"
                type="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </div>

            {state.error ? (
              <div
                role="status"
                aria-live="polite"
                className="rounded border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-[10px] font-mono text-amber-200"
              >
                {state.error}
              </div>
            ) : null}

            <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 uppercase">
              <div className="flex items-center gap-2">
                <ShieldAlert size={12} className="text-amber-500" />
                <span>Security_Check</span>
              </div>
              <span className="hover:text-primary cursor-help transition-colors">Forgot_Key?</span>
            </div>

            <SubmitButton />
          </form>

          {/* Footer Metadata */}
          <footer className="mt-10 pt-6 border-t border-dashed border-border/60">
            <div className="flex justify-between items-center text-[9px] font-mono text-muted-foreground/40 uppercase">
              <div className="flex flex-col">
                <span>Node: HZ-01</span>
                <span>Uptime: 99.9%</span>
              </div>
              <div className="text-right">
                <span>漏 0xPresto_OS</span>
                <br />
                <span>All rights reserved</span>
              </div>
            </div>
          </footer>
        </div>

        <div className="absolute -right-12 top-1/2 -rotate-90 origin-center hidden lg:block">
          <span className="text-[10px] font-mono text-muted-foreground/20 tracking-[0.5em] uppercase">
            Auth_Sequence_v4.2.0
          </span>
        </div>
      </motion.div>

      <div className="fixed inset-0 pointer-events-none z-50">
        <div className="absolute top-0 w-full h-1 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.2)] animate-scan opacity-20" />
      </div>
    </div>
  );
}
