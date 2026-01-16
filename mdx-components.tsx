import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Mermaid from "@/components/mdx/mermaid";
import CodeBlock from "@/components/mdx/code-block";

// 自定义组件示例：漂亮的提示框
function Callout({ children, type = "default" }: { children: React.ReactNode; type?: "default" | "warning" | "error" }) {
  return (
    <div className={cn("my-6 flex items-start rounded-md border border-l-4 p-4", {
      "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20": type === "default",
      "border-l-amber-500 bg-amber-50 dark:bg-amber-900/20": type === "warning",
      "border-l-red-500 bg-red-50 dark:bg-red-900/20": type === "error",
    })}>
      <div>{children}</div>
    </div>
  );
}

// This file is picked up automatically by Next.js when MDX is enabled.
// It lets you map markdown elements to React components.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 1. 字体应用：使用 font-sans (Quicksand)
    h1: ({ className, ...props }) => (
      <h1 className={cn("mt-2 scroll-m-20 text-4xl font-bold tracking-tight font-sans", className)} {...props} />
    ),
    h2: ({ className, ...props }) => (
      <h2 className={cn("mt-10 scroll-m-20 border-b pb-1 text-3xl font-semibold tracking-tight font-sans first:mt-0", className)} {...props} />
    ),
    h3: ({ className, ...props }) => (
      <h3 className={cn("mt-8 scroll-m-20 text-2xl font-semibold tracking-tight font-sans", className)} {...props} />
    ),
    p: ({ className, ...props }) => (
      <p className={cn("leading-7 [&:not(:first-child)]:mt-6 font-sans text-muted-foreground", className)} {...props} />
    ),
    // 2. 链接优化
    a: ({ className, href, ...props }) => {
      const isInternal = href?.startsWith("/");
      if (isInternal) {
        return <Link href={href as string} className={cn("font-medium underline underline-offset-4 decoration-primary/50 hover:decoration-primary", className)} {...props} />;
      }
      return <a target="_blank" rel="noopener noreferrer" href={href} className={cn("font-medium underline underline-offset-4 decoration-primary/50 hover:decoration-primary", className)} {...props} />;
    },
    // 3. 代码块字体：使用 font-mono (Geist Mono)
    // 行内代码
    code: ({ className, ...props }) => {
      // 如果是代码块（有 language- 类），不渲染，让 pre 处理
      if (className?.includes("language-")) {
        return <code className={className} {...props} />;
      }
      // 行内代码
      return (
        <code className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)} {...props} />
      );
    },
    // 代码块容器
    pre: ({ children, className, ...props }: any) => {
      // 检查是否是代码块（rehype-pretty-code 会添加特定类或 data-language 属性）
      const isCodeBlock = className?.includes("language-") || 
                         className?.includes("pretty-code") ||
                         props["data-language"] ||
                         (children as any)?.props?.className?.includes("language-");
      
      if (isCodeBlock) {
        // 提取语言（优先使用 data-language 属性）
        const language = props["data-language"] ||
                        className?.match(/language-(\w+)/)?.[1] || 
                        (children as any)?.props?.className?.match(/language-(\w+)/)?.[1] ||
                        (children as any)?.props?.["data-language"] ||
                        "text";
        
        return (
          <CodeBlock 
            className={className}
            data-language={language}
            {...props}
          >
            {children}
          </CodeBlock>
        );
      }
      
      // 普通 pre 标签
      return (
        <pre className={cn("my-6 overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm", className)} {...props}>
          {children}
        </pre>
      );
    },
    // 4. 引用块
    blockquote: ({ className, ...props }) => (
      <blockquote className={cn("mt-6 border-l-2 border-primary pl-6 italic font-serif", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)} {...props} />
    ),
    // 注册自定义组件
    Callout,
    Mermaid,
    ...components,
  };
}
