"use client";

import { useEffect } from "react";
// 注意：Global Error 替换了 RootLayout，所以必须包含 html 和 body 标签
// 尽量不引用复杂的外部组件，保持原子化

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-black text-gray-300 font-mono h-screen w-full flex items-center justify-center p-8 overflow-hidden">
        
        {/* 模拟 CRT 扫描线 */}
        <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />
        
        <div className="max-w-2xl w-full border border-gray-700 p-8 md:p-12 relative bg-black z-10">
            {/* 角落装饰 */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>

            <div className="space-y-6">
                <div className="border-b border-gray-800 pb-4 mb-8">
                    <h1 className="text-xl md:text-2xl font-bold text-white uppercase tracking-[0.2em] mb-2">
                        KERNEL_PANIC
                    </h1>
                    <p className="text-xs text-red-500">
                        CRITICAL_PROCESS_DIED: {error.digest || "UNKNOWN_HASH"}
                    </p>
                </div>

                <div className="space-y-2 text-xs md:text-sm opacity-80 leading-relaxed">
                    <p>{`> Error: ${error.message}`}</p>
                    <p>{`> Status: System Halted`}</p>
                    <p>{`> Memory Dump: Complete`}</p>
                    <p className="animate-pulse">{`> Awaiting Manual Reset...`}</p>
                </div>

                <div className="pt-8">
                    <button
                        onClick={() => reset()}
                        className="bg-white text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-300 transition-colors"
                    >
                        [ FORCE_RESTART ]
                    </button>
                </div>
            </div>

            {/* ASCII Logo Fallback (简单的纯文本) */}
            <div className="absolute top-8 right-8 opacity-20 hidden md:block">
                <pre className="text-[10px] leading-[0.8]">
{`
  /\\
 (OO)
 |  |
`}
                </pre>
            </div>
        </div>
      </body>
    </html>
  );
}