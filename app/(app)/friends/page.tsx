"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AddFriendButton } from "@/components/friends/add-friend-button";
import { AddFriendModal } from "@/components/friends/add-friend-modal";
import { AccessRequestModal } from "@/components/friends/access-request-modal";
import { MY_SITE_INFO } from "@/components/friends/constants";
import { FriendCard } from "@/components/friends/friend-card";
import { FriendsBackground } from "@/components/friends/friends-background";
import { FriendsFooter } from "@/components/friends/friends-footer";
import { FriendsHeader } from "@/components/friends/friends-header";
import type { AccessStatus, Friend } from "@/components/friends/types";

export default function NeuralBladesFriends() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [canAdd, setCanAdd] = useState(false);
  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>({ state: "idle" });
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
        setIsAccessModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadFriends = async () => {
      setIsLoadingFriends(true);
      try {
        const response = await fetch("/api/friends", { cache: "no-store" });
        const data = (await response.json()) as { friends?: Friend[] };
        if (!isMounted) return;
        const list = data.friends ?? [];
        setFriends(list);
        setActiveId(list[0]?.id ?? null);
      } catch {
        if (isMounted) {
          setFriends([]);
          setActiveId(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFriends(false);
        }
      }
    };
    loadFriends();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const token = searchParams.get("friendAccess");
    if (!token) {
      return;
    }
    let isMounted = true;
    const verifyToken = async () => {
      setAccessStatus({ state: "checking" });
      try {
        const response = await fetch(`/api/friends/access?token=${encodeURIComponent(token)}`);
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          if (isMounted) {
            setAccessStatus({ state: "rejected", message: data.error ?? "Access denied." });
          }
          return;
        }
        if (isMounted) {
          setAccessToken(token);
          setCanAdd(true);
          setAccessStatus({ state: "approved", message: "Access confirmed." });
          router.replace("/friends", { scroll: false });
        }
      } catch {
        if (isMounted) {
          setAccessStatus({ state: "rejected", message: "Access check failed." });
        }
      }
    };
    verifyToken();
    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  const activeFriend = useMemo(() => friends.find((friend) => friend.id === activeId), [friends, activeId]);

  const handleCopyMyInfo = async () => {
    try {
      const textToCopy = JSON.stringify(MY_SITE_INFO, null, 2);
      let didCopy = false;
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        didCopy = true;
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        didCopy = document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      if (didCopy) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        console.error("Copy failed: clipboard API not available.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-500 overflow-hidden flex flex-col items-center justify-center p-4 md:p-10">
      <FriendsBackground activeId={activeId} activeColor={activeFriend?.color} />
      <FriendsHeader />

      <main className="relative z-10 w-full max-w-7xl h-[600px] md:h-[500px] flex flex-col md:flex-row gap-2 md:gap-4">
        {friends.map((friend) => (
          <FriendCard
            key={friend.id}
            friend={friend}
            isActive={activeId === friend.id}
            onActivate={(id) => setActiveId(id)}
          />
        ))}

        <AddFriendButton
          canAdd={canAdd}
          onClick={() => (canAdd ? setIsModalOpen(true) : setIsAccessModalOpen(true))}
        />
      </main>

      <FriendsFooter isCopied={isCopied} onCopy={handleCopyMyInfo} />

      {isLoadingFriends ? null : friends.length === 0 ? (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 text-xs font-mono text-zinc-400">
          No nodes yet. Request access to add the first link.
        </div>
      ) : null}

      <AddFriendModal
        accessToken={accessToken}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          setCanAdd(false);
          setAccessToken(null);
          setAccessStatus({ state: "idle" });
          fetch("/api/friends", { cache: "no-store" })
            .then((response) => response.json())
            .then((data: { friends?: Friend[] }) => {
              const list = data.friends ?? [];
              setFriends(list);
              setActiveId(list[0]?.id ?? null);
            })
            .catch(() => {
              setFriends([]);
              setActiveId(null);
            });
        }}
      />
      <AccessRequestModal
        accessStatus={accessStatus}
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
      />
    </div>
  );
}
