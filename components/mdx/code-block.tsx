"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type CodeBlockProps = {
  children?: React.ReactNode;
  className?: string;
  "data-language"?: string;
  "data-theme"?: string;
  [key: string]: any;
};

export default function CodeBlock({ 
  children, 
  className,
  "data-language": dataLanguage,
  ...props 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<string>("text");
  const codeRef = useRef<HTMLPreElement>(null);

  // 从 data-language 属性或 className 中提取语言
  useEffect(() => {
    if (dataLanguage) {
      setLanguage(dataLanguage);
    } else if (codeRef.current) {
      const lang = codeRef.current.getAttribute("data-language") ||
                   codeRef.current.querySelector("code")?.getAttribute("data-language") ||
                   className?.match(/language-(\w+)/)?.[1] ||
                   "text";
      setLanguage(lang);
    } else if (className) {
      const lang = className.match(/language-(\w+)/)?.[1] || "text";
      setLanguage(lang);
    }
  }, [dataLanguage, className]);

  // 获取代码文本内容（从 code 元素中提取）
  const getCodeText = () => {
    if (codeRef.current) {
      const codeElement = codeRef.current.querySelector("code");
      if (codeElement) {
        // 移除所有高亮相关的 span 标签，只保留文本
        const clone = codeElement.cloneNode(true) as HTMLElement;
        const spans = clone.querySelectorAll("span[data-line]");
        spans.forEach(span => {
          const text = span.textContent || "";
          span.replaceWith(text);
        });
        return clone.textContent || codeElement.textContent || "";
      }
      return codeRef.current.textContent || "";
    }
    return "";
  };

  const handleCopy = async () => {
    const text = getCodeText();
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="group relative my-6 overflow-hidden rounded-lg bg-muted/30 dark:bg-muted/50 shadow-sm">
      {/* 代码块头部：语言标识和复制按钮 */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 dark:bg-muted/70 border-b border-border/30">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/70 uppercase tracking-wider">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted/30"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* 代码内容 */}
      <pre
        ref={codeRef}
        className={cn(
          "relative overflow-x-auto m-0",
          "font-mono text-sm leading-relaxed",
          className
        )}
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
