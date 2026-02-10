"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Library,
  Users,
  Settings,
  ExternalLink,
  Menu,
  X,
  Cpu,
  Globe,
  Terminal,
} from "lucide-react";
import PageTransition from "@/components/page-transition";
import { cn } from "@/lib/utils";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Posts", href: "/admin/posts", icon: FileText },
  { name: "Resources", href: "/admin/resources", icon: Library },
  { name: "Friends", href: "/admin/friends", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];
const NAV_ITEM_HEIGHT = 40;
const NAV_ITEM_GAP = 32;

function getSegmentLabel(pathname: string) {
  const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";
  return segment.toUpperCase();
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const segmentLabel = useMemo(() => getSegmentLabel(pathname), [pathname]);

  const activeIndex = useMemo(() => {
    const index = NAV_ITEMS.findIndex((item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`)
    );
    return index === -1 ? 0 : index;
  }, [pathname]);

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden font-sans">
      {/* Tactical Side Ribbon */}
      <aside className="hidden md:flex w-20 flex-col items-center border-r border-border/60 bg-background/50 backdrop-blur-xl z-50">
        <div className="h-20 flex items-center justify-center border-b border-border/60 w-full group">
          <Link
            href="/"
            className="relative h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground italic font-black"
          >
            0x
            <div className="absolute inset-0 border border-primary animate-ping opacity-20" />
          </Link>
        </div>

        <nav className="flex-1 w-full py-8">
          <div className="relative flex flex-col items-center gap-8">
            <div
              className="absolute left-0 top-0 w-1 h-6 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-transform duration-300 ease-out"
              style={{
                transform: `translateY(${activeIndex * (NAV_ITEM_HEIGHT + NAV_ITEM_GAP) + 8}px)`,
              }}
            />
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative flex justify-center group h-10 w-full"
                >
                  <item.icon
                    size={22}
                    className={cn(
                      "transition-colors duration-300",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                  />
                  <span className="absolute left-full ml-4 px-2 py-1 bg-foreground text-background text-[10px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="pb-8 flex flex-col items-center gap-6">
          <AnimatedThemeToggler />
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label="Exit to main site"
          >
            <ExternalLink size={20} />
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
        <header className="h-16 border-b border-border/60 bg-background/30 backdrop-blur-md flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="md:hidden p-2 -ml-2 text-muted-foreground touch-manipulation"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Terminal size={14} className="text-primary" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                Registry_OS /{" "}
                <span className="text-foreground">{segmentLabel}</span>
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-6 font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Node: Hangzhou_Ali_Cloud
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={12} />
              Load: 14%
            </div>
            <div className="flex items-center gap-2">
              <Globe size={12} />
              Traffic: Global_Active
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-y-auto p-6 md:p-10 relative">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md md:hidden">
          <div className="flex justify-between p-6 items-center border-b border-border/60">
            <span className="font-mono text-sm font-bold tracking-widest uppercase">
              Navigation
            </span>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close navigation"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-4 text-2xl font-bold uppercase italic tracking-tighter"
              >
                <item.icon className="text-primary" />
                {item.name}
              </Link>
            ))}
            <div className="pt-8 border-t border-border/60 flex gap-4">
              <AnimatedThemeToggler />
              <Link
                href="/"
                className="flex items-center gap-2 text-sm font-mono text-muted-foreground"
              >
                <ExternalLink size={16} />
                EXIT_TO_MAIN
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
