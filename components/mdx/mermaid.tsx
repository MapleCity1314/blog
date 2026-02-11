"use client";

import React, { useEffect, useRef } from "react";
import mermaid from "mermaid";

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: true,
      theme: "dark", // 或者 'neutral'
      securityLevel: "loose",
    });
    
    if (ref.current) {
      mermaid.contentLoaded();
    }
  }, []);

  useEffect(() => {
      if (ref.current) {
          // 清空旧内容并重新渲染
          ref.current.innerHTML = chart;
          ref.current.removeAttribute("data-processed");
          mermaid.init(undefined, ref.current).catch((e: Error) => console.error(e));
      }
  }, [chart]);

  return (
    <div className="my-12 flex justify-center bg-background/50 p-4 rounded-lg border border-border overflow-x-auto">
      <div className="mermaid" ref={ref}>
        {chart}
      </div>
    </div>
  );
}
