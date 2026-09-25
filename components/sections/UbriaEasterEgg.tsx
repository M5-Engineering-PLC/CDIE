"use client";

// Lucid: About Us > Profiles Team. GIPHY clip selected by CDIE for Eubrea's portrait.
import { useEffect, useRef, useState } from "react";

type Portrait = { src: string; alt: string; width: number; height: number };

const GIPHY_VIDEO = "https://media3.giphy.com/media/r1IMdmkhUcpzy/giphy.mp4";

export function UbriaEasterEgg({ portrait }: { portrait: Portrait }) {
  const [playing, setPlaying] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const lastTouchRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;

    const trigger = triggerRef.current;
    const stop = () => setPlaying(false);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") stop();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      window.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [playing]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="ubria-portrait-trigger"
        aria-label="Double click Eubrea Mitchy Njeri's portrait for a surprise"
        onDoubleClick={() => setPlaying(true)}
        onPointerUp={(event) => {
          if (event.pointerType !== "touch") return;
          const now = Date.now();
          if (now - lastTouchRef.current < 450) setPlaying(true);
          lastTouchRef.current = now;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portrait.src}
          alt={portrait.alt}
          width={portrait.width}
          height={portrait.height}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="aspect-[5/6] w-full bg-raise object-cover"
        />
      </button>
      {playing && (
        <div className="ubria-video-overlay" aria-label="Cristiano Ronaldo video playing over Eubrea's card">
          <video
            src={GIPHY_VIDEO}
            className="ubria-video"
            aria-label="Cristiano Ronaldo celebrating"
            autoPlay
            muted
            loop
            playsInline
            onPlaying={() => {
              if (timerRef.current === null) timerRef.current = window.setTimeout(() => setPlaying(false), 3000);
            }}
            onError={() => setPlaying(false)}
          />
          <button type="button" className="ubria-video-close" aria-label="Close celebration" onClick={() => setPlaying(false)}>×</button>
        </div>
      )}
    </>
  );
}
