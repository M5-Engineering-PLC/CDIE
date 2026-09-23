"use client";

// Lucid: Media > Events Calendar. Copy: MEDIA. Layout reference: gt-world-challenge.com/calendar.
/*
  Revised 2026-09-23: "remodel the events calendar to match the calendar on
  gt-world-challenge.com. Cards should be created for all events but only the
  three most recent are displayed. The user is able to scroll horizontally
  through other previous events. The scroll animation should be similar to the
  one used in From our Community."

  One card per event, in date order, on a single track. The window opens on
  the three most recent events that have started; earlier ones wait to the
  left and anything upcoming to the right. The arrows, a swipe, a sideways
  trackpad scroll and the keyboard move the window one card at a time, and
  cards leaving it shrink and fade on the same curve as the LinkedIn fan.
  Card anatomy follows the reference: photograph, a date block overlapping
  it, a type tag, the title, a supporting line and an Event info footer.
  The geometry is .cal-* in app/globals.css.
*/

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { EventCard, type CalendarCardEvent } from "./EventCard";

export type { CalendarCardEvent };

const SWIPE_PX = 48;

const wide = (change: () => void) => {
  const queries = ["(min-width: 1024px)", "(min-width: 640px)"].map((q) => window.matchMedia(q));
  queries.forEach((q) => q.addEventListener("change", change));
  return () => queries.forEach((q) => q.removeEventListener("change", change));
};
const perView = () => (window.matchMedia("(min-width: 1024px)").matches ? 3 : window.matchMedia("(min-width: 640px)").matches ? 2 : 1);

export function EventCalendar({ items, today, fallbackImage }: { items: CalendarCardEvent[]; today: string; fallbackImage: string }) {
  const events = [...items].sort((a, b) => a.start.localeCompare(b.start));
  const shown = useSyncExternalStore(wide, perView, () => 3);
  const started = events.filter((event) => event.start <= today).length;
  const max = Math.max(0, events.length - shown);
  const [pos, setPos] = useState<number | null>(null);
  const at = Math.min(max, Math.max(0, pos ?? started - shown));
  const go = (next: number) => setPos(Math.min(max, Math.max(0, next)));
  const down = useRef<number | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const wheelLock = useRef(0);

  // A sideways trackpad or shift-wheel scroll steps the window, one card per gesture.
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      const dx = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.shiftKey ? event.deltaY : 0;
      if (Math.abs(dx) < 8) return;
      event.preventDefault();
      const now = Date.now();
      if (now - wheelLock.current < 450) return;
      wheelLock.current = now;
      setPos((current) => Math.min(max, Math.max(0, (current ?? at) + (dx > 0 ? 1 : -1))));
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [at, max]);

  if (events.length === 0) return null;

  return (
    <div className="cal" aria-roledescription="carousel" aria-label="Events calendar">
      <div
        ref={stage}
        className="cal-stage"
        onPointerDown={(event) => { down.current = event.clientX; }}
        onPointerUp={(event) => {
          const start = down.current;
          down.current = null;
          if (start !== null && Math.abs(event.clientX - start) >= SWIPE_PX) go(at + (event.clientX < start ? 1 : -1));
        }}
        onPointerCancel={() => { down.current = null; }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(at + 1);
          if (event.key === "ArrowLeft") go(at - 1);
        }}
      >
        <ol className="cal-track" style={{ "--pos": at, "--per": shown } as React.CSSProperties}>
          {events.map((event, index) => {
            const rel = index - at;
            const inView = rel >= 0 && rel < shown;
            const depth = inView ? 0 : rel < 0 ? -rel : rel - shown + 1;
            return (
              <li key={event.id} className="cal-slot" data-out={!inView || undefined} style={{ "--depth": Math.min(depth, 3) } as React.CSSProperties} aria-hidden={!inView}>
                <EventCard event={event} today={today} fallbackImage={fallbackImage} focusable={inView} />
              </li>
            );
          })}
        </ol>
      </div>
      <div className="cal-controls">
        <p className="cal-count" aria-live="polite">
          {events.length > shown ? `${at + 1}–${Math.min(at + shown, events.length)} of ${events.length} events` : `${events.length} events`}
        </p>
        <button type="button" className="cal-arrow" aria-label="Earlier events" disabled={at === 0} onClick={() => go(at - 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" className="cal-arrow" aria-label="Later events" disabled={at >= max} onClick={() => go(at + 1)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
