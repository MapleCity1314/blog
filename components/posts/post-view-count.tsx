"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

type PostViewCountProps = {
  slug: string;
};

type ViewPayload = {
  slug: string;
  views: number;
};

export function PostViewCount({ slug }: PostViewCountProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function trackView() {
      try {
        const response = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
          method: "POST",
        });
        if (!response.ok) return;
        const data = (await response.json()) as ViewPayload;
        if (isMounted) setViews(data.views);
      } catch {
        // Ignore network errors for view tracking.
      }
    }

    trackView();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <span
      className="flex items-center gap-1.5"
      aria-live="polite"
      aria-label={views === null ? "Views loading" : `Views ${views}`}
    >
      <Eye size={12} />
      {views === null ? "VIEWS: --" : `VIEWS: ${views.toLocaleString()}`}
    </span>
  );
}
