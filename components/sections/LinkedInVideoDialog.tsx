"use client";

// Section. Lucid: Media > LinkedIn. Plays a video post in LinkedIn's official embed; no Actual Copy words beyond the labels.
/*
  Revised 2026-10-19: a video post opens its embed in a modal dialog. The
  iframe is mounted only while the dialog is open, so nothing is requested from
  LinkedIn until a reader asks. The native dialog closes on Esc and returns
  focus to the card that opened it. embedUrl is rebuilt from a validated URN
  in content/linkedin.ts.
*/

import { useEffect, useRef } from "react";

export function LinkedInVideoDialog({ embedUrl, title, open, onClose }: {
  embedUrl: string;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog ref={dialog} onClose={onClose} aria-label={`Video: ${title}`}
      className="m-auto w-[min(92vw,32rem)] border border-line bg-surface p-0 text-ink backdrop:bg-ink/70">
      <div className="flex justify-end p-2">
        <button type="button" onClick={onClose}
          className="px-3 py-1 text-fine text-brand hover:text-brand-live focus-visible:outline-2 focus-visible:outline-brand">
          Close<span className="sr-only"> video</span>
        </button>
      </div>
      {open ? (
        <iframe src={embedUrl} title={title} allowFullScreen loading="lazy"
          className="block h-[min(75vh,36rem)] w-full border-0" />
      ) : null}
    </dialog>
  );
}
