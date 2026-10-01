// Lucid: Media > Events Calendar. Which events a calendar opens on.
/*
  Request 2026-10-01: "even if an event is scheduled later it should show up".
  The window opens on the soonest upcoming events, up to its width, and fills
  the rest with the most recent that have started. Media and Programmes both
  use this, so they always open on the same cards.
*/

/** Index of the first card in view, for events sorted oldest first. */
export function openingIndex(sortedStarts: string[], today: string, shown: number) {
  const started = sortedStarts.filter((start) => start <= today).length;
  const upcoming = sortedStarts.length - started;
  return Math.max(0, Math.min(sortedStarts.length - shown, started - shown + Math.min(upcoming, shown)));
}
