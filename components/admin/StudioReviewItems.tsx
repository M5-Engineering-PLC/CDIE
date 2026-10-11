// Dashboard, Design Studio: the review's entry for each changed workshop area, with before and after. Internal tooling.
// Fix plan 2026-10-11, D7: "Electronics photographs: new order 2, 1, 3", each with a before and after preview.

import type { ReviewItem } from "@/components/admin/drafts/ReviewDialog";
import { describe, tilesOf, type AreaSummary, type Photo, type StudioArea, type StudioDraft } from "@/lib/admin/studioDraft";

function Thumbs({ photos }: { photos: Photo[] }) {
  return (
    <ol className="flex flex-wrap gap-1">
      {photos.map((photo, index) => (
        <li key={`${index}:${photo.src}`} className="relative h-12 w-16 bg-raise">
          {/* eslint-disable-next-line @next/next/no-img-element -- uploads and unsaved files, not optimised */}
          <img src={photo.src} alt={photo.alt} title={photo.alt} className="absolute inset-0 h-full w-full object-cover" />
          <span className="absolute bottom-0 left-0 bg-surface px-1 font-mono text-fine text-ink-2">{index + 1}</span>
        </li>
      ))}
    </ol>
  );
}

export function studioReviewItems(changed: { area: StudioArea; summary: AreaSummary }[], draft: StudioDraft): ReviewItem[] {
  return changed.map(({ area, summary }) => ({
    id: area.id,
    lines: describe(area.name, summary),
    before: <Thumbs photos={area.photos} />,
    after: <Thumbs photos={tilesOf(area, draft).filter((tile) => !tile.deleted)} />,
  }));
}
