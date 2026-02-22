"use client";

import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import {
  CheckIcon,
  ChevronsDownUpIcon,
  ChevronsUpDownIcon,
  CopyIcon,
  GlobeIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
  type ToolPart,
} from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatThreadClientProps = {
  chatId: string;
  initialMessages: UIMessage[];
  isSharedReadonly: boolean;
};

const CHAT_MODELS = [
  {
    alias: "u0-mini",
    label: "u0-mini",
    description: "Fast default model",
    provider: "openai" as const,
  },
  {
    alias: "u0-pro",
    label: "u0-pro",
    description: "Balanced quality and speed",
    provider: "moonshotai" as const,
  },
  {
    alias: "u0-max",
    label: "u0-max",
    description: "Highest reasoning quality",
    provider: "openai" as const,
  },
] as const;

type ChatModelAlias = (typeof CHAT_MODELS)[number]["alias"];
type MessagePart = UIMessage["parts"] extends Array<infer P> ? P : never;

function getMessageText(message: UIMessage) {
  const parts = Array.isArray(message.parts) ? message.parts : [];
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function sanitizeAssistantMarkdown(content: string) {
  // Streamdown image blocks currently render a <div> wrapper, which can end up
  // inside a <p> and cause hydration errors. Convert image markdown to links.
  return content.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, "[$1]($2)");
}

function isTextPart(part: MessagePart): part is Extract<MessagePart, { type: "text"; text: string }> {
  return part?.type === "text";
}

function isToolPart(part: MessagePart): part is ToolPart {
  return Boolean(
    part &&
      typeof part === "object" &&
      "type" in part &&
      typeof part.type === "string" &&
      (part.type === "dynamic-tool" || part.type.startsWith("tool-"))
  );
}

function getToolName(part: ToolPart) {
  if (part.type === "dynamic-tool") {
    return part.toolName || "tool";
  }
  return part.type.replace(/^tool-/, "");
}

function getToolActionName(part: ToolPart) {
  const input = part.input as Record<string, unknown> | undefined;
  const query = typeof input?.query === "string" ? input.query.trim() : "";
  if (query) {
    return query;
  }
  return getToolName(part);
}

function getToolTrackingLabel(part: ToolPart) {
  const action = getToolActionName(part);
  switch (part.state) {
    case "input-streaming":
    case "input-available":
      return `${action}中`;
    case "output-available":
      return `${action}完成`;
    case "approval-requested":
      return `等待批准：${action}`;
    case "approval-responded":
      return `已批准：${action}`;
    case "output-denied":
      return `已拒绝：${action}`;
    case "output-error":
      return `${action}失败`;
    default:
      return action;
  }
}

export default function ChatThreadClient({
  chatId,
  initialMessages,
  isSharedReadonly,
}: ChatThreadClientProps) {
  const [model, setModel] = useState<ChatModelAlias>("u0-mini");
  const [text, setText] = useState("");
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [expandedToolMessages, setExpandedToolMessages] = useState<Record<string, boolean>>({});
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
      }),
    []
  );

  const { messages, sendMessage, status, stop, error } = useChat({
    id: chatId,
    messages: initialMessages,
    transport,
  });

  const isSending = status === "submitted" || status === "streaming";
  const canSend = !isSharedReadonly && !isSending && text.trim().length > 0;
  const selectedModel = CHAT_MODELS.find((item) => item.alias === model) ?? CHAT_MODELS[0];

  async function submitMessage(inputText: string) {
    const trimmed = inputText.trim();
    if (!trimmed || isSharedReadonly || isSending) {
      return;
    }

    setText("");
    await sendMessage(
      {
        text: trimmed,
      },
      {
        body: {
          chatId,
          model,
          webSearchEnabled,
        },
      }
    );
  }

  async function copyMessageText(message: UIMessage) {
    const textContent = getMessageText(message);
    if (!textContent) {
      return;
    }
    try {
      await navigator.clipboard.writeText(textContent);
    } catch {
      // Keep silent if clipboard is unavailable.
    }
  }

  async function shareConversation() {
    setShareError(null);
    setShareUrl(null);
    try {
      const response = await fetch("/api/chat/share", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ chatId }),
      });
      const payload = (await response.json()) as { shareUrl?: string; error?: string };
      if (!response.ok || !payload.shareUrl) {
        setShareError(payload.error ?? "Failed to create share link.");
        return;
      }
      setShareUrl(payload.shareUrl);
      await navigator.clipboard.writeText(payload.shareUrl);
    } catch {
      setShareError("Failed to create share link.");
    }
  }

  function toggleToolTrace(messageId: string) {
    setExpandedToolMessages((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  }

  return (
    <section className="relative flex h-full min-h-0 flex-col bg-background">
      <header className="sticky top-0 z-20 bg-background/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight">Assistant</h1>
            <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{chatId}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-mono text-muted-foreground">
              {selectedModel.label}
            </span>
            {!isSharedReadonly ? (
              <Button
                type="button"
                onClick={shareConversation}
                variant="ghost"
                size="sm"
                className="h-9"
              >
                Share
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div
          className={cn(
            "h-full overflow-y-auto",
            "[scrollbar-width:thin] [scrollbar-color:hsl(var(--border))_transparent]",
            "[&::-webkit-scrollbar]:w-2",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-thumb]:rounded-full",
            "[&::-webkit-scrollbar-thumb]:bg-border"
          )}
        >
          <div className="mx-auto w-full max-w-4xl px-4 pb-56 pt-4">
          {messages.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center text-center text-sm text-muted-foreground">
              Ask anything to start the conversation.
            </div>
          ) : (
            <ol className="space-y-6">
              {messages.map((message) => {
                const content = getMessageText(message);
                const isUser = message.role === "user";

                if (isUser) {
                  return (
                    <li key={message.id} className="ml-auto max-w-[min(70%,34rem)]">
                      <div className="ml-auto w-fit max-w-full rounded-3xl bg-secondary px-4 py-3 text-sm text-secondary-foreground shadow-sm">
                        <p className="whitespace-pre-wrap break-words">
                          {content || "Unsupported message content."}
                        </p>
                      </div>
                      <div className="mt-1.5 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => void copyMessageText(message)}
                          aria-label="Copy message"
                          title="Copy message"
                        >
                          <CopyIcon className="size-4" />
                        </Button>
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={message.id} className="w-full">
                    <div className="w-full text-sm leading-7 text-foreground">
                      <MessageResponse className="w-full max-w-none">
                        {sanitizeAssistantMarkdown(content || "Unsupported message content.")}
                      </MessageResponse>
                    </div>
                    <div className="mt-1.5 flex justify-start">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => void copyMessageText(message)}
                        aria-label="Copy message"
                        title="Copy message"
                      >
                        <CopyIcon className="size-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}

          {shareUrl ? (
            <p className="mt-4 rounded-lg bg-muted/70 px-3 py-2 text-xs text-muted-foreground" aria-live="polite">
              Share link copied: {shareUrl}
            </p>
          ) : null}

          {shareError ? (
            <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {shareError}
            </p>
          ) : null}

            {error ? (
              <p className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {error.message || "Chat request failed."}
              </p>
            ) : null}
          </div>
        </div>

        {!isSharedReadonly ? (
          <>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/95 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-4">
              <div className="mx-auto w-full max-w-4xl">
                <PromptInput
                  onSubmit={async ({ text: inputText }) => {
                    await submitMessage(inputText);
                  }}
                  className="rounded-3xl bg-background/95 shadow-lg backdrop-blur"
                >
                  <PromptInputBody>
                    <PromptInputTextarea
                      aria-label="Message"
                      value={text}
                      onChange={(event) => setText(event.currentTarget.value)}
                      placeholder="Message AI…"
                      className="min-h-20"
                    />
                  </PromptInputBody>

                  <PromptInputFooter>
                    <PromptInputTools>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-8 gap-2 rounded-md px-2 text-xs",
                          webSearchEnabled ? "bg-accent text-foreground" : "text-muted-foreground"
                        )}
                        aria-label="Toggle web search"
                        aria-pressed={webSearchEnabled}
                        onClick={() => setWebSearchEnabled((prev) => !prev)}
                      >
                        <GlobeIcon className="size-3.5" />
                        <span>{webSearchEnabled ? "Web On" : "Web Off"}</span>
                      </Button>
                      <ModelSelector open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
                        <ModelSelectorTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-2 rounded-md px-2 text-xs"
                            aria-label="Select model"
                          >
                            <ModelSelectorLogo provider={selectedModel.provider} />
                            <span>{selectedModel.label}</span>
                            <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
                          </Button>
                        </ModelSelectorTrigger>
                        <ModelSelectorContent title="Select chat model">
                          <ModelSelectorInput placeholder="Search model…" />
                          <ModelSelectorList>
                            <ModelSelectorEmpty>No model found.</ModelSelectorEmpty>
                            <ModelSelectorGroup heading="Available Models">
                              {CHAT_MODELS.map((item) => (
                                <ModelSelectorItem
                                  key={item.alias}
                                  value={`${item.label} ${item.description}`}
                                  onSelect={() => {
                                    setModel(item.alias);
                                    setIsModelDialogOpen(false);
                                  }}
                                  className="gap-2"
                                >
                                  <ModelSelectorLogo provider={item.provider} />
                                  <ModelSelectorName>{item.label}</ModelSelectorName>
                                  <span className="text-xs text-muted-foreground">
                                    {item.description}
                                  </span>
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto size-4",
                                      model === item.alias ? "opacity-100" : "opacity-0"
                                    )}
                                    aria-hidden
                                  />
                                </ModelSelectorItem>
                              ))}
                            </ModelSelectorGroup>
                          </ModelSelectorList>
                        </ModelSelectorContent>
                      </ModelSelector>
                    </PromptInputTools>

                    <PromptInputSubmit
                      status={status}
                      onStop={stop}
                      disabled={!canSend && !isSending}
                      className="rounded-full"
                    />
                  </PromptInputFooter>
                </PromptInput>
              </div>
            </div>
          </>
        ) : (
          <p className="absolute inset-x-0 bottom-0 px-4 pb-4 text-center text-xs text-muted-foreground">
            This is a shared read-only conversation.
          </p>
        )}
      </div>
    </section>
  );
}
