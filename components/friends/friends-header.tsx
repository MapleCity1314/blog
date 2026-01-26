"use client";

export function FriendsHeader() {
  return (
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
  );
}
