"use client";

import MonacoEditor, { type OnMount, type BeforeMount } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type PostMonacoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onMount?: OnMount;
  className?: string;
};

export default function PostMonacoEditor({
  value,
  onChange,
  onMount,
  className,
}: PostMonacoEditorProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 定义 Registry 系列主题
  const handleBeforeMount: BeforeMount = (monaco) => {
    // 1. Registry Dark 主题 (核心风格)
    monaco.editor.defineTheme("registry-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "header", foreground: "3b82f6", fontStyle: "bold" }, // Primary Blue
        { token: "keyword", foreground: "3b82f6" },
        { token: "quote", foreground: "64748b", fontStyle: "italic" },
        { token: "string", foreground: "10b981" }, // Emerald for strings/links
        { token: "comment", foreground: "475569" },
        { token: "type", foreground: "94a3b8" },
      ],
      colors: {
        "editor.background": "#09090b", // 匹配你的背景色
        "editor.foreground": "#fafafa",
        "editor.lineHighlightBackground": "#ffffff05",
        "editorCursor.foreground": "#3b82f6",
        "editorLineNumber.foreground": "#27272a",
        "editorLineNumber.activeForeground": "#3b82f6",
        "editorIndentGuide.background": "#18181b",
        "editor.selectionBackground": "#3b82f633",
        "editorInactiveSelectionBackground": "#3b82f611",
      },
    });

    // 2. Registry Light 主题
    monaco.editor.defineTheme("registry-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "header", foreground: "2563eb", fontStyle: "bold" },
        { token: "string", foreground: "059669" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.lineHighlightBackground": "#00000005",
        "editorCursor.foreground": "#2563eb",
        "editorLineNumber.foreground": "#e4e4e7",
        "editorLineNumber.activeForeground": "#2563eb",
      },
    });
  };

  if (!mounted) return null;

  return (
    <div className={`h-full relative border border-border/60 bg-background group ${className ?? ""}`}>
      {/* 装饰边角 - 维持 Registry 统一视觉 */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/40 z-10" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/40 z-10" />
      
      <MonacoEditor
        height="100%"
        defaultLanguage="markdown"
        value={value}
        beforeMount={handleBeforeMount}
        onMount={onMount}
        onChange={(next) => onChange(next ?? "")}
        theme={theme === "dark" ? "registry-dark" : "registry-light"}
        options={{
          fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          fontSize: 13,
          lineNumbers: "on",
          lineNumbersMinChars: 4,
          glyphMargin: false,
          folding: false,
          lineDecorationsWidth: 10,
          wordWrap: "on",
          minimap: { enabled: false },
          scrollbar: {
            vertical: "auto",
            horizontal: "hidden",
            verticalScrollbarSize: 8,
          },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          padding: { top: 20, bottom: 20 },
          renderLineHighlight: "all",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          letterSpacing: 0.5,
          // 隐藏左侧多余区域
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
        }}
      />
    </div>
  );
}
