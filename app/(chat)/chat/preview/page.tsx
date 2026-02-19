"use client";

import { useTheme } from "next-themes";
import FluidBackground from "./components/fluid-background";
import PreviewHero from "./components/preview-hero";
import PreviewInviteEntry from "./components/preview-invite-entry";

export default function U0ComingSoonPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";

  return (
    <main className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-white dark:bg-black">
      <FluidBackground isDark={isDark} />
      <PreviewHero />
      <PreviewInviteEntry />

      <h2 className="sr-only">
        {"u0 Agent - \u7ed3\u5408 Web3, Web2, A2UI, Digital Economy \u7684\u65b0\u578b\u667a\u80fd\u4f53"}
      </h2>
    </main>
  );
}
