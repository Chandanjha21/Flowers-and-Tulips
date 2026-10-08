"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoAsset } from "@/types";
import { cn } from "@/lib/cn";
import { Pause, Play } from "./Icons";

/**
 * Muted, looping, inline background video.
 * - Source is attached only when the element nears the viewport (or immediately with `eager`).
 * - Always autoplays (muted) once visible, including for reduced-motion users; the pause button covers them.
 * - Exposes a visible pause/play control (WCAG 2.2.2).
 */
export function LazyVideo({
  video,
  className,
  eager = false,
  controlsClassName,
}: {
  video: VideoAsset;
  className?: string;
  eager?: boolean;
  controlsClassName?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [near, setNear] = useState(eager);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Never compete with first paint: attach the video source only after the page has loaded.
    let loaded = document.readyState === "complete";
    let visible = false;
    const attach = () => {
      if (!loaded || !visible) return;
      setSrc(video.src);
      el.play().catch(() => {});
    };
    const onLoad = () => {
      loaded = true;
      attach();
    };
    window.addEventListener("load", onLoad, { once: true });
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          setNear(true);
          attach();
        } else {
          el.pause();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.removeEventListener("load", onLoad);
    };
  }, [video.src]);

  const toggle = () => {
    const el = ref.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  return (
    <>
      <video
        ref={ref}
        className={cn("h-full w-full object-cover", className)}
        poster={near ? video.poster : undefined}
        src={src}
        muted
        loop
        playsInline
        preload="none"
        autoPlay={false}
        aria-label={video.label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedData={(e) => {
          e.currentTarget.play().catch(() => {});
        }}
      />
      <button
        type="button"
        onClick={toggle}
        className={cn(
          "on-dark absolute bottom-4 right-4 z-10 flex size-11 items-center justify-center rounded-full bg-ink/30 text-ivory ring-1 ring-ivory/40 backdrop-blur-sm transition-colors duration-500 hover:bg-ink/50",
          controlsClassName,
        )}
        aria-label={playing ? "Pause video" : "Play video"}
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
    </>
  );
}
