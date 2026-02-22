"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquarePlusIcon, MessagesSquareIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ConversationSummary = {
  chatId: string;
  lastMessageAt: string;
  messageCount: number;
};

function formatLastMessageAt(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat(undefined, {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function ChatShell({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSharedReadonly = Boolean(searchParams.get("share"));

  useEffect(() => {
    if (isSharedReadonly) {
      setConversations([]);
      setLoading(false);
      return;
    }

    let disposed = false;
    async function loadConversations() {
      setLoading(true);
      try {
        const response = await fetch("/api/chat/conversations", {
          cache: "no-store",
        });
        if (!response.ok) {
          setConversations([]);
          return;
        }
        const payload = (await response.json()) as {
          conversations?: ConversationSummary[];
        };
        if (!disposed) {
          setConversations(Array.isArray(payload.conversations) ? payload.conversations : []);
        }
      } finally {
        if (!disposed) {
          setLoading(false);
        }
      }
    }

    void loadConversations();
    return () => {
      disposed = true;
    };
  }, [isSharedReadonly, pathname]);

  function openNewConversation() {
    router.push(`/c/${crypto.randomUUID()}`);
  }

  return (
    <section className="grid h-full w-full grid-cols-1 bg-background md:grid-cols-[20rem_1fr]">
      <aside className="border-b border-border/70 bg-muted/15 md:border-r md:border-b-0">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b border-border/70 p-4">
            <div className="mb-3 flex items-center gap-2">
              <MessagesSquareIcon className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Conversations</h2>
            </div>
            <Button
              type="button"
              onClick={openNewConversation}
              className="h-10 w-full justify-start gap-2"
              variant="outline"
            >
              <MessageSquarePlusIcon className="size-4" />
              New Chat
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <nav aria-label="Conversation list" className="p-2">
              {loading ? (
                <p className="px-2 py-3 text-xs text-muted-foreground">Loading…</p>
              ) : conversations.length === 0 ? (
                <p className="px-2 py-3 text-xs text-muted-foreground">No conversations yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {conversations.map((item) => {
                    const href = `/c/${item.chatId}`;
                    const active = pathname === href;
                    return (
                      <li key={item.chatId}>
                        <Link
                          href={href}
                          className={cn(
                            "block rounded-lg border px-3 py-2.5 text-xs transition",
                            active
                              ? "border-foreground/25 bg-accent"
                              : "border-transparent hover:border-border/70 hover:bg-accent/70"
                          )}
                        >
                          <p className="truncate font-mono text-[11px]">{item.chatId}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {item.messageCount} messages · {formatLastMessageAt(item.lastMessageAt)}
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </nav>
          </ScrollArea>
        </div>
      </aside>
      <div className="min-h-0">{children}</div>
    </section>
  );
}
