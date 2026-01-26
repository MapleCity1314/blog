"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Link as LinkIcon, Loader2, Palette, Plus, Terminal, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRESET_COLORS } from "@/components/friends/constants";

type AddFriendModalProps = {
  accessToken: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function AddFriendModal({ accessToken, isOpen, onClose, onCreated }: AddFriendModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fields, setFields] = useState({
    name: "",
    role: "",
    url: "",
    avatar: "",
    desc: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof fields, string>>>({});
  const nameRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setErrors({});
      setTimeout(() => nameRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const validate = () => {
    const nextErrors: Partial<Record<keyof typeof fields, string>> = {};
    if (!fields.name.trim()) nextErrors.name = "Name is required.";
    if (!fields.role.trim()) nextErrors.role = "Role is required.";
    if (!fields.url.trim()) nextErrors.url = "Website is required.";
    if (!fields.avatar.trim()) nextErrors.avatar = "Avatar is required.";
    if (!fields.desc.trim()) nextErrors.desc = "Description is required.";
    if (fields.url.trim()) {
      try {
        new URL(fields.url.trim());
      } catch {
        nextErrors.url = "Use a valid URL.";
      }
    }
    if (fields.avatar.trim()) {
      try {
        new URL(fields.avatar.trim());
      } catch {
        nextErrors.avatar = "Use a valid URL.";
      }
    }
    setErrors(nextErrors);
    const firstErrorField = Object.keys(nextErrors)[0] as keyof typeof fields | undefined;
    if (firstErrorField) {
      const focusMap = {
        name: nameRef,
        role: roleRef,
        url: urlRef,
        avatar: avatarRef,
        desc: descRef,
      };
      focusMap[firstErrorField]?.current?.focus();
    }
    return Object.keys(nextErrors).length === 0;
  };

  const submitForm = async () => {
    setSubmitError(null);
    if (!validate()) {
      return;
    }
    if (!accessToken) {
      setSubmitError("Access confirmation is missing. Request access again.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/friends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          color: selectedColor,
          accessToken,
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setSubmitError(data.error ?? "Submission failed.");
        return;
      }
      setIsSuccess(true);
      setFields({ name: "", role: "", url: "", avatar: "", desc: "" });
      setErrors({});
      setTimeout(() => {
        setIsSuccess(false);
        onCreated();
      }, 1500);
    } catch {
      setSubmitError("Submission failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitForm();
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
            className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-friend-title"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />

            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 id="add-friend-title" className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Plus className="w-6 h-6 text-zinc-400" />
                    Initialize Node
                  </h2>
                  <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                    // Request to join the network
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

              {isSuccess ? (
                <div className="h-64 flex flex-col items-center justify-center text-emerald-500 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check size={32} />
                  </div>
                  <p className="font-bold text-lg">Signal Established</p>
                  <p className="text-zinc-500 text-sm" aria-live="polite">
                    Your node has been queued.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                        <User size={12} /> Name
                      </label>
                      <input
                        ref={nameRef}
                        name="name"
                        autoComplete="name"
                        type="text"
                        placeholder="e.g. John Doe\u2026"
                        value={fields.name}
                        onChange={(event) => setFields({ ...fields, name: event.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-white"
                      />
                      {errors.name ? <p className="text-xs text-rose-500">{errors.name}</p> : null}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                        <Terminal size={12} /> Role
                      </label>
                      <input
                        ref={roleRef}
                        name="role"
                        autoComplete="organization-title"
                        type="text"
                        placeholder="e.g. Engineer\u2026"
                        value={fields.role}
                        onChange={(event) => setFields({ ...fields, role: event.target.value })}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-white"
                      />
                      {errors.role ? <p className="text-xs text-rose-500">{errors.role}</p> : null}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                      <LinkIcon size={12} /> Website URL
                    </label>
                    <input
                      ref={urlRef}
                      name="url"
                      autoComplete="url"
                      type="url"
                      inputMode="url"
                      spellCheck={false}
                      placeholder="https://example.com\u2026"
                      value={fields.url}
                      onChange={(event) => setFields({ ...fields, url: event.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-white"
                    />
                    {errors.url ? <p className="text-xs text-rose-500">{errors.url}</p> : null}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                      <User size={12} /> Avatar URL
                    </label>
                    <input
                      ref={avatarRef}
                      name="avatar"
                      autoComplete="url"
                      type="url"
                      inputMode="url"
                      spellCheck={false}
                      placeholder="https://github.com/username.png\u2026"
                      value={fields.avatar}
                      onChange={(event) => setFields({ ...fields, avatar: event.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 dark:text-white"
                    />
                    {errors.avatar ? <p className="text-xs text-rose-500">{errors.avatar}</p> : null}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                      <Terminal size={12} /> Description
                    </label>
                    <textarea
                      ref={descRef}
                      name="desc"
                      autoComplete="off"
                      rows={2}
                      placeholder="Brief description of your protocol\u2026"
                      value={fields.desc}
                      onChange={(event) => setFields({ ...fields, desc: event.target.value })}
                      onKeyDown={(event) => {
                        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                          event.preventDefault();
                          submitForm();
                        }
                      }}
                      className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none dark:text-white"
                    />
                    {errors.desc ? <p className="text-xs text-rose-500">{errors.desc}</p> : null}
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1.5">
                      <Palette size={12} /> Aura Color
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          aria-label={`Select aura color ${color}`}
                          className={cn(
                            "w-6 h-6 rounded-full transition-all duration-300 ring-2 ring-offset-2 dark:ring-offset-zinc-900",
                            selectedColor === color ? "ring-zinc-900 dark:ring-white scale-110" : "ring-transparent hover:scale-110"
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {submitError ? (
                    <p className="text-sm text-rose-500" aria-live="polite">
                      {submitError}
                    </p>
                  ) : null}

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors touch-manipulation"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Establish Link{"\u2026"}
                        </>
                      ) : (
                        "Establish Link"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
