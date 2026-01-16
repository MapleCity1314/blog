"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Loader2,
  Link as LinkIcon,
  Mail,
  Palette,
  Plus,
  Terminal,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type Friend = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  url: string;
  desc: string;
  color: string;
  createdAt: string;
};

type AccessStatus = {
  state: "idle" | "checking" | "approved" | "rejected";
  message?: string;
};

const PRESET_COLORS = ["#3b82f6", "#a855f7", "#f97316", "#10b981", "#ec4899", "#ef4444", "#eab308", "#6366f1"];

export default function NeuralBladesFriends() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [canAdd, setCanAdd] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>({ state: "idle" });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setIsAccessModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadFriends = async () => {
      setIsLoadingFriends(true);
      try {
        const response = await fetch("/api/friends", { cache: "no-store" });
        const data = (await response.json()) as { friends?: Friend[] };
        if (!isMounted) return;
        const list = data.friends ?? [];
        setFriends(list);
        setActiveId(list[0]?.id ?? null);
      } catch {
        if (isMounted) {
          setFriends([]);
          setActiveId(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFriends(false);
        }
      }
    };
    loadFriends();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const token = searchParams.get("friendAccess");
    if (!token) {
      return;
    }
    let isMounted = true;
    const verifyToken = async () => {
      setAccessStatus({ state: "checking" });
      try {
        const response = await fetch(`/api/friends/access?token=${encodeURIComponent(token)}`);
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          if (isMounted) {
            setAccessStatus({ state: "rejected", message: data.error ?? "Access denied." });
          }
          return;
        }
        if (isMounted) {
          setAccessToken(token);
          setCanAdd(true);
          setAccessStatus({ state: "approved", message: "Access confirmed." });
          router.replace("/friends", { scroll: false });
        }
      } catch {
        if (isMounted) {
          setAccessStatus({ state: "rejected", message: "Access check failed." });
        }
      }
    };
    verifyToken();
    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  const activeFriend = useMemo(() => friends.find((friend) => friend.id === activeId), [friends, activeId]);

  return (
    <div className="relative w-full min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-500 overflow-hidden flex flex-col items-center justify-center p-4 md:p-10">

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] contrast-150" />
        <AnimatePresence mode="wait">
          {activeId && (
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
                style={{ backgroundColor: activeFriend?.color || "#333" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* HEADER */}
      <div className="absolute top-10 left-10 z-20 hidden md:block">
        <h1 className="text-4xl font-logo text-zinc-900 dark:text-white leading-none">
          Protocol <br /> Link.
        </h1>
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          SYSTEM_READY
        </div>
      </div>

      {/* MAIN INTERACTION */}
      <main className="relative z-10 w-full max-w-7xl h-[600px] md:h-[500px] flex flex-col md:flex-row gap-2 md:gap-4">
        {friends.map((friend) => {
          const isActive = activeId === friend.id;
          return (
            <motion.div
              key={friend.id}
              layout
              onClick={() => setActiveId(friend.id)}
              onMouseEnter={() => setActiveId(friend.id)}
              className={cn(
                "relative h-full rounded-3xl overflow-hidden cursor-pointer border transition-colors duration-500 ease-out group",
                isActive
                  ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl"
                  : "border-transparent bg-zinc-200/50 dark:bg-zinc-900/40 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
              animate={{
                flex: isActive ? 4 : 1,
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            >
              {/* Collapsed State */}
              {!isActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 py-8 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="md:[writing-mode:vertical-rl] md:rotate-180 text-sm font-mono font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                    {friend.role}
                  </span>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden grayscale opacity-50">
                    <Image src={friend.avatar} alt={friend.name} width={40} height={40} className="object-cover" />
                  </div>
                  <span className="hidden md:block md:[writing-mode:vertical-rl] md:rotate-180 text-xs text-zinc-300 dark:text-zinc-700">
                    {friend.id}
                  </span>
                </div>
              )}

              {/* Expanded State */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="absolute inset-0 p-8 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <div className="px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 backdrop-blur-md text-xs font-mono text-zinc-500">
                        NODE_{friend.id}
                      </div>
                      <Link href={friend.url} target="_blank" aria-label={`Open ${friend.name} in a new tab`}>
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 group/btn">
                          <ArrowUpRight size={20} className="transition-transform group-hover/btn:rotate-45" />
                        </div>
                      </Link>
                    </div>

                    <div className="relative z-10">
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-logo text-zinc-900 dark:text-white leading-[0.9]"
                        style={{ color: "var(--foreground)" }}
                      >
                        {friend.name}
                      </motion.h2>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-4 max-w-md text-sm md:text-base text-zinc-500 dark:text-zinc-400 font-mono"
                      >
                        //{friend.desc}
                      </motion.p>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Role</span>
                          <span className="text-sm font-bold dark:text-white">{friend.role}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-zinc-200 dark:bg-zinc-800 mx-2" />
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Status</span>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-bold dark:text-white">Active</span>
                          </div>
                        </div>
                      </div>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0, x: 50 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, type: "spring" }}
                        className="relative w-24 h-24 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white dark:border-zinc-800 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
                      >
                        <Image src={friend.avatar} alt={friend.name} fill className="object-cover" />
                        <div className="absolute inset-0 mix-blend-overlay opacity-30" style={{ backgroundColor: friend.color }} />
                      </motion.div>
                    </div>

                    <div className="absolute -bottom-10 -right-10 text-[10rem] md:text-[14rem] font-bold text-black/5 dark:text-white/5 pointer-events-none select-none z-0 leading-none overflow-hidden">
                      {friend.id}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* 2. Add Button (Triggers Modal) */}
        <motion.button
          onClick={() => (canAdd ? setIsModalOpen(true) : setIsAccessModalOpen(true))}
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
      </main>

      {/* FOOTER */}
      <div className="absolute bottom-10 right-10 flex items-center gap-6 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal size={14} />
          <span>v2.0.4 // STABLE</span>
        </div>
        <Link href="/links" className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1">
          VIEW_ALL <span className="opacity-50">-{">"}</span>
        </Link>
      </div>

      {isLoadingFriends ? null : friends.length === 0 ? (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-xs font-mono text-zinc-400">
          No nodes yet. Request access to add the first link.
        </div>
      ) : null}

      {/* 
        === NEW: ADD FRIEND MODAL === 
        Background blur logic is handled by backdrop-blur-md on this overlay
      */}
      <AddFriendModal
        accessToken={accessToken}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          setCanAdd(false);
          setAccessToken(null);
          setAccessStatus({ state: "idle" });
          fetch("/api/friends", { cache: "no-store" })
            .then((response) => response.json())
            .then((data: { friends?: Friend[] }) => {
              const list = data.friends ?? [];
              setFriends(list);
              setActiveId(list[0]?.id ?? null);
            })
            .catch(() => {
              setFriends([]);
              setActiveId(null);
            });
        }}
      />
      <AccessRequestModal
        accessStatus={accessStatus}
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </div>
  );
}

// --- Sub-Component: Add Friend Modal ---
function AddFriendModal({
  accessToken,
  isOpen,
  onClose,
  onCreated,
}: {
  accessToken: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
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
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-md"
          />

          {/* Dialog */}
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
            {/* Accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-200 dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />

            {/* Body */}
            <div className="p-6 md:p-8">
              {/* Header */}
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

              {/* Success State */}
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
                /* Form */
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
      )}
    </AnimatePresence>
  );
}

// --- Sub-Component: Access Request Modal ---
function AccessRequestModal({
  accessStatus,
  isOpen,
  onClose,
}: {
  accessStatus: AccessStatus;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isSending, setIsSending] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [devConfirmUrl, setDevConfirmUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSentEmail(null);
      setRequestError(null);
      setDevConfirmUrl(null);
    }
  }, [isOpen]);

  const requestAccess = async () => {
    setIsSending(true);
    setRequestError(null);
    setDevConfirmUrl(null);
    try {
      const response = await fetch("/api/friends/access", { method: "POST" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setRequestError(data.error ?? "Request failed.");
        return;
      }
      const data = (await response.json()) as { email?: string; devConfirmUrl?: string };
      setSentEmail(data.email ?? "2702540295@qq.com");
      setDevConfirmUrl(data.devConfirmUrl ?? null);
    } catch {
      setRequestError("Request failed.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                    <Mail className="w-6 h-6 text-zinc-400" />
                    Access Confirmation
                  </h2>
                  <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">
                    // Email approval required
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
                <p>To open the add link dialog, a confirmation email must be approved by 2702540295@qq.com.</p>
                <p>We will send a secure link. Once it is approved, this page unlocks the form.</p>
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

              {sentEmail ? (
                <p className="text-sm text-emerald-600" aria-live="polite">
                  Confirmation sent to {sentEmail}.
                </p>
              ) : null}
              {requestError ? (
                <p className="text-sm text-rose-500" aria-live="polite">
                  {requestError}
                </p>
              ) : null}
              {devConfirmUrl ? (
                <div className="text-xs text-zinc-500">
                  <p>Dev confirm URL:</p>
                  <a className="break-all underline" href={devConfirmUrl}>
                    {devConfirmUrl}
                  </a>
                </div>
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
                      Send Confirmation{"\u2026"}
                    </>
                  ) : (
                    "Send Confirmation"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

