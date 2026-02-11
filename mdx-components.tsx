import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import Image from "next/image"; // 引入 Image 组件优化图片
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, XCircle, FileText } from "lucide-react"; // 引入图标
import Mermaid from "@/components/mdx/mermaid";
import CodeBlock from "@/components/mdx/code-block";

// --- 组件设计：Callout (提示框) ---
// 更加现代、扁平化的设计，适配移动端
function Callout({ 
  children, 
  type = "default", 
  title 
}: { 
  children: React.ReactNode; 
  type?: "default" | "warning" | "error"; 
  title?: string 
}) {
  const icons = {
    default: Info,
    warning: AlertTriangle,
    error: XCircle,
  };
  const Icon = icons[type] || Info;

  return (
    <div className={cn(
      "my-10 flex flex-col rounded-lg border px-4 py-3 text-sm shadow-sm sm:my-12 sm:flex-row sm:gap-3", 
      // 根据类型设置极简的颜色风格 (背景色极淡，边框微弱)
      type === "default" && "border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-200",
      type === "warning" && "border-amber-200 bg-amber-50/50 text-amber-900 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-200",
      type === "error" && "border-red-200 bg-red-50/50 text-red-900 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-200"
    )}>
      <div className="mb-2 flex items-center gap-2 sm:mb-0 sm:pt-0.5">
        <Icon className="h-4 w-4 shrink-0 opacity-80" />
        {title && <span className="font-semibold sm:hidden">{title}</span>}
      </div>
      <div className="w-full min-w-0 leading-relaxed opacity-90">
        {title && <div className="mb-1 hidden font-semibold sm:block">{title}</div>}
        {children}
      </div>
    </div>
  );
}

// --- 主文件 ---
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // 1. 标题优化：移动端防溢出 (break-words)，增加锚点偏移
    h1: ({ className, ...props }) => (
      <h1 className={cn("mt-10 mb-6 scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl font-sans break-words", className)} {...props} />
    ),
    h2: ({ className, ...props }) => (
      <h2 className={cn("mt-10 mb-4 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight font-sans first:mt-0 break-words", className)} {...props} />
    ),
    h3: ({ className, ...props }) => (
      <h3 className={cn("mt-8 mb-3 scroll-m-20 text-xl font-semibold tracking-tight font-sans break-words", className)} {...props} />
    ),
    h4: ({ className, ...props }) => (
      <h4 className={cn("mt-6 mb-2 scroll-m-20 text-lg font-semibold tracking-tight font-sans break-words", className)} {...props} />
    ),

    // 2. 正文与排版：增加阅读舒适度
    p: ({ className, ...props }) => (
      <p className={cn("leading-8 [&:not(:first-child)]:mt-8 font-sans text-zinc-700 dark:text-zinc-300", className)} {...props} />
    ),
    ul: ({ className, ...props }) => (
      <ul className={cn("my-6 ml-6 list-disc [&>li]:mt-2 font-sans text-zinc-700 dark:text-zinc-300", className)} {...props} />
    ),
    ol: ({ className, ...props }) => (
      <ol className={cn("my-6 ml-6 list-decimal [&>li]:mt-2 font-sans text-zinc-700 dark:text-zinc-300", className)} {...props} />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote className={cn("my-10 border-l-2 border-zinc-300 pl-6 italic text-zinc-600 dark:border-zinc-700 dark:text-zinc-400 font-serif", className)} {...props} />
    ),
    hr: ({ ...props }) => <hr className="my-12 border-zinc-200 dark:border-zinc-800" {...props} />,

    // 3. 链接优化：区分内链外链，增加移动端点击热区
    a: ({ className, href, ...props }) => {
      const isInternal = href?.startsWith("/");
      const baseClass = "font-medium underline underline-offset-4 decoration-zinc-400/50 hover:decoration-zinc-500 transition-colors break-words";
      
      if (isInternal) {
        return <Link href={href as string} className={cn(baseClass, className)} {...props} />;
      }
      return <a target="_blank" rel="noopener noreferrer" href={href} className={cn(baseClass, className)} {...props} />;
    },

    // 4. 图片优化：圆角、响应式
    img: ({ className, alt, ...props }: any) => (
      // 注意：如果使用 next/image，这里需要根据情况调整。这里保留原生 img 以防 MDX 解析问题，
      // 但加上了 rounded 和 shadow 提升观感
      // eslint-disable-next-line @next/next/no-img-element
      <img 
        className={cn(
          "my-20 h-auto w-full max-w-none rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm",
          "md:w-[112%] md:max-w-[112%] md:-ml-[6%]",
          "lg:w-[124%] lg:max-w-[124%] lg:-ml-[12%]",
          className
        )}
        alt={alt} 
        {...props} 
      />
    ),

    // 5. 代码块处理 (核心修复)
    code: ({ className, ...props }) => {
      // 如果是 CodeBlock 的一部分，不做处理，交由 pre 处理
      if (className?.includes("language-")) {
        return <code className={cn("font-mono", className)} {...props} />;
      }
      // 纯行内代码 (Inline Code) 的美化
      return (
        <code className={cn(
          "relative rounded-md bg-zinc-100 px-[0.4rem] py-[0.2rem] font-mono text-[0.9em] font-medium text-zinc-800",
          "dark:bg-zinc-800 dark:text-zinc-200",
          "border border-zinc-200 dark:border-zinc-700/50", // 微弱边框增加精致感
          className
        )} {...props} />
      );
    },

    pre: ({ children, className, ...props }: any) => {
      // 检查是否是代码块
      const isCodeBlock = className?.includes("language-") || 
                         className?.includes("pretty-code") ||
                         props["data-language"] ||
                         (children as any)?.props?.className?.includes("language-");
      
      if (isCodeBlock) {
        // 尝试提取语言
        const language = props["data-language"] ||
                        className?.match(/language-(\w+)/)?.[1] || 
                        (children as any)?.props?.className?.match(/language-(\w+)/)?.[1] ||
                        "text";
        
        return (
          <CodeBlock 
            // 传递原始 props，但覆盖 className 以避免双重背景
            // 这里的 !bg-transparent 是关键，它强制移除 MDX 插件可能加上的背景
            className={cn("!my-0 !bg-transparent !p-0 !border-0 !shadow-none", className)}
            data-language={language}
            // 将剩余属性传给 CodeBlock
            {...props}
          >
             {/* 
               同样重要的是，我们需要确保 children (通常是 <code>) 也没有背景 
               如果 children 是 React Element，我们可以克隆它并移除样式 
             */}
             {children}
          </CodeBlock>
        );
      }
      
      // 非代码块的普通 pre（极少情况）
      return (
        <pre className={cn("my-10 overflow-x-auto rounded-lg bg-zinc-100 p-4 font-mono text-sm dark:bg-zinc-900", className)} {...props}>
          {children}
        </pre>
      );
    },

    iframe: ({ className, title, ...props }) => (
      <iframe
        title={title ?? "Embedded content"}
        className={cn("block my-16 w-full min-h-[420px] rounded-lg border border-zinc-200 dark:border-zinc-800", className)}
        {...props}
      />
    ),
    figure: ({ className, ...props }: any) => {
      const isCodeFigure = Boolean(props?.["data-rehype-pretty-code-figure"]);
      return (
        <figure
          className={cn(
            isCodeFigure ? "my-16 !text-left" : "mx-auto my-16 text-center",
            className
          )}
          {...props}
        />
      );
    },
    figcaption: ({ className, ...props }) => (
      <figcaption
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
      />
    ),

    // 注册自定义组件
    Callout,
    Mermaid,
    ...components,
  };
}
