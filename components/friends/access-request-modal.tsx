"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, ShieldCheck, X } from "lucide-react";
import type { AccessStatus } from "@/components/friends/types";

type AccessRequestModalProps = {
  accessStatus: AccessStatus;
  isOpen: boolean;
  onClose: () => void;
  onAccessGranted: (token: string) => void;
};

export function AccessRequestModal({
  accessStatus,
  isOpen,
  onClose,
  onAccessGranted,
}: AccessRequestModalProps) {
  const [isSending, setIsSending] = useState(false);
  const [isGranted, setIsGranted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsGranted(false);
      setRequestError(null);
    }
  }, [isOpen]);

  const requestAccess = async () => {
    setIsSending(true);
    setRequestError(null);
    try {
      const response = await fetch("/api/friends/access", { method: "POST" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setRequestError(data.error ?? "Request failed.");
        return;
      }
      const data = (await response.json()) as { accessToken?: string };
      const token = data.accessToken?.trim() || "";
      if (!token) {
        setRequestError("Request failed.");
        return;
      }
      setIsGranted(true);
      onAccessGranted(token);
    } catch {
      setRequestError("Request failed.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="access-request-title"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />
            <div className="p-6 md:p-8 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 id="access-request-title" className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-zinc-400" />
                    Access Request
                  </h2>
                  <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                    // Direct backend grant
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  aria-label="Close dialog"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                <p>Request a one-time access token to open the add link dialog.</p>
                <p>No email confirmation is required.</p>
              </div>

              {accessStatus.state === "approved" ? (
                <p className="text-sm text-emerald-600" aria-live="polite">
                  Access confirmed. You can add a link now.
                </p>
              ) : null}
              {accessStatus.state === "rejected" ? (
                <p className="text-sm text-rose-500" aria-live="polite">
                  {accessStatus.message ?? "Access denied."}
                </p>
              ) : null}

              {isGranted ? (
                <p className="text-sm text-emerald-600" aria-live="polite">
                  Access granted. Opening the form…
                </p>
              ) : null}
              {requestError ? (
                <p className="text-sm text-rose-500" aria-live="polite">
                  {requestError}
                </p>
              ) : null}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors touch-manipulation"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={requestAccess}
                  disabled={isSending}
                  className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {isSending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Granting Access{"\u2026"}
                    </>
                  ) : (
                    "Request Access"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
