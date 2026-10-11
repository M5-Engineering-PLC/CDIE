"use client";

// Dashboard drafts: every pending change, before and after, ahead of one save. Internal tooling.
/*
  Fix plan 2026-10-11, D7: Review changes lists each change with what it
  replaces, an undo for that change alone, and Save now, which sends the whole
  set at once. An error from the save is shown against the change it names.
*/

import { useEffect, useRef } from "react";

export type ReviewItem = { id: string; lines: string[]; before: React.ReactNode; after: React.ReactNode };

export function ReviewDialog({ open, items, pending, error, errorFor, onUndo, onSave, onClose }: {
  open: boolean;
  items: ReviewItem[];
  pending: boolean;
  error: string | null;
  /** The item the error belongs to, if it names one. */
  errorFor?: string;
  onUndo: (id: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  const general = error && !items.some((item) => item.id === errorFor) ? error : null;

  return (
    <dialog ref={dialog} onClose={onClose} onCancel={(event) => { if (pending) event.preventDefault(); }} aria-labelledby="review-title"
      className="m-auto max-h-[85vh] w-full max-w-3xl border border-line bg-surface p-0 text-ink backdrop:bg-ink/50">
      <div className="flex flex-col gap-5 p-6">
        <h2 id="review-title" className="text-head text-ink">Review changes</h2>
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 border border-line p-4">
              <div className="flex items-start gap-3">
                <ul className="min-w-0 flex-1 text-body text-ink">
                  {item.lines.map((line) => <li key={line}>{line}</li>)}
                </ul>
                <button type="button" onClick={() => onUndo(item.id)} disabled={pending}
                  className="shrink-0 text-fine text-brand hover:text-brand-live disabled:opacity-50">
                  Undo
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1"><p className="kicker">Before</p>{item.before}</div>
                <div className="flex flex-col gap-1"><p className="kicker">After</p>{item.after}</div>
              </div>
              {error && errorFor === item.id ? <p role="alert" className="text-fine text-brand">{error}</p> : null}
            </li>
          ))}
        </ul>
        {general ? <p role="alert" className="text-fine text-brand">{general}</p> : null}
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} disabled={pending}
            className="border border-line bg-surface px-4 py-2 text-body text-ink-2 transition-colors hover:border-brand hover:text-brand disabled:opacity-50">
            Keep editing
          </button>
          <button type="button" onClick={onSave} disabled={pending || items.length === 0}
            className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
            {pending ? "Saving…" : "Save now"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
