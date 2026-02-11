"use client";

import { useState, useRef, useCallback } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
  "data-language"?: string;
  filename?: string;
  [key: string]: any;
};

export default function CodeBlock({
  children,
  className,
  "data-language": dataLanguage,
  filename,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // 提取语言
  const language =
    dataLanguage ||
    className?.match(/language-(\w+)/)?.[1] ||
    "text";

  const handleCopy = useCallback(async () => {
    if (!preRef.current) return;
    const codeElement = preRef.current.querySelector("code");
    const textToCopy = codeElement?.innerText || preRef.current.innerText || "";
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  }, []);

  return (
    <div className="group relative my-12 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#0d0d0d] text-left shadow-sm">
      {/* 头部：极简设计，与背景融合，仅通过细微边框分隔 */}
      <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-3 py-2 text-xs text-zinc-400 backdrop-blur-sm transition-colors sm:px-4">

        {/* 左侧：文件名或语言 */}
        <div className="flex items-center gap-2 select-none">
          {filename ? (
            <>
              <FileCode2 className="h-3.5 w-3.5 opacity-70" />
              <span className="font-medium text-zinc-300">{filename}</span>
            </>
          ) : (
            <span className="font-mono font-medium uppercase tracking-wider opacity-80">
              {language}
            </span>
          )}
        </div>

        {/* 右侧：复制按钮 (移动端易触控) */}
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded bg-transparent p-1.5 transition-all hover:bg-white/10 hover:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700",
            copied && "text-emerald-400 hover:text-emerald-400"
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          {/* 在大屏幕上显示文字，小屏幕隐藏以节省空间 */}
          <span className="hidden font-mono text-[10px] sm:inline-block">
            {copied ? "COPIED" : "COPY"}
          </span>
        </button>
      </div>

      {/* 代码区域 */}
      <div className="relative">
        <pre
          ref={preRef}
          className={cn(
            // 强制背景为透明，因为外层容器已经有背景颜色了
            "!bg-transparent !p-0 !m-0",
            "overflow-x-auto p-3 text-left text-[13px] leading-6 text-zinc-300 sm:p-4 sm:text-sm",
            // ... 其他类
            className
          )}
          {...props}
        >
          {/* 如果 children 是 code 标签，通常我们需要重置它的样式 */}
          <span className="inline-block min-w-full">
            {children}
          </span>
        </pre>
      </div>
    </div>
  );
}
