"use client";

// Dashboard, Design Studio: the plus tile that adds a photograph to one workshop area. Internal tooling.
/*
  Review 2026-09-30: "a plus icon to add more images". Choosing a file shows it
  in the tile and reads its size in the browser, which the public page needs to
  frame the photograph at its own shape; the server re-checks both. A
  description is required, because every photograph on the site has one.
*/

import { useActionState, useEffect, useRef, useState } from "react";

import { addStudioPhoto } from "@/app/admin/studio-actions";

const input = "border border-line bg-surface px-3 py-2 text-body text-ink";

export function StudioPhotoAdd({ capability, name }: { capability: string; name: string }) {
  const form = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<{ url: string; width: number; height: number } | null>(null);
  const [error, action, pending] = useActionState(async (previous: string | null, data: FormData) => {
    const result = await addStudioPhoto(previous, data);
    if (!result) {
      form.current?.reset();
      setPreview(null);
    }
    return result;
  }, null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview]);

  const choose = (file: File | undefined) => {
    if (!file) return setPreview(null);
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setPreview({ url, width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => setPreview(null);
    image.src = url;
  };

  return (
    <form ref={form} action={action} className="flex flex-col gap-3 border border-dashed border-line bg-surface p-3">
      <input type="hidden" name="capability" value={capability} />
      <input type="hidden" name="width" value={preview?.width ?? ""} />
      <input type="hidden" name="height" value={preview?.height ?? ""} />
      <label className="relative grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden bg-raise text-ink-3 transition-colors hover:text-brand">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local file that is not uploaded yet
          <img src={preview.url} alt="" className="absolute inset-0 h-full w-full object-contain" />
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
          accept="image/jpeg,image/png,image/webp,image/avif"
          aria-label={`Add a photograph of ${name}`}
          className="sr-only"
          onChange={(event) => choose(event.currentTarget.files?.[0])}
        />
      </label>
      <label className="flex flex-col gap-1 text-fine text-ink-2">
        Description *
        <input name="alt" required maxLength={200} placeholder="What the photograph shows" className={input} />
      </label>
      {error ? <p role="alert" className="text-fine text-brand">{error}</p> : null}
      <button type="submit" disabled={pending || !preview} className="bg-brand px-4 py-2 text-body font-semibold text-surface transition hover:bg-brand-live disabled:opacity-50">
        {pending ? "Adding…" : "Add photograph"}
      </button>
    </form>
  );
}
