"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ADMIN_TOAST_DESC_QUERY_KEY,
  ADMIN_TOAST_QUERY_KEY,
  ADMIN_TOAST_TYPE_QUERY_KEY,
  type AdminToastType,
} from "@/lib/admin/toast";

export default function AdminToastBridge() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastToastRef = useRef<string | null>(null);

  useEffect(() => {
    const message = searchParams.get(ADMIN_TOAST_QUERY_KEY);
    const type = (searchParams.get(ADMIN_TOAST_TYPE_QUERY_KEY) ?? "info") as AdminToastType;
    const description = searchParams.get(ADMIN_TOAST_DESC_QUERY_KEY) ?? undefined;

    if (!message) {
      return;
    }

    const toastKey = `${type}:${message}:${description ?? ""}`;
    if (lastToastRef.current === toastKey) {
      return;
    }
    lastToastRef.current = toastKey;

    if (type === "success") {
      toast.success(message, { description });
    } else if (type === "error") {
      toast.error(message, { description });
    } else {
      toast(message, { description });
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete(ADMIN_TOAST_QUERY_KEY);
    nextParams.delete(ADMIN_TOAST_TYPE_QUERY_KEY);
    nextParams.delete(ADMIN_TOAST_DESC_QUERY_KEY);
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  return null;
}
