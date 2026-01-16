"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./frame-sequence.module.css";

export type FrameSequenceConfig = {
  fps?: number;
  speedMultiplier?: number;
  scaleX?: number;
  scaleY?: number;
  ariaLabel?: string;
  pauseOnHover?: boolean;
};

export type FrameSequenceBorderStyle = {
  outlineColor?: string;
  glowColor?: string;
  strokeWidthPx?: number;
};

type FrameSequencePlayerProps = {
  frames: string[];
  config?: FrameSequenceConfig;
  borderStyle?: FrameSequenceBorderStyle;
};

const DEFAULT_FPS = 60;
const DEFAULT_SPEED_MULTIPLIER = 2;

export default function FrameSequencePlayer({
  frames,
  config,
  borderStyle,
}: FrameSequencePlayerProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const lastTimeRef = useRef(0);
  const indexRef = useRef(0);

  const fps = config?.fps ?? DEFAULT_FPS;
  const speedMultiplier = config?.speedMultiplier ?? DEFAULT_SPEED_MULTIPLIER;
  const scaleX = config?.scaleX ?? 1;
  const scaleY = config?.scaleY ?? 1;
  const ariaLabel = config?.ariaLabel ?? "Animated ghost";
  const pauseOnHover = config?.pauseOnHover ?? false;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (frames.length < 2) {
      return undefined;
    }

    const frameDuration = (1000 / fps) * speedMultiplier;

    const tick = (now: number) => {
      if (isPaused) {
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
      }

      const elapsed = now - lastTimeRef.current;
      if (elapsed >= frameDuration) {
        indexRef.current = (indexRef.current + 1) % frames.length;
        setFrameIndex(indexRef.current);
        lastTimeRef.current = now - (elapsed % frameDuration);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [frames.length, fps, isPaused, speedMultiplier]);

  const outlineVars = useMemo(
    () => ({
      ["--frame-outline" as string]: borderStyle?.outlineColor ?? "#3b82f6",
      ["--frame-glow" as string]: borderStyle?.glowColor ?? "rgba(59,130,246,0.6)",
      ["--frame-stroke" as string]: borderStyle?.strokeWidthPx
        ? `${borderStyle.strokeWidthPx}px`
        : "1px",
    }),
    [borderStyle?.glowColor, borderStyle?.outlineColor, borderStyle?.strokeWidthPx]
  );

  const currentFrame = frames[frameIndex] ?? "";

  return (
    <div
      className={styles.root}
      role="img"
      aria-label={ariaLabel}
      style={outlineVars}
      onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
    >
      <pre
        className={styles.frame}
        style={{ transform: `scale(${scaleX}, ${scaleY})` }}
        dangerouslySetInnerHTML={{ __html: currentFrame }}
      />
    </div>
  );
}
