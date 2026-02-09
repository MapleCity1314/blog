"use client";

import { useCallback, useMemo, useState } from "react";
import { Copy, MessageCircle } from "lucide-react";

import {
  OpenIn,
  OpenInDeepSeek,
  OpenInGemini,
  OpenInKimi,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInLabel,
  OpenInSeparator,
  OpenInTrigger,
} from "@/components/ai-elements/open-in-chat";

type PostHeaderActionsProps = {
  title: string;
  date: string;
  description: string;
  tags: string[];
  cover?: string;
  content: string;
  url: string;
};

const COPY_LABEL_DEFAULT = "Copy as Markdown";
const COPY_LABEL_DONE = "Copied";

function buildMarkdown({
  title,
  date,
  description,
  tags,
  cover,
  content,
}: PostHeaderActionsProps) {
  const frontmatter = [
    "---",
    `title: "${title.replace(/"/g, '\\"')}"`,
    `date: "${date}"`,
    description ? `description: "${description.replace(/"/g, '\\"')}"` : null,
    tags.length ? `tags: [${tags.map((tag) => `"${tag.replace(/"/g, '\\"')}"`).join(", ")}]` : null,
    cover ? `cover: "${cover}"` : null,
    "---",
    "",
  ].filter(Boolean);

  return `${frontmatter.join("\n")}${content.trim()}\n`;
}

async function copyText(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function PostHeaderActions(props: PostHeaderActionsProps) {
  const [copied, setCopied] = useState(false);
  const markdown = useMemo(() => buildMarkdown(props), [props]);
  const prompt = useMemo(() => props.url, [props.url]);

  const handleCopy = useCallback(async () => {
    await copyText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [markdown]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 border border-border/60 bg-background/60 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary touch-manipulation"
        aria-live="polite"
      >
        <Copy size={12} />
        <span>{copied ? COPY_LABEL_DONE : COPY_LABEL_DEFAULT}</span>
      </button>

      <OpenIn query={prompt}>
        <OpenInTrigger>
          <button
            type="button"
            className="inline-flex items-center gap-2 border border-border/60 bg-background/60 px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary touch-manipulation"
          >
            <MessageCircle size={12} />
            Open in Chat
          </button>
        </OpenInTrigger>
        <OpenInContent>
          <OpenInLabel className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
            Choose Provider
          </OpenInLabel>
          <OpenInSeparator />
          <OpenInDeepSeek />
          <OpenInKimi />
          <OpenInChatGPT />
          <OpenInGemini />
          <OpenInClaude />
        </OpenInContent>
      </OpenIn>
    </div>
  );
}
