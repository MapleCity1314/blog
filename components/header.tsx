"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles } from "lucide-react";
import Logo from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Posts", href: "/posts" },
  { label: "Friends", href: "/friends" },
  { label: "About", href: "/about" },
  { label: "Try z0", href: "/try-z0", special: true },
];

type SearchResult = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const run = async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) {
          setSearchError("Search failed.");
          setSearchResults([]);
          return;
        }
        const data = (await response.json()) as { results?: SearchResult[] };
        setSearchResults(data.results ?? []);
        setActiveIndex(0);
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          setSearchError("Search failed.");
        }
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(run, 250);
    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => desktopInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const showLogoText = isMobileMenuOpen || (!isScrolled || isHeaderHovered);
  const showDesktopNav = !isScrolled || isHeaderHovered;

  const handleResultSelect = (result: SearchResult) => {
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    router.push(`/posts/${result.slug}`);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, searchResults.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const result = searchResults[activeIndex] ?? searchResults[0];
      if (result) {
        handleResultSelect(result);
      }
    }
  };

  return (
    <>
      <motion.header
        className={cn(
          "fixed left-0 top-0 z-50 w-full transition-all duration-500 ease-in-out",
          "h-[var(--header-height)] md:h-20 flex items-center bg-transparent"
        )}
        onMouseEnter={() => window.innerWidth >= 768 && setIsHeaderHovered(true)}
        onMouseLeave={() => {
          setIsHeaderHovered(false);
          if (!isSearchFocused) {
            setIsSearchOpen(false);
          }
        }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/5 via-foreground/2 to-transparent backdrop-blur-[0.5px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: (isScrolled && isHeaderHovered && !isMobileMenuOpen) ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />

        <div className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 md:px-10">
          {/* Left logo */}
          <Link
            href="/"
            className="relative z-50 block text-foreground"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Logo showText={showLogoText} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center justify-end">
            <AnimatePresence mode="wait">
              {showDesktopNav ? (
                <motion.nav
                  key="nav-full"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-4 lg:gap-6 font-sans"
                >
                  <div className="flex items-center gap-6 lg:gap-8 mr-2">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "text-sm font-medium transition-all relative group flex items-center gap-1.5",
                          !item.special && "text-foreground",
                          item.special && cn(
                            "px-3 py-1.5 rounded-full font-bold tracking-wide transition-all duration-300",
                            "text-transparent bg-clip-text animate-gradient",
                            "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400",
                            "hover:brightness-125 hover:scale-105",
                            "drop-shadow-[0_0_2px_rgba(168,85,247,0.3)]"
                          )
                        )}
                      >
                        {item.special && (
                          <span className="flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 text-purple-600 dark:text-purple-400">
                            <Sparkles size={14} fill="currentColor" />
                          </span>
                        )}

                        <span>{item.label}</span>

                        {!item.special && (
                          <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left rounded-full" />
                        )}

                        {item.special && (
                          <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out rounded-full" />
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Desktop actions */}
                  <div className="flex items-center gap-1 pl-2 border-l border-foreground/10">
                    <ThemeToggle />

                    <div className="relative flex items-center text-foreground transition-colors hover:opacity-70">
                      <AnimatePresence>
                        {isSearchOpen && (
                          <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 220, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="relative mx-2"
                          >
                            <form
                              className="border-b border-foreground/30"
                              onSubmit={(event) => event.preventDefault()}
                            >
                              <input
                                ref={desktopInputRef}
                                type="text"
                                name="search"
                                autoComplete="off"
                                placeholder="Search\u2026"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                onKeyDown={handleInputKeyDown}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="w-full bg-transparent border-none outline-none text-sm placeholder:text-foreground/40 pb-0.5 text-foreground"
                              />
                            </form>
                            {searchQuery.trim().length >= 2 && (
                              <div
                                role="listbox"
                                className="absolute top-8 left-0 w-full rounded-xl border border-foreground/10 bg-background/95 shadow-xl backdrop-blur-xl p-2 text-sm"
                              >
                                {isSearching ? (
                                  <p className="px-2 py-1 text-foreground/60">Searching\u2026</p>
                                ) : null}
                                {searchError ? (
                                  <p className="px-2 py-1 text-rose-500" aria-live="polite">{searchError}</p>
                                ) : null}
                                {!isSearching && !searchError && searchResults.length === 0 ? (
                                  <p className="px-2 py-1 text-foreground/60">No results.</p>
                                ) : null}
                                {!searchError && searchResults.map((result, index) => (
                                  <button
                                    key={result.slug}
                                    type="button"
                                    role="option"
                                    aria-selected={index === activeIndex}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onClick={() => handleResultSelect(result)}
                                    className={cn(
                                      "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                                      index === activeIndex
                                        ? "bg-foreground/10"
                                        : "hover:bg-foreground/10"
                                    )}
                                  >
                                    <span className="flex-1">
                                      <span className="block font-medium text-foreground">{result.title}</span>
                                      <span className="block text-xs text-foreground/60">{result.description}</span>
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className="p-2 touch-manipulation"
                        aria-label={isSearchOpen ? "Close search" : "Open search"}
                      >
                        {isSearchOpen ? <X size={18} /> : <Search size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.nav>
              ) : (
                <motion.div
                  key="nav-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-1.5 items-end justify-center py-2"
                >
                  <div className="w-6 h-[2px] bg-foreground rounded-full shadow-sm opacity-80" />
                  <div className="w-3 h-[2px] bg-foreground rounded-full shadow-sm opacity-80" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden z-50">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex flex-col gap-1.5 items-end justify-center p-2 outline-none touch-manipulation"
              aria-label="Toggle Menu"
            >
              <motion.div
                animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-6 h-[2px] bg-foreground rounded-full origin-center"
              />
              <motion.div
                animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-3 h-[2px] bg-foreground rounded-full"
              />
              <motion.div
                animate={isMobileMenuOpen ? { rotate: -45, y: -8, width: 24 } : { rotate: 0, y: 0, width: 24 }}
                className="w-6 h-[2px] bg-foreground rounded-full origin-center"
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-xl md:hidden flex flex-col pt-32 px-6"
          >
            <nav className="flex flex-col gap-8 text-2xl font-light">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.1 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 w-fit",
                      !item.special && "text-foreground",
                      item.special && cn(
                        "font-bold tracking-wide",
                        "text-transparent bg-clip-text animate-gradient",
                        "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-cyan-400 dark:via-purple-400 dark:to-pink-400"
                      )
                    )}
                  >
                    {item.special && (
                      <Sparkles size={24} className="text-purple-600 dark:text-purple-400" fill="currentColor" />
                    )}
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-col gap-6"
            >
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-foreground/50" size={20} />
                <input
                  ref={mobileInputRef}
                  type="text"
                  name="search"
                  autoComplete="off"
                  placeholder="Search\u2026"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  className="w-full bg-transparent border-b border-foreground/20 py-3 pl-8 text-lg outline-none text-foreground placeholder:text-foreground/30 focus:border-foreground transition-colors"
                />
                {searchQuery.trim().length >= 2 ? (
                  <div className="mt-4 rounded-2xl border border-foreground/10 bg-background/95 shadow-xl backdrop-blur-xl p-2 text-sm">
                    {isSearching ? (
                      <p className="px-2 py-1 text-foreground/60">Searching\u2026</p>
                    ) : null}
                    {searchError ? (
                      <p className="px-2 py-1 text-rose-500" aria-live="polite">{searchError}</p>
                    ) : null}
                    {!isSearching && !searchError && searchResults.length === 0 ? (
                      <p className="px-2 py-1 text-foreground/60">No results.</p>
                    ) : null}
                    {!searchError && searchResults.map((result, index) => (
                      <button
                        key={result.slug}
                        type="button"
                        onClick={() => handleResultSelect(result)}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors",
                          index === activeIndex
                            ? "bg-foreground/10"
                            : "hover:bg-foreground/10"
                        )}
                      >
                        <span className="flex-1">
                          <span className="block font-medium text-foreground">{result.title}</span>
                          <span className="block text-xs text-foreground/60">{result.description}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="pt-2">
                <ThemeToggle />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
