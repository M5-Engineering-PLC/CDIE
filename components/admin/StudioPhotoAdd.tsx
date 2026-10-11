"use client";

// Dashboard, Design Studio: the plus tile that adds a photograph to one workshop area's draft. Internal tooling.
/*
  Review 2026-09-30: "a plus icon to add more images". Choosing a file shows it
  in the tile and reads its size in the browser, which the public page needs to
  frame the photograph at its own shape; the server re-checks both. A
  description is required, because every photograph on the site has one.

  Fix plan 2026-10-11, D7: adding puts the photograph in the draft. It is
  uploaded only when the editor saves, so a photograph that is never saved
  never reaches the repository.
*/

import { useRef, useState } from "react";

export type NewPhoto = { file: File; url: string; alt: string; width: number; height: number };

const input = "border border-line bg-surface px-3 py-2 text-body text-ink";

export function StudioPhotoAdd({ name, disabled, onAdd }: { name: string; disabled: boolean; onAdd: (photo: NewPhoto) => void }) {
  const form = useRef<HTMLFormElement>(null);
  const [chosen, setChosen] = useState<{ file: File; url: string; width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const choose = (file: File | undefined) => {
    // A preview that was never added is let go; one handed to the draft belongs to the draft now.
    if (chosen) URL.revokeObjectURL(chosen.url);
    setChosen(null);
    setError(null);
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setChosen({ file, url, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => setError("That image could not be read. Try another file.");
    image.src = url;
  };

  const add = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const alt = String(new FormData(event.currentTarget).get("alt") ?? "").trim().slice(0, 200);
    if (!chosen) return setError("Choose a photograph to add.");
    if (!alt) return setError("Describe the photograph in a sentence, for people who cannot see it.");
    onAdd({ ...chosen, alt });
    form.current?.reset();
    setChosen(null);
    setError(null);
  };

  return (
    <form ref={form} onSubmit={add} className="flex flex-col gap-3 border border-dashed border-line bg-surface p-3">
      <label className="relative grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden bg-raise text-ink-3 transition-colors hover:text-brand">
        {chosen ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local file that is not uploaded yet
          <img src={chosen.url} alt="" className="absolute inset-0 h-full w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-1">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 fill-none stroke-current stroke-2"><path d="M12 5v14M5 12h14" /></svg>
            <span className="text-fine">Add a photograph</span>
          </span>
        )}
        <input
          type="file"
          name="photo"
          required
          disabled={disabled}
          accept="image/jpeg,image/png,image/webp,image/avif"
          aria-label={`Add a photograph of ${name}`}
          className="sr-only"
          onChange={(event) => choose(event.currentTarget.files?.[0])}
        />
      </label>
      <label className="flex flex-col gap-1 text-fine text-ink-2">
        Description *
        <input name="alt" required maxLength={200} disabled={disabled} placeholder="What the photograph shows" className={input} />
      </label>
      {error ? <p role="alert" className="text-fine text-brand">{error}</p> : null}
      <button type="submit" disabled={disabled || !chosen} className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
        Add to the draft
      </button>
    </form>
  );
}
